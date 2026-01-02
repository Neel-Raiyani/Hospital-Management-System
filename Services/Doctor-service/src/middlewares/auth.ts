import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@utils/jwt.js";

const auth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const payload = verifyToken(token);

        req.user = payload;

        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export default auth;