import { ApiProperty } from '@nestjs/swagger'

export class IndustryDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  job: string
}
