import { ApiProperty } from '@nestjs/swagger'
import { BookDto } from '~/modules/books/dto/book.dto'
import { CelebrityDto } from './celebrity.dto'

export class CelebrityWithBooksDto extends CelebrityDto {
  @ApiProperty({ type: [BookDto] })
  books: BookDto[]
}
