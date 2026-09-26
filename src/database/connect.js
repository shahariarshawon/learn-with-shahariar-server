import mongoose from 'mongoose';
import { env } from '../config/env.js';

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  const uri = env.DATABASE_URL;
  if (!uri) {
    throw new Error('Database connection string is missing. Please set DATABASE_URL or MONGODB_URI.');
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected');
    });

    cachedConnection = await mongoose.connect(uri, {
      bufferCommands: false,
    });

    return cachedConnection;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

export default connectDB;
