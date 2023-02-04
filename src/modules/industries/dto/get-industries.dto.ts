import { ApiProperty } from '@nestjs/swagger'
import { IndustryDto } from './industry.dto'

export class GetIndustriesDto {
  @ApiProperty()
  industries: IndustryDto[]
}
