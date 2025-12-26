import jwt from "jsonwebtoken";
import { env } from "@config/env.js";

 interface JwtUserPayload {
    userId: string;
    role: string;
    forcePasswordChange: boolean;
}


export const generateToken = (payload: JwtUserPayload) => {
    return jwt.sign(
        payload,
        env.jwtSecret,
        {expiresIn: "12h"}
    );
}

export const verifyToken = (token: string): JwtUserPayload => {
    return jwt.verify(token, env.jwtSecret) as JwtUserPayload;
}

