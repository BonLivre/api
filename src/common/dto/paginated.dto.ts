import { ApiProperty } from "@nestjs/swagger";

export class PaginatedDto<TData> {
  @ApiProperty()
  numberOfPages: number;

  @ApiProperty()
  currentPage: number;

  results: TData[];
}
