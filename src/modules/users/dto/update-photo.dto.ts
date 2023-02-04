import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdatePhotoDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  photo?: any
}
