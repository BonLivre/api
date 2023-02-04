import { ApiProperty } from '@nestjs/swagger'
import { ReadingsListDto } from './readings-list.dto'

export class FindReadingsListssDto {
  @ApiProperty({ type: [ReadingsListDto] })
  data: ReadingsListDto[]
}
