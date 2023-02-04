import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthModule } from '~auth/auth.module'
import { FileManagerService } from '~/common/file-manager.service'
import { PrismaService } from '~/common/prisma.service'
import { BooksController } from './books.controller'
import { BooksService } from './books.service'

@Module({
  imports: [AuthModule],
  controllers: [BooksController],
  providers: [BooksService, PrismaService, FileManagerService, ConfigService],
  exports: [BooksService],
})
export class BooksModule {}
