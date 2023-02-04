import { Module } from '@nestjs/common'
import { GenresService } from './genres.service'
import { GenresController } from './genres.controller'
import { PrismaService } from '~/common/prisma.service'

@Module({
  controllers: [GenresController],
  providers: [GenresService, PrismaService],
})
export class GenresModule {}
