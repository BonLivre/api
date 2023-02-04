import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class FileManagerService {
  constructor(configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: configService.get("CLOUDINARY_API_KEY"),
      api_secret: configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadFile(bucketName: string, file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    await cloudinary.uploader.upload(fileName, {
      folder: bucketName,
      use_filename: true,
      unique_filename: false,
    });

    return fileName;
  }

  async getFileUrl(bucketName: string, fileName: string) {
    return cloudinary.url(fileName, {
      secure: true,
      folder: bucketName,
      type: "upload",
      resource_type: "image",
    });
  }

  async deleteFile(bucketName: string, fileName: string) {
    await cloudinary.uploader.destroy(fileName);
  }
}
