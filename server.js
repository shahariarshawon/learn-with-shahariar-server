import app from './src/app.js';
import startServer from './src/server.js';
import { connectDB } from './src/database/connect.js';
import { connectCloudinary } from './src/config/cloudinary.js';

// Initialize DB and Cloudinary in serverless environments (Vercel)
if (process.env.VERCEL === '1') {
  connectDB().catch((err) => console.error('[Vercel DB Connection Error]:', err));
  connectCloudinary();
} else {
  // Start HTTP listener for local development / traditional hosting
  startServer();
}

export default app;