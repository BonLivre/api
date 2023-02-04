import { Injectable, NotFoundException } from '@nestjs/common'
import { Celebrity, Industry } from '@prisma/client'
import { PaginatedDto } from '~/common/dto/paginated.dto'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { BooksService } from '../books/books.service'
import { IndustryDto } from '../industries/dto/industry.dto'
import { IndustriesService } from '../industries/industries.service'
import { NUMBER_CELEBRITIES_PER_PAGE } from './constants'
import { CelebrityWithBooksDto } from './dto/celebrity-with-books.dto'
import { CelebrityDto } from './dto/celebrity.dto'
import { QueryCelebritiesDto } from './dto/query-celebrities.dto'

@Injectable()
export class CelebritiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileManagerService: FileManagerService,
    private readonly booksService: BooksService,
    private readonly industriesService: IndustriesService,
  ) {}

  private async formatCelebrity(celebrity: Celebrity & { industries: Industry[] }): Promise<CelebrityDto> {
    const industries: IndustryDto[] = celebrity.industries.map((industry) =>
      this.industriesService.formatIndustry(industry),
    )

    return {
      id: celebrity.id,
      name: celebrity.name,
      photoUrl: await this.fileManagerService.getFileUrl('celebrities', celebrity.photo),
      industries,
    }
  }

  private async computerNumberOfPages(queryCelebritiesDto: QueryCelebritiesDto) {
    const numberOfBooks = await this.prisma.celebrity.aggregate({
      _count: { id: true },
      where: {
        name: { contains: queryCelebritiesDto.search, mode: 'insensitive' },
        industries: queryCelebritiesDto.industry
          ? { some: { name: { contains: queryCelebritiesDto.industry, mode: 'insensitive' } } }
          : undefined,
      },
    })

    const numberOfPages = Math.ceil(numberOfBooks._count.id / NUMBER_CELEBRITIES_PER_PAGE)

    return numberOfPages === 0 ? 1 : numberOfPages
  }

  async findCelebrities(queryCelebritiesDto: QueryCelebritiesDto): Promise<PaginatedDto<CelebrityDto>> {
    if (queryCelebritiesDto.industry === 'all') {
      queryCelebritiesDto.industry = undefined
    }

    const currentPage = queryCelebritiesDto.page || 1
    const numberOfPages = await this.computerNumberOfPages(queryCelebritiesDto)
    const celebrities = await this.prisma.celebrity.findMany({
      skip: (currentPage - 1) * NUMBER_CELEBRITIES_PER_PAGE,
      take: NUMBER_CELEBRITIES_PER_PAGE,
      include: { industries: true },
      where: {
        name: { contains: queryCelebritiesDto.search, mode: 'insensitive' },
        industries: queryCelebritiesDto.industry
          ? { some: { name: { contains: queryCelebritiesDto.industry, mode: 'insensitive' } } }
          : undefined,
      },
    })
    const results = await Promise.all(celebrities.map((celebrity) => this.formatCelebrity(celebrity)))

    return {
      currentPage,
      results,
      numberOfPages,
    }
  }

  async findCelebrity(celebrityId: string): Promise<CelebrityWithBooksDto> {
    const celebrity = await this.prisma.celebrity.findUnique({
      where: { id: celebrityId },
      select: {
        id: true,
        name: true,
        photo: true,
        description: true,
        industries: true,
        website: true,
        twitter: true,
        instagram: true,
        facebook: true,
        createdAt: true,
        updatedAt: true,
        recommendedBooks: {
          select: {
            authors: true,
            genres: true,
            title: true,
            description: true,
            yearOfPublication: true,
            language: true,
            id: true,
            verified: true,
            createdAt: true,
            updatedAt: true,
            readingsListId: true,
            celebrityId: true,
            color: true,
          },
        },
      },
    })

    if (!celebrity) {
      throw new NotFoundException(`Celebrity with id ${celebrityId} not found`)
    }

    return {
      ...(await this.formatCelebrity(celebrity)),
      books: await Promise.all(celebrity.recommendedBooks.map((book) => this.booksService.formatBook(book))),
    }
  }
}
