import dotenv from 'dotenv';
dotenv.config();

const env = {
    port: process.env.PORT || 9019,
    mongo_URI: process.env.DATABASE_URL as string,
    jwt_secret: process.env.JWT_SECRET as string,
};

export default env;
