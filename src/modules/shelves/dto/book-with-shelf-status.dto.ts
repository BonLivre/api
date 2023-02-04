import { ApiProperty } from '@nestjs/swagger'
import { ShelfItemStatus } from '@prisma/client'
import { BookDto } from '~/modules/books/dto/book.dto'

export class BookWithShelfStatusDto {
  @ApiProperty()
  book: BookDto

  @ApiProperty({ enum: ShelfItemStatus })
  shelfStatus: ShelfItemStatus
}
