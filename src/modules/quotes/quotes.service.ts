import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Quote, QuoteVote, User, VoteType } from '@prisma/client'
import { cp } from 'fs'
import { PrismaService } from '~/common/prisma.service'
import { AddQuoteDto } from './dto/add-quote.dto'
import { CreateOrUpdateVoteDto } from './dto/create-or-update-vote.dto'
import { QuoteDto } from './dto/quote.dto'

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getQuoteOwnedByUser(quoteId: string, userId: string): Promise<Quote> {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    })
    if (quote.userId !== userId) {
      throw new UnauthorizedException()
    }
    return quote
  }

  async addQuote(user: User, bookId: string, addQuoteDto: AddQuoteDto) {
    const quote = await this.prisma.quote.create({
      data: {
        ...addQuoteDto,
        bookId,
        userId: user.id,
      },
    })
    return quote
  }

  async getQuotes(bookId: string, user?: User) {
    const quotes = await this.prisma.quote.findMany({
      where: { bookId },
    })
    const results: QuoteDto[] = []

    for (const quote of quotes) {
      const numberOfUpvotes = await this.prisma.quoteVote.count({
        where: { quoteId: quote.id, type: VoteType.UP },
      })
      const numberOfDownvotes = await this.prisma.quoteVote.count({
        where: { quoteId: quote.id, type: VoteType.DOWN },
      })

      const userQuoteVote: QuoteVote | null = await this.prisma.quoteVote.findUnique({
        where: {
          quoteId_voterId: {
            quoteId: quote.id,
            voterId: user?.id,
          },
        },
      })

      results.push({
        ...quote,
        numberOfUpvotes,
        numberOfDownvotes,
        userVote: userQuoteVote?.type,
      })
    }

    return { quotes }
  }

  async deleteQuote(user: User, quoteId: string) {
    const quote = await this.getQuoteOwnedByUser(quoteId, user.id)
    await this.prisma.quote.delete({ where: { id: quote.id } })
  }

  async voteForQuote(
    user: User,
    quoteId: string,
    createOrUpdateVoteDto: CreateOrUpdateVoteDto,
  ): Promise<QuoteVote | null> {
    if (!createOrUpdateVoteDto.type) {
      await this.prisma.quoteVote.delete({
        where: { quoteId_voterId: { voterId: user.id, quoteId } },
      })
      return null
    }

    const vote = await this.prisma.quoteVote.create({
      data: {
        type: createOrUpdateVoteDto.type,
        quoteId,
        voterId: user.id,
      },
    })
    return vote
  }
}
