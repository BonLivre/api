import { ApiProperty } from '@nestjs/swagger'
import { BookWithShelfStatusDto } from './book-with-shelf-status.dto'

export class GetBooksFromShelfDto {
  @ApiProperty({ type: [BookWithShelfStatusDto] })
  books: BookWithShelfStatusDto[]
}
