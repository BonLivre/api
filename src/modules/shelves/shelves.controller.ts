import { Controller, Post, Param, Delete, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { GetBooksFromShelfDto } from './dto/get-books-from-shelf.dto'
import { GetShelfStatusDto } from './dto/get-shelf-status.dto'
import { ShelvesService } from './shelves.service'

@ApiBearerAuth()
@ApiTags('shelves')
@UseGuards(JwtGuard)
@Controller()
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @ApiOperation({ summary: 'Add a book to a shelf', operationId: 'addBookToShelf' })
  @ApiOkResponse({ type: GetShelfStatusDto })
  @Post('books/:bookId/shelves/:shelfStatus')
  addBookToShelf(
    @CurrentUser() user: User,
    @Param('bookId') bookId: string,
    @Param('shelfStatus') shelfStatus: string,
  ): Promise<GetShelfStatusDto> {
    return this.shelvesService.addBookToShelf(user, bookId, shelfStatus)
  }

  @ApiOperation({ summary: 'Retrieve shelf status of a book', operationId: 'getShelfStatus' })
  @ApiOkResponse({ type: GetShelfStatusDto })
  @Get('books/:bookId/shelves')
  getShelfStatus(@CurrentUser() user: User, @Param('bookId') bookId: string): Promise<GetShelfStatusDto> {
    return this.shelvesService.getShelfStatus(user, bookId)
  }

  @ApiOperation({ summary: 'Retrieve all books from a shelf', operationId: 'getBooksFromShelf' })
  @ApiOkResponse({ type: GetBooksFromShelfDto })
  @Get('shelves')
  getBooksFromShelf(@CurrentUser() user: User): Promise<GetBooksFromShelfDto> {
    return this.shelvesService.getBooksFromShelf(user)
  }

  @ApiOperation({ summary: 'Remove a book from a shelf', operationId: 'removeBookFromShelf' })
  @ApiOkResponse({ type: GetShelfStatusDto })
  @Delete('books/:bookId/shelves')
  removeBookFromShelf(@CurrentUser() user: User, @Param('bookId') bookId: string): Promise<GetShelfStatusDto> {
    return this.shelvesService.removeBookFromShelf(user, bookId)
  }
}
