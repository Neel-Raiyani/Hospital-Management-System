import { config } from "dotenv";
config();

export const env = {
    port: process.env.PORT || 4000,
    jwtSecret: process.env.JWT_SECRET as string,
    mongo_URI: process.env.DATABASE_URL as string
}