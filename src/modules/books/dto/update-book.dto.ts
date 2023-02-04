import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { CreateBookDto } from './create-book.dto'

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  verified: boolean
}
