import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import toStream = require("buffer-to-stream");

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
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });

      toStream(file.buffer).pipe(upload);
    });
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
