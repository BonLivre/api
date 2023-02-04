import { ApiProperty } from '@nestjs/swagger'
import { IndustryDto } from '~/modules/industries/dto/industry.dto'

export class CelebrityDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  photoUrl: string

  @ApiProperty({ type: [IndustryDto] })
  industries: IndustryDto[]
}
