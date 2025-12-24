import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
    try {
        await mongoose.connect(env.mongo_URI)
        console.log("MongoDb connected successfully")
    } catch (error) {
        console.log("DB Connection Failed!!!", error)
    }
}

export default connectDB;

