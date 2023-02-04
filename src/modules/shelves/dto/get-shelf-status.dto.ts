import { ApiProperty } from '@nestjs/swagger'

export class GetShelfStatusDto {
  @ApiProperty()
  status: string | null
}
