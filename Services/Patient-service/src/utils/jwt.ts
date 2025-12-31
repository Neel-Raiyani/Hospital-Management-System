import env from "@config/env.js";
import jwt from "jsonwebtoken";
import type { AuthUserPayload } from "types/auth.js";

const jwt_secret = env.jwt_secret;

export const verifyToken = (token: string): AuthUserPayload => {
    return jwt.verify(token, jwt_secret) as AuthUserPayload;
}
