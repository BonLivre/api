import { ApiProperty } from "@nestjs/swagger";
import { ReviewDto } from "./review.dto";

export class MyReviewResponseDto {
  @ApiProperty()
  review: ReviewDto | null;
}
