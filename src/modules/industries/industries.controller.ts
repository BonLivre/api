import { Controller, Get } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetIndustriesDto } from './dto/get-industries.dto'
import { IndustryDto } from './dto/industry.dto'
import { IndustriesService } from './industries.service'

@ApiTags('industries')
@ApiExtraModels(IndustryDto, GetIndustriesDto)
@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @ApiOperation({ operationId: 'getIndustries' })
  @ApiResponse({ type: GetIndustriesDto })
  @Get()
  getIndustries(): Promise<GetIndustriesDto> {
    return this.industriesService.getIndustries()
  }
}
