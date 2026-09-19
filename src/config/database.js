import mongoose from 'mongoose';
import env from './environment.js';

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return;
    }

    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: env.DB_NAME,
      maxPoolSize: 100,
      minPoolSize: 10,
      retryWrites: true,
      family: 4,
    });

    isConnected = conn.connections[0].readyState === 1;

    mongoose.connection.on('connected', () => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;