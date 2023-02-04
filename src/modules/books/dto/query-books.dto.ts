import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator'
import { transformArray } from '~common/constants'
import { SortingMethod } from '../sorting-method.enum'

export class QueryBooksDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(transformArray)
  @IsNumber()
  @IsInt()
  @Min(1)
  page?: number

  @ApiProperty({ required: false })
  @Transform(transformArray)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(3, 100, { each: true })
  genres: string[] = []

  @ApiProperty({ required: false })
  @Transform(transformArray)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(3, 100, { each: true })
  authors: string[] = []

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  language?: string

  @ApiProperty({ required: false, enum: SortingMethod })
  @IsOptional()
  @IsEnum(SortingMethod)
  @MaxLength(100)
  sortingMethod?: SortingMethod
}
