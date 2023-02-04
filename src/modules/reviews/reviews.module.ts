import { Module } from '@nestjs/common'
import { AuthModule } from '~auth/auth.module'
import { PrismaService } from '~/common/prisma.service'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService],
})
export class ReviewsModule {}
