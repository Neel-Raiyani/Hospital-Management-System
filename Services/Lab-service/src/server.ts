import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import env from '@config/env.js';
import connectDB from '@config/db.js';
import labRoutes from '@routes/labRoutes.js';
import { setupSwagger } from '@config/swagger.js';

const app = express();
const port = env.port;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();
setupSwagger(app);

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/lab', labRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
});
