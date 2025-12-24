import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "@config/db.js";

const port = process.env.PORT;
const app = express();

connectDB();

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})