import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const mongoUri = env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('DATABASE_URL is not defined in environment configuration');
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    logger.info(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    logger.error(`[MongoDB Error]: Failed to connect to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
