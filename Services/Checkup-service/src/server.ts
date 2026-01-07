import express from 'express';
import env from '@config/env.js';
import connectDB from '@config/db.js';

const app = express();
const port = env.port;

connectDB();

app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on "http://localhost:${port}"`);
});
