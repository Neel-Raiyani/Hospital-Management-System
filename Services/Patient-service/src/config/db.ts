import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const monngo_URI = process.env.DATABASE_URL as string;
const connectDB = async () => {
    try {
    await mongoose.connect(monngo_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error', error);
    throw error;
  }
}

export default connectDB;