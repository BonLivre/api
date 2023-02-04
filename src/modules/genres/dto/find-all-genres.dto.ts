import { ApiProperty } from '@nestjs/swagger'

export class FindAllGenresDto {
  @ApiProperty({
    example: ['action', 'adventure', 'comedy', 'drama', 'fantasy', 'horror', 'mystery', 'romance', 'thriller'],
  })
  genres: string[]
}
