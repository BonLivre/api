import { Module } from "@nestjs/common";
import { MailsService } from "./mails.service";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [MailsService, ConfigService],
})
export class MailsModule {}
