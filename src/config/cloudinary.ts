import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectCloudinary = (): void => {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    logger.info('[Cloudinary] Configured successfully');
  } else {
    logger.warn('[Cloudinary] Missing environment variables; skipping configuration');
  }
};

export { cloudinary };
export default connectCloudinary;
