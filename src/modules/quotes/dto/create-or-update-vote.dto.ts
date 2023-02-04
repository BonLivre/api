import { ApiPropertyOptional } from '@nestjs/swagger'
import { VoteType } from '@prisma/client'
import { IsEnum, IsOptional } from 'class-validator'

export class CreateOrUpdateVoteDto {
  @ApiPropertyOptional({ enum: VoteType })
  @IsOptional()
  @IsEnum(VoteType)
  type?: VoteType
}
