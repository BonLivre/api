import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { hash } from 'argon2'
import { PrismaService } from '~/common/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { FileManagerService } from '~/common/file-manager.service'
import { I18nContext } from 'nestjs-i18n'
import { FindMeDto } from './dto/find-me.dto'
import { Response } from 'express'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly minio: FileManagerService) {}

  async findMe(user: User): Promise<FindMeDto> {
    const { email, firstName, lastName, username } = user
    const settings = { email, firstName, lastName, username }

    let photoUrl: string
    if (user.photo) {
      photoUrl = await this.minio.getFileUrl('photos', user.photo)
    }

    return { settings, photoUrl }
  }

  async updateMe(currentUser: User, updateUserDto: UpdateUserDto): Promise<FindMeDto> {
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password)
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: currentUser.id },
        data: updateUserDto,
      })
      return this.findMe(updatedUser)
    } catch (error) {
      const i18n = I18nContext.current()

      if (error.code === 'P2002') {
        throw new ConflictException(i18n.translate('errors.auth.emailAlreadyInUse'))
      }

      throw new BadRequestException(i18n.translate('errors.somethingWentWrong'))
    }
  }

  async removeMe(currentUser: User, response: Response): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: currentUser.id },
      })

      response.clearCookie('accessToken')
    } catch {
      const i18n = I18nContext.current()

      throw new BadRequestException(i18n.translate('errors.somethingWentWrong'))
    }
  }

  async getPhotoUrl(currentUser: User): Promise<string> {
    if (!currentUser.photo) {
      return null
    }
    return this.minio.getFileUrl('photos', currentUser.photo)
  }

  async updatePhoto(currentUser: User, photo: Express.Multer.File) {
    if (currentUser.photo) {
      await this.minio.deleteFile('photos', currentUser.photo)
    }

    const fileName = await this.minio.uploadFile('photos', photo)
    const photoUrl = await this.getPhotoUrl(currentUser)

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { photo: fileName },
    })

    return { photoUrl }
  }
}
