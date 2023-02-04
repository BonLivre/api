import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class BookDto {
  @ApiProperty({
    example: '5f9f5b9b0b9b9c0b9b9b9b9b',
  })
  id: string

  @ApiProperty({
    example: "The Hitchhiker's Guide to the Galaxy",
  })
  title: string

  @ApiProperty({
    example: 1979,
  })
  yearOfPublication: number

  @ApiProperty({
    example: 'en',
  })
  language: string

  @ApiProperty({
    example: ['Douglas Adams'],
  })
  authors: string[]

  @ApiProperty({
    example: ['Science Fiction', 'Comedy'],
  })
  genres: string[]

  @ApiPropertyOptional({
    example: "The Hitchhiker's Guide to the Galaxy is a comedy science fiction series created by Douglas Adams.",
  })
  description?: string

  @ApiProperty({
    example: 'fuchsia',
  })
  color: string

  @ApiProperty({ example: true })
  verified: boolean
}
