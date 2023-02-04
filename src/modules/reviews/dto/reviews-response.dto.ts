import { ApiProperty } from "@nestjs/swagger";
import { ReviewDto } from "~reviews/dto/review.dto";
import { Counts } from "../counts.type";

export class ReviewsResponseDto {
  @ApiProperty({
    type: [ReviewDto],
  })
  reviews: ReviewDto[];

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  numberOfReviews: number;

  @ApiProperty({
    type: [Number],
  })
  counts: Counts;
}
