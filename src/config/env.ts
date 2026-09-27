import 'dotenv/config';

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CLIENT_URL: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CURRENCY: string;
  AI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ADMIN_EMAIL: string;
  ALLOWED_EDUCATOR_EMAIL: string;
}

export const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5001,

  // Database: accepts either DATABASE_URL or legacy MONGODB_URI
  DATABASE_URL: process.env.DATABASE_URL || process.env.MONGODB_URI || '',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'lws_jwt_secret_dev_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'lws_jwt_refresh_dev_key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Client URLs for CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173,https://learn-with-shahariar.vercel.app',

  // Clerk Keys
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || '',

  // Cloudinary Keys
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Stripe Keys
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  CURRENCY: process.env.CURRENCY || 'usd',

  // AI Provider Keys
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Roles & Admin Permissions
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || process.env.ALLOWED_EDUCATOR_EMAIL || 'shahariarshawon.dev@gmail.com',
  ALLOWED_EDUCATOR_EMAIL: process.env.ALLOWED_EDUCATOR_EMAIL || 'shahariarshawon.dev@gmail.com',
};

export default env;
