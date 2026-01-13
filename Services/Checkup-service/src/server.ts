import express from 'express';
import env from '@config/env.js';
import connectDB from '@config/db.js';
import checkupRoutes from '@routes/checkupRoutes.js';
import { setupSwagger } from '@config/swagger.js';

const app = express();
const port = env.port;

connectDB();
setupSwagger(app);

app.use(express.json());

app.use('/checkup', checkupRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
});
