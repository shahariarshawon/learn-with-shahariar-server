import { connectDB } from '../dist/src/database/connect.js';
import mongoose from 'mongoose';

async function testConnection() {
  try {
    await connectDB();
    console.log('CONNECTED_SUCCESSFULLY');
    console.log('DATABASE_NAME:', mongoose.connection.name);
    console.log('READY_STATE:', mongoose.connection.readyState);
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('COLLECTIONS:', cols.map(c => c.name));
    process.exit(0);
  } catch (error) {
    console.error('CONNECTION_FAILED:', error);
    process.exit(1);
  }
}

testConnection();
