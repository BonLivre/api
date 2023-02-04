import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { transformArray } from '~common/constants'

export class QueryCelebritiesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformArray)
  @IsNumber()
  @IsInt()
  @Min(1)
  page?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string
}
