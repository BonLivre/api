import { BadRequestException, Injectable } from '@nestjs/common'
import { ShelfItemStatus, User } from '@prisma/client'
import { PrismaService } from '~/common/prisma.service'
import { BooksService } from '../books/books.service'
import { BookWithShelfStatusDto } from './dto/book-with-shelf-status.dto'
import { GetBooksFromShelfDto } from './dto/get-books-from-shelf.dto'
import { GetShelfStatusDto } from './dto/get-shelf-status.dto'

@Injectable()
export class ShelvesService {
  constructor(private readonly booksService: BooksService, private readonly prisma: PrismaService) {}

  private isValidStatus(status: string) {
    for (const validStatus of Object.values(ShelfItemStatus)) {
      if (validStatus === status) {
        return true
      }
    }
    return false
  }

  async addBookToShelf(user: User, bookId: string, shelfStatus: string): Promise<GetShelfStatusDto> {
    if (!this.isValidStatus(shelfStatus)) {
      throw new BadRequestException('Invalid shelf status')
    }

    const shelfItem = await this.prisma.shelfItem.findUnique({
      where: { bookId_userId: { bookId, userId: user.id } },
    })

    if (shelfItem) {
      await this.prisma.shelfItem.update({
        where: { id: shelfItem.id },
        data: { status: shelfStatus as ShelfItemStatus },
      })
    } else {
      await this.prisma.shelfItem.create({
        data: { bookId, userId: user.id, status: shelfStatus as ShelfItemStatus },
      })
    }

    return { status: shelfStatus }
  }

  async getShelfStatus(user: User, bookId: string): Promise<GetShelfStatusDto> {
    const shelfItem = await this.prisma.shelfItem.findUnique({
      where: { bookId_userId: { bookId, userId: user.id } },
    })

    return { status: shelfItem?.status ?? null }
  }

  async getBooksFromShelf(user: User): Promise<GetBooksFromShelfDto> {
    const shelfItems = await this.prisma.shelfItem.findMany({
      where: { userId: user.id },
      include: { book: true },
    })

    const books: BookWithShelfStatusDto[] = await Promise.all(
      shelfItems.map(async (shelfItem) => {
        const book = await this.booksService.findBook(shelfItem.book.id)
        return { book, shelfStatus: shelfItem.status }
      }),
    )

    return { books }
  }

  async removeBookFromShelf(user: User, bookId: string): Promise<GetShelfStatusDto> {
    const shelfItem = await this.prisma.shelfItem.findUnique({
      where: { bookId_userId: { bookId, userId: user.id } },
    })

    if (shelfItem) {
      await this.prisma.shelfItem.delete({
        where: { id: shelfItem.id },
      })
    }

    return { status: null }
  }
}
