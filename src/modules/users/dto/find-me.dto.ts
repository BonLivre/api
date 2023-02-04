import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class FindMeDto {
  @ApiProperty()
  settings: {
    email: string
    firstName: string
    lastName: string
    username: string
  }

  @ApiPropertyOptional()
  photoUrl?: string
}
