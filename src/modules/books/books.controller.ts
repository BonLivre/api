import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiExtraModels,
  ApiCreatedResponse,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { AdminGuard } from '~/modules/auth/guards/admin.guard'
import { JwtGuard } from '~/modules/auth/guards/jwt.guard'
import { BooksService } from './books.service'
import { CreateBookDto } from './dto/create-book.dto'
import { QueryBooksDto } from './dto/query-books.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { ApiPaginatedResponse } from '~/common/api-paginated-response.decorator'
import { BookDto } from './dto/book.dto'
import { PaginatedDto } from '~/common/dto/paginated.dto'
import { ApiValidationResponse } from '~/common/api-validation-response.decorator'

@ApiTags('books')
@ApiExtraModels(PaginatedDto)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'The book has been successfully created.',
    type: BookDto,
  })
  @ApiValidationResponse()
  @ApiOperation({ operationId: 'addBook' })
  @UseGuards(JwtGuard)
  @Post()
  addBook(@Body() createBookDto: CreateBookDto) {
    return this.booksService.addBook(createBookDto)
  }

  @ApiPaginatedResponse(BookDto)
  @ApiOperation({ operationId: 'queryBooks' })
  @Get()
  queryBooks(@Query() queryBooksDto: QueryBooksDto): Promise<PaginatedDto<BookDto>> {
    return this.booksService.queryBooks(queryBooksDto)
  }

  @ApiOkResponse({
    description: 'The book has been successfully found.',
    type: BookDto,
  })
  @ApiOperation({ operationId: 'findBook' })
  @Get('/:id')
  findBook(@Param('id') id: string): Promise<BookDto> {
    return this.booksService.findBook(id)
  }

  @ApiValidationResponse()
  @ApiBearerAuth()
  @UseGuards(JwtGuard, AdminGuard)
  @Patch('/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): Promise<BookDto> {
    return this.booksService.updateBook(id, updateBookDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ operationId: 'removeBook' })
  @ApiResponse({
    status: 204,
    description: 'The book has been successfully deleted.',
  })
  @Delete('/:id')
  @UseGuards(JwtGuard, AdminGuard)
  removeBook(@Param('id') id: string): Promise<void> {
    return this.booksService.removeBook(id)
  }
}
