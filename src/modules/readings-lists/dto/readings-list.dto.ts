import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BookDto } from '~/modules/books/dto/book.dto'

export class ReadingsListDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiPropertyOptional()
  description: string

  @ApiPropertyOptional()
  tags?: string[]

  @ApiProperty()
  isPublic: boolean

  @ApiProperty()
  isMine: boolean

  @ApiProperty({ type: [BookDto] })
  books: BookDto[]

  @ApiProperty()
  username: string

  @ApiProperty()
  photoUrl: string
}
