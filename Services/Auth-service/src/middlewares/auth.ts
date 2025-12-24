import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@utils/jwt.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized!" })
    }
    try {
        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token", error });
    }
}