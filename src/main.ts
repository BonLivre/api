import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { AppModule } from '~/app.module'
import morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true })
  app.use(cookieParser())
  app.use(morgan('dev'))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  const config = new DocumentBuilder().setTitle('BonLivre API').addBearerAuth().setVersion('1.0').build()
  const document = SwaggerModule.createDocument(app, config)

  if (process.env.NODE_ENV === 'development') {
    const outputPath = resolve(process.cwd(), './../web/openapi.json')
    writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' })
  }

  SwaggerModule.setup('swagger', app, document)

  const port = Number(process.env.PORT) || 5000
  await app.listen(port)
}
bootstrap()
