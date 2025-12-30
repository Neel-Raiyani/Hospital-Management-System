import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface jwtUserPayload {
    userId: string;
    role: string;
}

const jwt_secret = process.env.JWT_SECRET as string;

export const generateToken = (payload: jwtUserPayload) => {
    return jwt.sign(
        payload,
        jwt_secret,
        { expiresIn: "12h" }
    );
}

export const verifyToken = (token: string): jwtUserPayload => {
    return jwt.verify(token, jwt_secret) as jwtUserPayload;
}
