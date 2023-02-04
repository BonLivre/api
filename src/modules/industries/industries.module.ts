import { Module } from '@nestjs/common'
import { PrismaService } from '~/common/prisma.service'
import { IndustriesController } from './industries.controller'
import { IndustriesService } from './industries.service'

@Module({
  controllers: [IndustriesController],
  providers: [IndustriesService, PrismaService],
})
export class IndustriesModule {}
