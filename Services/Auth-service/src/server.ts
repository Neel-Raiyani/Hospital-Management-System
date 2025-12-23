import * as express from "express";
import authRoutes from "@routes/authRoutes.js";
import { env } from "@config/env";

const app = express();
const port = env.port;

app.use(express.json());

app.use('/auth',authRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
})