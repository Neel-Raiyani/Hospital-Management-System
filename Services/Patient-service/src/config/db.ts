import mongoose from "mongoose";
import env from "./env.js";

const uri = env.mongo_URI;
const connectDB = async () => {
    try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error', error);
    throw error;
  }
}

export default connectDB;