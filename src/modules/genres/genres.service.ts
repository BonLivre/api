import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/common/prisma.service'
import { FindAllGenresDto } from './dto/find-all-genres.dto'

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllGenres(): Promise<FindAllGenresDto> {
    const genresData = await this.prisma.genre.findMany()

    // Extract genre names
    let genres = genresData.map((genre) => genre.name)

    // Sort genres alphabetically
    genres = genres.sort()

    return { genres }
  }
}
