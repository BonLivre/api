import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class FileManagerService implements OnModuleInit {
  private readonly minioClient: Minio.Client
  private readonly logger = new Logger(FileManagerService.name)
  private static initialized = false

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ROOT_USER') || this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_ROOT_PASSWORD') || this.configService.get('MINIO_SECRET_KEY'),
    })
  }

  async onModuleInit() {
    if (FileManagerService.initialized) return

    this.logger.log('Initializing MinIO...')
    await this.createBucketIfNotExists('covers')
    await this.createBucketIfNotExists('photos')
    await this.createBucketIfNotExists('celebrities')
    this.logger.log('MinIO initialized')

    FileManagerService.initialized = true
  }

  async createBucketIfNotExists(bucketName: string) {
    const bucketExists = await this.minioClient.bucketExists(bucketName)
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucketName, 'eu-west-1')
    }
  }

  async uploadFile(bucketName: string, file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`
    await this.minioClient.putObject(bucketName, fileName, file.buffer, file.size)
    return fileName
  }

  async getFileUrl(bucketName: string, fileName: string) {
    return await this.minioClient.presignedUrl('GET', bucketName, fileName)
  }

  async deleteFile(bucketName: string, fileName: string) {
    await this.minioClient.removeObject(bucketName, fileName)
  }
}
