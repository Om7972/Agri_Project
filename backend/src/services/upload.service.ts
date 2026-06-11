import cloudinary from '@/config/cloudinary';
import { InternalServerError } from '@/utils/apiErrors';

export class UploadService {
  public static async uploadImage(fileBuffer: Buffer, folder = 'mandiprime'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerError('Cloudinary upload failed: ' + (error?.message || 'unknown error')));
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}
