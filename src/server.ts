import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './database/connect.js';
import { connectCloudinary } from './config/cloudinary.js';

export const startServer = async (): Promise<http.Server> => {
  try {
    // Connect to database
    await connectDB();

    // Initialize Cloudinary
    connectCloudinary();

    const server = app.listen(env.PORT, () => {
      console.log(
        `[Server] Learn With Shahariar Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
    });

    const shutdown = () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    console.error('[Server Error] Startup failed:', error);
    process.exit(1);
  }
};

export default startServer;
