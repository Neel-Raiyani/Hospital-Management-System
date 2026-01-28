import express from "express";
import authRoutes from "@routes/authRoutes.js";
import { env } from "@config/env.js";
import connectDB from "@config/db.js";
import { setupSwagger } from "@config/swagger.js";
import { requestLogger } from "@utils/logger.js";
import { rateLimiter } from "@middlewares/rateLimiter.js";
import cors from "cors";

const app = express();
const port = env.port;

connectDB();
setupSwagger(app);

app.use(cors());

app.use(rateLimiter);
app.use(express.json());
app.use(requestLogger);

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})