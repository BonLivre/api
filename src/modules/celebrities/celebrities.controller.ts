import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiPaginatedResponse } from '~/common/api-paginated-response.decorator'
import { PaginatedDto } from '~/common/dto/paginated.dto'
import { CelebritiesService } from './celebrities.service'
import { CelebrityWithBooksDto } from './dto/celebrity-with-books.dto'
import { CelebrityDto } from './dto/celebrity.dto'
import { QueryCelebritiesDto } from './dto/query-celebrities.dto'

@ApiTags('celebrities')
@ApiExtraModels(PaginatedDto, CelebrityDto)
@Controller('celebrities')
export class CelebritiesController {
  constructor(private readonly celebritiesService: CelebritiesService) {}

  @ApiPaginatedResponse(CelebrityDto)
  @ApiOperation({ operationId: 'findCelebrities' })
  @Get()
  findCelebrities(@Query() queryCelebritiesDto: QueryCelebritiesDto): Promise<PaginatedDto<CelebrityDto>> {
    return this.celebritiesService.findCelebrities(queryCelebritiesDto)
  }

  @ApiResponse({ type: CelebrityWithBooksDto })
  @ApiOperation({ operationId: 'findCelebrity' })
  @Get(':celebrityId')
  findCelebrity(@Param('celebrityId') celebrityId: string): Promise<CelebrityWithBooksDto> {
    return this.celebritiesService.findCelebrity(celebrityId)
  }
}
