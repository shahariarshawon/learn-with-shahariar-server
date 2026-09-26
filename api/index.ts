import app from '../src/app.js';
import { connectDB } from '../src/database/connect.js';
import { connectCloudinary } from '../src/config/cloudinary.js';

// Serverless Handler for Vercel deployment
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    connectCloudinary();
  } catch (error: any) {
    console.error('[Vercel Database Connection Error]:', error.message);
  }
  return app(req, res);
}
