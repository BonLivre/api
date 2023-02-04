import { Injectable } from '@nestjs/common'
import { Book, ReadingsList, User } from '@prisma/client'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { BooksService } from '../books/books.service'
import { CreateReadingsListDto } from './dto/create-readings-list.dto'
import { FindReadingsListssDto } from './dto/find-readings-lists.dto'
import { ReadingsListDto } from './dto/readings-list.dto'
import { UpdateReadingsListDto } from './dto/update-readings-list.dto'

@Injectable()
export class ReadingsListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly booksService: BooksService,
    private readonly fileManager: FileManagerService,
  ) {}

  async createReadingsList(user: User, createReadingsListDto: CreateReadingsListDto): Promise<ReadingsListDto> {
    const readingsList = await this.prisma.readingsList.create({
      data: { ...createReadingsListDto, userId: user.id },
      include: { books: true, user: true },
    })
    return this.formatReadingsList(readingsList, true)
  }

  async updateReadingsList(
    user: User,
    readingsListId: string,
    updateReadingsListDto: UpdateReadingsListDto,
  ): Promise<ReadingsListDto> {
    const readingsList = await this.prisma.readingsList.update({
      where: { id: readingsListId, userId: user.id },
      data: updateReadingsListDto,
      include: { books: true, user: true },
    })
    return this.formatReadingsList(readingsList, true)
  }

  private async formatReadingsList(
    readingsList: ReadingsList & { books: Book[]; user: User },
    isMine = false,
  ): Promise<ReadingsListDto> {
    const books = await Promise.all(readingsList.books.map((book) => this.booksService.formatBook(book)))

    return {
      id: readingsList?.id,
      title: readingsList.title,
      description: readingsList.description,
      tags: readingsList.tags,
      isPublic: readingsList.isPublic,
      isMine,
      books,
      username: readingsList.user.username,
      photoUrl: readingsList.user.photo ? await this.fileManager.getFileUrl('photos', readingsList.user.photo) : null,
    }
  }

  async findReadingsListsById(readingsListId: string, user?: User): Promise<ReadingsListDto> {
    const readingsList = await this.prisma.readingsList.findUnique({
      where: { id: readingsListId },
      include: {
        books: { include: { authors: true, genres: true } },
        user: true,
      },
    })

    return this.formatReadingsList(readingsList, user?.id === readingsList.userId)
  }

  async findReadingsLists(currentUser?: User): Promise<FindReadingsListssDto> {
    const readingsLists = await this.prisma.readingsList.findMany({
      where: { isPublic: true },
      include: { books: true, user: true },
    })

    const data: ReadingsListDto[] = await Promise.all(
      readingsLists.map(async (readingsList) =>
        this.formatReadingsList(readingsList, currentUser?.id === readingsList.userId),
      ),
    )

    return { data }
  }

  async findReadingsListsIOwn(currentUser: User): Promise<FindReadingsListssDto> {
    const readingsLists = await this.prisma.readingsList.findMany({
      where: { userId: currentUser.id },
      include: { books: true, user: true },
    })
    const data: ReadingsListDto[] = await Promise.all(
      readingsLists.map(async (readingsList) =>
        this.formatReadingsList(readingsList, currentUser?.id === readingsList.userId),
      ),
    )
    return { data }
  }

  async toggleBookPresenceInReadingsList(currentUser: User, readingsListId: string, bookId: string) {
    const readingsList = await this.prisma.readingsList.findUnique({
      where: { id: readingsListId },
    })

    if (readingsList.userId !== currentUser.id) {
      throw new Error('You are not the owner of this readings list')
    }

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      throw new Error('Book not found')
    }

    const bookInReadingsList = await this.prisma.readingsList.findUnique({
      where: { id: readingsListId },
      select: { books: { where: { id: bookId } } },
    })

    if (bookInReadingsList.books.length === 0) {
      await this.prisma.readingsList.update({
        where: { id: readingsListId },
        data: { books: { connect: { id: bookId } } },
      })
    } else {
      await this.prisma.readingsList.update({
        where: { id: readingsListId },
        data: { books: { disconnect: { id: bookId } } },
      })
    }
  }

  async deleteReadingsList(user: User, readingsListId: string): Promise<void> {
    await this.prisma.readingsList.delete({
      where: { id: readingsListId },
    })
  }
}
