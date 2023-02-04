import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { CreateReadingsListDto } from './dto/create-readings-list.dto'
import { ReadingsListDto } from './dto/readings-list.dto'
import { ReadingsListsService } from './readings-lists.service'
import { FindReadingsListssDto } from './dto/find-readings-lists.dto'
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard'

@ApiTags('readings-lists')
@Controller('readings-lists')
export class ReadingsListsController {
  constructor(private readonly readingsListsService: ReadingsListsService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The readings list has been successfully created.',
    type: ReadingsListDto,
  })
  @ApiOperation({ operationId: 'createReadingsList' })
  @UseGuards(JwtGuard)
  @Post()
  createReadingsList(@CurrentUser() currentUser: User, @Body() createReadingsListDto: CreateReadingsListDto) {
    return this.readingsListsService.createReadingsList(currentUser, createReadingsListDto)
  }

  @ApiBearerAuth()
  @ApiOperation({ operationId: 'updateReadingsList' })
  @UseGuards(JwtGuard)
  @Patch(':readingsListId')
  updateReadingsList(
    @CurrentUser() currentUser: User,
    @Param('readingsListId') readingsListId: string,
    @Body() updateReadingsListDto: CreateReadingsListDto,
  ) {
    return this.readingsListsService.updateReadingsList(currentUser, readingsListId, updateReadingsListDto)
  }

  @UseGuards(OptionalJwtGuard)
  @ApiOperation({
    operationId: 'findReadingsLists',
  })
  @ApiResponse({
    status: 200,
    description: 'The readings lists have been successfully retrieved.',
    type: FindReadingsListssDto,
  })
  @Get()
  findReadingsLists(@CurrentUser() currentUser?: User) {
    return this.readingsListsService.findReadingsLists(currentUser)
  }

  @ApiOperation({ operationId: 'findReadingsListsIOwn' })
  @ApiResponse({
    status: 200,
    description: 'The readings lists have been successfully retrieved.',
    type: FindReadingsListssDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('i-own')
  findReadingsListsIOwn(@CurrentUser() currentUser: User) {
    return this.readingsListsService.findReadingsListsIOwn(currentUser)
  }

  @ApiOperation({ operationId: 'findReadingsListsById' })
  @ApiResponse({
    status: 200,
    description: 'The readings list has been successfully retrieved.',
    type: ReadingsListDto,
  })
  @UseGuards(OptionalJwtGuard)
  @Get(':readingsListId')
  findReadingsListsById(@Param('readingsListId') readingsListId: string, @CurrentUser() currentUser?: User) {
    return this.readingsListsService.findReadingsListsById(readingsListId, currentUser)
  }

  @ApiOperation({ operationId: 'toggleBookPresenceInReadingsList' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch(':readingsListId/toggle-book-presence/:bookId')
  toggleBookPresenceInReadingsList(
    @CurrentUser() currentUser: User,
    @Param('readingsListId') readingsListId: string,
    @Param('bookId') bookId: string,
  ) {
    return this.readingsListsService.toggleBookPresenceInReadingsList(currentUser, readingsListId, bookId)
  }

  @ApiOperation({ operationId: 'deleteReadingsList' })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Delete(':readingsListId')
  deleteReadingsList(@CurrentUser() currentUser: User, @Param('readingsListId') readingsListId: string) {
    return this.readingsListsService.deleteReadingsList(currentUser, readingsListId)
  }
}
