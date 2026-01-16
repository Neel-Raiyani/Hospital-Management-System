import express from "express";
import connectDB from "@config/db.js";
import patientRoutes from "@routes/patientRoutes.js"
import env from "@config/env.js";
import { setupSwagger } from "@config/swagger.js";
import { requestLogger } from "@utils/logger.js";
import { rateLimiter } from "@middlewares/rateLimiter.js";

const port = env.port;
const app = express();

connectDB();
setupSwagger(app);

app.use(rateLimiter);
app.use(express.json());
app.use(requestLogger);

app.use('/patient', patientRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})