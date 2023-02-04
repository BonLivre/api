import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaService } from '~/common/prisma.service'
import { AuthModule } from '~auth/auth.module'
import { FileManagerService } from '~/common/file-manager.service'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, FileManagerService, ConfigService],
  exports: [UsersService],
})
export class UsersModule {}
