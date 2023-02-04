import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, Min, Max, MinLength, MaxLength, IsOptional } from 'class-validator'

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment: string
}
