import { ApiProperty } from "@nestjs/swagger";
import {
  IsAlpha,
  IsAlphanumeric,
  IsLowercase,
  IsString,
  Length,
} from "class-validator";
import { AuthCredentialsDto } from "./auth-credentials.dto";

export class CreateUserDto extends AuthCredentialsDto {
  @ApiProperty()
  @IsString()
  @Length(3, 255)
  @IsLowercase()
  @IsAlphanumeric()
  username: string;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  lastName: string;
}
