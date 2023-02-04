import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { Request } from 'express'
import { PrismaService } from '~/common/prisma.service'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest<Request & { user?: User }>(context)

    try {
      const token = this.getToken(request)
      const data = this.jwtService.verify(token)

      if (!data || typeof data !== 'object' || !data.id || typeof data.id !== 'string') {
        return false
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: data.id },
      })

      if (!user) {
        return false
      }

      request.user = user

      return true
    } catch (error) {
      return false
    }
  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest()
  }

  protected getToken(request: Request): string {
    const authorization = request.headers['authorization']
    if (!authorization || Array.isArray(authorization)) {
      if (request.cookies.accessToken) {
        return request.cookies.accessToken
      }
      throw new Error('Invalid Authorization Header')
    }
    const [_, token] = authorization.split(' ')
    return token
  }
}
