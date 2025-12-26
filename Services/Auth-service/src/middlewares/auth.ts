import type { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client.js";
import { verifyToken } from "@utils/jwt.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        const payload = verifyToken(token);

        req.userId = payload.userId;

        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (!user.isPasswordChanged && !req.path.includes("/change-password")) {
            return res.status(403).json({ message: "Password change required!!!" })
        }

        req.user = payload;
        next();
    } catch (error) {
        console.log("JWT ERROR:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}