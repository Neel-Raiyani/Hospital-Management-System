import * as jwt from "jsonwebtoken";
import { env } from "@config/env";

export const generateToken = (payload: object) => {
    return jwt.sign(
        payload,
        env.jwtSecret,
        {expiresIn: "12h"}
    );
}