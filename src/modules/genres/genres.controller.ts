import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FindAllGenresDto } from './dto/find-all-genres.dto'
import { GenresService } from './genres.service'

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @ApiOperation({ operationId: 'findAllGenres' })
  @ApiOkResponse({ type: FindAllGenresDto })
  @Get()
  findAllGenres(): Promise<FindAllGenresDto> {
    return this.genresService.findAllGenres()
  }
}
