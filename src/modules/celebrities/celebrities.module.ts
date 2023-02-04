import { Module } from '@nestjs/common'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { BooksModule } from '../books/books.module'
import { IndustriesModule } from '../industries/industries.module'
import { IndustriesService } from '../industries/industries.service'
import { CelebritiesController } from './celebrities.controller'
import { CelebritiesService } from './celebrities.service'

@Module({
  imports: [BooksModule, IndustriesModule],
  controllers: [CelebritiesController],
  providers: [FileManagerService, PrismaService, CelebritiesService, IndustriesService],
})
export class CelebritiesModule {}
