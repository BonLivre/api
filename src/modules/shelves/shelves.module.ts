import { Module } from '@nestjs/common'
import { ShelvesService } from './shelves.service'
import { ShelvesController } from './shelves.controller'
import { PrismaService } from '~/common/prisma.service'
import { AuthModule } from '../auth/auth.module'
import { BooksModule } from '../books/books.module'

@Module({
  imports: [AuthModule, BooksModule],
  controllers: [ShelvesController],
  providers: [ShelvesService, PrismaService],
})
export class ShelvesModule {}
