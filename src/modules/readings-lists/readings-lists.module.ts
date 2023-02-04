import { Module } from '@nestjs/common'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { AuthModule } from '../auth/auth.module'
import { BooksModule } from '../books/books.module'
import { BooksService } from '../books/books.service'
import { ReadingsListsController } from './readings-lists.controller'
import { ReadingsListsService } from './readings-lists.service'

@Module({
  imports: [AuthModule, BooksModule],
  controllers: [ReadingsListsController],
  providers: [ReadingsListsService, PrismaService, FileManagerService],
})
export class ReadingsListsModule {}
