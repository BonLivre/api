import { Injectable } from '@nestjs/common'
import { Industry } from '@prisma/client'
import { PrismaService } from '~/common/prisma.service'
import { GetIndustriesDto } from './dto/get-industries.dto'
import { IndustryDto } from './dto/industry.dto'

@Injectable()
export class IndustriesService {
  constructor(private readonly prisma: PrismaService) {}

  formatIndustry(industry: Industry): IndustryDto {
    return {
      name: industry.name,
      job: industry.job,
    }
  }

  async getIndustries(): Promise<GetIndustriesDto> {
    const industries = await this.prisma.industry.findMany({})
    const formattedIndustries = industries.map((industry) => this.formatIndustry(industry))

    return {
      industries: formattedIndustries,
    }
  }
}
