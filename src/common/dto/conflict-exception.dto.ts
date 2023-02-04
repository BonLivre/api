import { ApiProperty } from "@nestjs/swagger";

export class ConflictExceptionDto {
  @ApiProperty()
  message: string;
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  error: string;
}
