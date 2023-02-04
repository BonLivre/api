import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { VoteType } from '@prisma/client'

export class QuoteDto {
  @ApiProperty()
  text: string

  @ApiProperty()
  numberOfUpvotes: number

  @ApiProperty()
  numberOfDownvotes: number

  @ApiPropertyOptional({ type: VoteType })
  userVote?: VoteType
}
