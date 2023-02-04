import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { PrismaService } from '~/common/prisma.service'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ForgotPasswordDto } from '~auth/dto/forgot-password.dto'
import { MailsService } from '~/modules/mails/mails.service'
import { ResetPasswordDto } from '~auth/dto/reset-password.dto'
import { I18nContext } from 'nestjs-i18n'
import { Request, Response } from 'express'
import { AuthenticationMethod } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly mailsService: MailsService,
  ) {}

  async signUp(createUserDto: CreateUserDto, response: Response) {
    const i18n = I18nContext.current()

    const userFoundByEmail = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    })
    if (userFoundByEmail) {
      throw new ConflictException(i18n.translate('errors.auth.emailAlreadyInUse'))
    }
    const userFoundByUsername = await this.prismaService.user.findUnique({
      where: { username: createUserDto.username },
    })
    if (userFoundByUsername) {
      throw new ConflictException(i18n.translate('errors.auth.usernameAlreadyInUse'))
    }

    const createdUser = await this.prismaService.user.create({
      data: { ...createUserDto, password: await hash(createUserDto.password) },
    })
    const accessToken = this.jwtService.sign({ id: createdUser.id })
    response.cookie('accessToken', accessToken, { httpOnly: true })
    return { accessToken }
  }

  async signIn(authCredentialsDto: AuthCredentialsDto, response: Response) {
    const i18n = I18nContext.current()

    const userFoundByEmail = await this.prismaService.user.findUnique({
      where: { email: authCredentialsDto.email },
    })
    if (!userFoundByEmail) {
      throw new UnauthorizedException(i18n.translate('errors.auth.invalidCredentials'))
    }

    if (userFoundByEmail.authenticationMethod !== AuthenticationMethod.EMAIL) {
      throw new UnauthorizedException(i18n.translate('errors.auth.invalidCredentials'))
    }

    try {
      const isPasswordValid = await verify(userFoundByEmail.password, authCredentialsDto.password)
      if (!isPasswordValid) {
        throw new UnauthorizedException(i18n.translate('errors.auth.invalidCredentials'))
      }
    } catch {
      throw new UnauthorizedException(i18n.translate('errors.auth.invalidCredentials'))
    }
    const accessToken = this.jwtService.sign({ id: userFoundByEmail.id })
    response.cookie('accessToken', accessToken, { httpOnly: true })
    return { accessToken }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const userFoundByEmail = await this.prismaService.user.findUnique({
      where: { email: forgotPasswordDto.email },
    })

    if (!userFoundByEmail) {
      return
    }

    const token = this.jwtService.sign({ email: userFoundByEmail.email })

    await this.mailsService.sendResetPasswordMail({
      email: forgotPasswordDto.email,
      name: `${userFoundByEmail.firstName} ${userFoundByEmail.lastName}`,
      token,
    })
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const i18n = I18nContext.current()

    try {
      const { email } = this.jwtService.verify(token)

      const userFoundByEmail = await this.prismaService.user.findUnique({
        where: { email },
      })

      if (!userFoundByEmail) {
        throw new UnauthorizedException(i18n.translate('errors.auth.unauthorized'))
      }

      await this.prismaService.user.update({
        where: { email },
        data: { password: await hash(resetPasswordDto.password) },
      })
    } catch {
      throw new UnauthorizedException(i18n.translate('errors.auth.unauthorized'))
    }
  }

  signOut(response: Response) {
    response.clearCookie('accessToken')
    return { success: true }
  }

  async googleLogin(req: Request) {
    if (!req.user) {
      return 'No user from google'
    }

    const user = req.user as { email: string; firstName: string; lastName: string }

    const userFoundByEmail = await this.prismaService.user.findUnique({
      where: { email: user.email },
    })

    return { message: 'Success' }
  }
}
