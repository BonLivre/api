import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ForgotPasswordDto } from '~auth/dto/forgot-password.dto'
import { ResetPasswordDto } from '~auth/dto/reset-password.dto'
import { ApiValidationResponse } from '~/common/api-validation-response.decorator'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiValidationResponse()
  @ApiConflictResponse()
  @ApiOperation({ operationId: 'signUp' })
  @Post('/sign-up')
  signUp(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.signUp(createUserDto, response)
  }

  @ApiCreatedResponse({ description: 'User signed in successfully' })
  @ApiOperation({ operationId: 'signIn' })
  @Post('/sign-in')
  signIn(@Body() authCredentialsDto: AuthCredentialsDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.signIn(authCredentialsDto, response)
  }

  @ApiOperation({ operationId: 'forgotPassword' })
  @Post('/forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @ApiCreatedResponse({ description: 'User signed in successfully' })
  @ApiOperation({ operationId: 'resetPassword' })
  @Post('/reinitialiser-mot-de-passe/:token')
  resetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(token, resetPasswordDto)
  }

  @ApiOperation({ operationId: 'signOut' })
  @Post('/sign-out')
  signOut(@Res({ passthrough: true }) response: Response) {
    return this.authService.signOut(response)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req)
  }
}
