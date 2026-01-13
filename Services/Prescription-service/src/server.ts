import express from 'express';
import prescriptionRoutes from '@routes/prescriptionRoutes.js';
import env from '@config/env.js';
import connectDB from '@config/db.js';

const app = express();
const port = env.port;

connectDB();

app.use(express.json());

app.use('/prescription', prescriptionRoutes);

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
});
