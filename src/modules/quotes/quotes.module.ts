import { Module } from '@nestjs/common'
import { QuotesService } from './quotes.service'
import { QuotesController } from './quotes.controller'
import { PrismaService } from '~/common/prisma.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [QuotesController],
  providers: [QuotesService, PrismaService],
})
export class QuotesModule {}
