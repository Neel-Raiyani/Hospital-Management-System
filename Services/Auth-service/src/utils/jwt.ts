import jwt from "jsonwebtoken";
import { env } from "@config/env.js";

export const generateToken = (payload: object) => {
    return jwt.sign(
        payload,
        env.jwtSecret,
        {expiresIn: "12h"}
    );
}