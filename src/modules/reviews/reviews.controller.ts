import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { ApiValidationResponse } from '~/common/api-validation-response.decorator'
import { CurrentUser } from '~auth/current-user.decorator'
import { JwtGuard } from '~/modules/auth/guards/jwt.guard'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ReviewsService } from './reviews.service'
import { ReviewsResponseDto } from '~reviews/dto/reviews-response.dto'
import { MyReviewResponseDto } from './dto/my-review-response.dto'

@ApiTags('reviews')
@Controller('books/:bookId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ operationId: 'createReview' })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiValidationResponse()
  @Post()
  createReview(@Param('bookId') bookId: string, @CurrentUser() user: User, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(bookId, user, createReviewDto)
  }

  @ApiOkResponse({ type: ReviewsResponseDto })
  @ApiOperation({ operationId: 'findReviews' })
  @Get()
  findReviews(@Param('bookId') bookId: string): Promise<ReviewsResponseDto> {
    return this.reviewsService.findReviews(bookId)
  }

  @ApiOperation({ operationId: 'updateReview' })
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiValidationResponse()
  @Patch()
  updateReview(@Param('bookId') bookId: string, @CurrentUser() user: User, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.updateReview(bookId, user, updateReviewDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ operationId: 'deleteReview' })
  @UseGuards(JwtGuard)
  @Delete()
  deleteReview(@Param('bookId') bookId: string, @CurrentUser() user: User) {
    return this.reviewsService.deleteReview(bookId, user)
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: MyReviewResponseDto })
  @ApiOperation({ operationId: 'findMyReview' })
  @UseGuards(JwtGuard)
  @Get('my-review')
  findMyReview(@Param('bookId') bookId: string, @CurrentUser() user: User): Promise<MyReviewResponseDto> {
    return this.reviewsService.findMyReview(bookId, user)
  }
}
