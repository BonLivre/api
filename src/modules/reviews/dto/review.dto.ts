import { ApiProperty } from '@nestjs/swagger'

export class ReviewDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  bookId: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  username: string

  @ApiProperty()
  rating: number

  @ApiProperty()
  comment: string

  @ApiProperty()
  photoUrl: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
