import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "@config/db.js";
import patientRoutes from "@routes/patientRoutes.js"

const port = process.env.PORT;
const app = express();

connectDB();

app.use(express.json());

app.use('/patient', patientRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})