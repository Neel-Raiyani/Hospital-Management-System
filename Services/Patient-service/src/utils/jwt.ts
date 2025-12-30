import env from "@config/env.js";
import jwt from "jsonwebtoken";

interface jwtUserPayload {
    userId: string;
    role: string;
}

const jwt_secret = env.jwt_secret;

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
