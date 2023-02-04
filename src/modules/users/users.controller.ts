import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiOkResponse } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { CurrentUser } from '~auth/current-user.decorator'
import { JwtGuard } from '~/modules/auth/guards/jwt.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { fileValidationOptions } from '~common/constants'
import { UpdatePhotoDto } from '~users/dto/update-photo.dto'
import { ApiValidationResponse } from '~/common/api-validation-response.decorator'
import { FindMeDto } from './dto/find-me.dto'
import { Response } from 'express'

@ApiTags('users')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ operationId: 'findMe' })
  @ApiOkResponse({
    type: FindMeDto,
  })
  @Get('me')
  findMe(@CurrentUser() user: User): Promise<FindMeDto> {
    return this.usersService.findMe(user)
  }

  @ApiOperation({ operationId: 'updateMe' })
  @ApiValidationResponse()
  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto): Promise<FindMeDto> {
    return this.usersService.updateMe(user, updateUserDto)
  }

  @ApiOperation({ operationId: 'removeMe' })
  @Delete('me')
  removeMe(@CurrentUser() user: User, @Res() res: Response) {
    return this.usersService.removeMe(user, res)
  }

  @ApiOperation({ operationId: 'updatePhoto' })
  @ApiValidationResponse()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePhotoDto })
  @Put('photo')
  @UseInterceptors(FileInterceptor('photo', fileValidationOptions))
  updatePhoto(@CurrentUser() currentUser: User, @UploadedFile() photo: Express.Multer.File) {
    return this.usersService.updatePhoto(currentUser, photo)
  }
}
