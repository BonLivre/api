import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { CreateUserDto } from '~auth/dto/create-user.dto'
import { IsOptional } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  photo?: any
}
