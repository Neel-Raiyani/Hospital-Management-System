import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(env.mongo_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('MongoDB connection error', error);
    }
};

export default connectDB;
