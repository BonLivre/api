import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard'
import { AddQuoteDto } from './dto/add-quote.dto'
import { CreateOrUpdateVoteDto } from './dto/create-or-update-vote.dto'
import { QuotesService } from './quotes.service'

@ApiTags('quotes')
@Controller()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @ApiOperation({ operationId: 'addQuote' })
  @UseGuards(JwtGuard)
  @Post('books/:bookId/quotes')
  addQuote(@CurrentUser() user: User, @Param('bookId') bookId: string, @Body() addQuoteDto: AddQuoteDto) {
    return this.quotesService.addQuote(user, bookId, addQuoteDto)
  }

  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ operationId: 'getQuotes' })
  @Get('books/:bookId/quotes')
  getQuotes(@Param('bookId') bookId: string, @CurrentUser() user?: User) {
    return this.quotesService.getQuotes(bookId, user)
  }

  @ApiOperation({ operationId: 'deleteQuote' })
  @UseGuards(JwtGuard)
  @Delete('quotes/:quoteId')
  deleteQuote(@CurrentUser() user: User, @Param('quoteId') quoteId: string) {
    return this.quotesService.deleteQuote(user, quoteId)
  }

  @ApiOperation({ operationId: 'voteForQuote' })
  @UseGuards(JwtGuard)
  @Post('quotes/:quoteId/vote')
  voteForQuote(
    @CurrentUser() user: User,
    @Body() createOrUpdateVoteDto: CreateOrUpdateVoteDto,
    @Param('quoteId') quoteId: string,
  ) {
    return this.quotesService.voteForQuote(user, quoteId, createOrUpdateVoteDto)
  }
}
