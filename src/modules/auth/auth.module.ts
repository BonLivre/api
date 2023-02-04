import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "~/common/prisma.service";
import { MailsModule } from "~/modules/mails/mails.module";
import { MailsService } from "~/modules/mails/mails.service";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MailsModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get("JWT_SECRET"),
          signOptions: { expiresIn: "365d" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PrismaService, MailsService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
