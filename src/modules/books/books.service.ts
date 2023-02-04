import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Book } from '@prisma/client'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { NUMBER_OF_BOOKS_PER_PAGE } from './constants'
import { CreateBookDto } from './dto/create-book.dto'
import { QueryBooksDto } from './dto/query-books.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BookDto } from './dto/book.dto'
import { BookWithAuthorsAndGenres } from './types'
import { PaginatedDto } from '~/common/dto/paginated.dto'
import { I18nContext } from 'nestjs-i18n'
import { SortingMethod } from './sorting-method.enum'

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService, private readonly minIo: FileManagerService) {}

  private async findOrCreateAuthors(authorNames: string[]) {
    const authors = []
    for (const authorName of authorNames) {
      authors.push(
        await this.prisma.author.upsert({
          where: { name: authorName },
          update: {},
          create: { name: authorName },
        }),
      )
    }
    return authors
  }

  private async findOrCreateGenres(genreNames: string[]) {
    const genres = []
    for (const genreName of genreNames) {
      let genre = await this.prisma.genre.findFirst({ where: { name: genreName } })
      if (!genre) {
        genre = await this.prisma.genre.create({ data: { name: genreName } })
      }

      genres.push(genre)
    }
    return genres
  }

  async addBook(createBookDto: CreateBookDto) {
    const authors = await this.findOrCreateAuthors(createBookDto.authors)
    const genres = await this.findOrCreateGenres(createBookDto.genres)

    const i18n = I18nContext.current()

    try {
      const tailwindColors = [
        'red',
        'orange',
        'yellow',
        'green',
        'teal',
        'blue',
        'indigo',
        'purple',
        'pink',
        'gray',
        'stone',
        'amber',
        'emerald',
        'cyan',
        'sky',
        'violet',
        'fuchsia',
        'rose',
      ]
      const color = tailwindColors[Math.floor(Math.random() * tailwindColors.length)]

      const createdBook = await this.prisma.book.create({
        data: {
          ...createBookDto,
          color,
          authors: {
            connect: authors.map((author) => ({ id: author.id })),
          },
          genres: {
            connect: genres.map((genre) => ({ id: genre.id })),
          },
        },
        include: { authors: true, genres: true },
      })

      return this.formatBook(createdBook)
    } catch {
      throw new ConflictException(i18n.translate('errors.books.bookAlreadyExists'))
    }
  }

  private async computerNumberOfPages(query: any) {
    const numberOfBooks = await this.prisma.book.aggregate({
      ...query,
      _count: { id: true },
    })

    if (numberOfBooks._count === true) {
      const i18n = I18nContext.current()

      throw new InternalServerErrorException(i18n.translate('errors.books.couldNotCountBooks'))
    }

    const numberOfPages = Math.ceil(numberOfBooks._count.id / NUMBER_OF_BOOKS_PER_PAGE)

    return numberOfPages === 0 ? 1 : numberOfPages
  }

  async formatBook(book: Book | BookWithAuthorsAndGenres): Promise<BookDto> {
    const bookDto: BookDto = {
      id: book.id,
      title: book.title,
      yearOfPublication: book.yearOfPublication,
      language: book.language,
      authors: (book as BookWithAuthorsAndGenres).authors
        ? (book as BookWithAuthorsAndGenres).authors.map((author) => author.name)
        : [],
      genres: (book as BookWithAuthorsAndGenres).genres
        ? (book as BookWithAuthorsAndGenres).genres.map((genre) => genre.name)
        : [],
      description: book.description,
      color: book?.color,
      verified: book.verified,
    }

    return bookDto
  }

  async queryBooks(queryBooksDto: QueryBooksDto): Promise<PaginatedDto<BookDto>> {
    const where: any = {
      // verified: true,
      OR: [
        { title: { contains: queryBooksDto.search || '', mode: 'insensitive' } },
        { authors: { some: { name: { contains: queryBooksDto.search || '', mode: 'insensitive' } } } },
      ],
      genres: { some: { name: { contains: queryBooksDto.genres.join(','), mode: 'insensitive' } } },
      language: { contains: queryBooksDto.language || '', mode: 'insensitive' },
    }

    if (!queryBooksDto.page) {
      queryBooksDto.page = 1
    }

    const orderBy = {}
    if (queryBooksDto.sortingMethod === SortingMethod.NEWEST) {
      orderBy['yearOfPublication'] = 'desc'
    } else if (queryBooksDto.sortingMethod === SortingMethod.OLDEST) {
      orderBy['yearOfPublication'] = 'asc'
    }

    const books = await this.prisma.book.findMany({
      where,
      take: NUMBER_OF_BOOKS_PER_PAGE,
      skip: (queryBooksDto.page - 1) * NUMBER_OF_BOOKS_PER_PAGE,
      include: { authors: true, genres: true },
      orderBy,
    })

    const numberOfPages = await this.computerNumberOfPages({ where })

    const results: BookDto[] = []

    for (const book of books) {
      results.push(await this.formatBook(book))
    }

    return { results, numberOfPages, currentPage: queryBooksDto.page }
  }

  async findBook(id: string): Promise<BookDto> {
    const i18n = I18nContext.current()

    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        authors: true,
        genres: true,
      },
    })

    if (!book) {
      throw new NotFoundException(i18n.translate('errors.books.bookNotFound'))
    }

    return this.formatBook(book)
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<BookDto> {
    const i18n = I18nContext.current()

    const data: any = updateBookDto

    if (updateBookDto.authors) {
      const authors = await this.findOrCreateAuthors(updateBookDto.authors)
      data.authors = {
        set: [],
        connect: authors.map((author) => ({ id: author.id })),
      }
    }

    if (updateBookDto.genres) {
      const genres = await this.findOrCreateGenres(updateBookDto.genres)
      data.genres = {
        set: [],
        connect: genres.map((genre) => ({ id: genre.id })),
      }
    }

    try {
      const updatedBook = await this.prisma.book.update({
        where: { id },
        data,
        include: { authors: true, genres: true },
      })

      return this.formatBook(updatedBook)
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(i18n.translate('errors.books.bookAlreadyExists'))
      }

      throw new NotFoundException(i18n.translate('errors.books.bookNotFound'))
    }
  }

  async removeBook(id: string): Promise<void> {
    const i18n = I18nContext.current()

    try {
      await this.prisma.book.delete({
        where: { id },
      })
    } catch {
      throw new NotFoundException(i18n.translate('errors.books.bookNotFound'))
    }
  }
}
