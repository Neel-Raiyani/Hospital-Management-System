import jwt from "jsonwebtoken";
import { env } from "@config/env.js";
import type { AuthUserPayload } from "types/auth.js";

export const generateToken = (payload: AuthUserPayload) => {
    return jwt.sign(
        payload,
        env.jwtSecret,
        {expiresIn: "12h"}
    );
}

export const verifyToken = (token: string): AuthUserPayload => {
    return jwt.verify(token, env.jwtSecret) as AuthUserPayload;
}