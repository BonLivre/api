import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @Length(8, 255)
  password: string;
}
