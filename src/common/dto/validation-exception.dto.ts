import { ApiProperty } from "@nestjs/swagger";

export class ValidationExceptionDto {
  @ApiProperty({ example: 400 })
  statusCode: number = 400;

  @ApiProperty({
    example: [
      "email must be an email",
      "password must be longer than or equal to 8 characters",
    ],
  })
  message: string[] | string;

  @ApiProperty({ example: "Bad Request" })
  error: string = "Bad Request";
}
