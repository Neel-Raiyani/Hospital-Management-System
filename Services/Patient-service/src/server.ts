import express from "express";
import connectDB from "@config/db.js";
import patientRoutes from "@routes/patientRoutes.js"
import env from "@config/env.js";

const port = env.port;
const app = express();

connectDB();

app.use(express.json());

app.use('/patient', patientRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})