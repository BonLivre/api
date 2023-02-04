import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class AddQuoteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text: string
}
