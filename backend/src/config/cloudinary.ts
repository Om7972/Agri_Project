import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mandiprime',
  api_key: process.env.CLOUDINARY_API_KEY || 'api_key_placeholder',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret_placeholder',
  secure: true,
});

export default cloudinary;
