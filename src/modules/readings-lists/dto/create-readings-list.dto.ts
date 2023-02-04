import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsString } from 'class-validator'

export class CreateReadingsListDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiPropertyOptional()
  @IsString()
  description: string

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsBoolean()
  isPublic?: boolean
}
