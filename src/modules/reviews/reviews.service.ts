import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '~/common/prisma.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ReviewsResponseDto } from '~reviews/dto/reviews-response.dto'
import { Counts } from './counts.type'
import { MyReviewResponseDto } from './dto/my-review-response.dto'
import { ReviewDto } from './dto/review.dto'
import { UsersService } from '../users/users.service'

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService, private readonly usersService: UsersService) {}

  async createReview(bookId: string, user: User, createReviewDto: CreateReviewDto) {
    try {
      const createdReview = await this.prisma.review.create({
        data: {
          ...createReviewDto,
          book: { connect: { id: bookId } },
          user: { connect: { id: user.id } },
        },
      })

      return { createdReview }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already reviewed this book')
      }

      throw new NotFoundException('Book not found')
    }
  }

  async findReviews(bookId: string): Promise<ReviewsResponseDto> {
    const reviews = await this.prisma.review.findMany({
      where: { bookId },
      include: {
        user: true,
      },
    })

    const aggregations = await this.prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: true,
    })

    const averageRating = Math.round(((aggregations._avg.rating || 0) + Number.EPSILON) * 100) / 100
    const numberOfReviews = aggregations._count

    const counts: Counts = [0, 0, 0, 0, 0]

    const formattedReviews: ReviewDto[] = []
    for (const review of reviews) {
      const { id, rating, comment, createdAt, updatedAt, user } = review
      formattedReviews.push({
        id,
        rating,
        comment,
        createdAt,
        updatedAt,
        username: user.username,
        bookId: bookId,
        userId: user.id,
        photoUrl: await this.usersService.getPhotoUrl(user),
      })
      counts[review.rating - 1]++
    }

    return { reviews: formattedReviews, averageRating, numberOfReviews, counts }
  }

  async updateReview(bookId: string, user: User, updateReviewDto: UpdateReviewDto) {
    try {
      const updatedReview = await this.prisma.review.update({
        where: { bookId_userId: { bookId, userId: user.id } },
        data: updateReviewDto,
      })

      return { updatedReview }
    } catch (error) {
      throw new NotFoundException('Review not found')
    }
  }

  async deleteReview(bookId: string, user: User) {
    try {
      await this.prisma.review.delete({
        where: { bookId_userId: { bookId, userId: user.id } },
      })

      return { message: 'Review deleted' }
    } catch (error) {
      throw new NotFoundException('Review not found')
    }
  }

  async findMyReview(bookId: string, user: User): Promise<MyReviewResponseDto> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { bookId_userId: { bookId, userId: user.id } },
        include: { user: true },
      })

      return {
        review: {
          ...review,
          username: review.user.username,
          photoUrl: await this.usersService.getPhotoUrl(review.user),
        },
      }
    } catch (error) {
      return { review: null }
    }
  }
}
