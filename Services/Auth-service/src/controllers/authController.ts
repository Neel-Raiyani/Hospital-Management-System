import type { Request, Response } from "express";
import { hashPassword, comparePassword } from "@utils/password.js";
import { generateToken } from "@utils/jwt.js";
import prisma from "../prisma/client.js"
import { Role } from "@prisma/client";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) return res.status(400).json({ message: "User already exists!!!" });

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role
            }
        });

        res.status(201).json({ message: "User registered successfully", User_Details: { name, email, role } })
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }

}



export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ message: "User not found!!!" });

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid password!!!" });

        const token = generateToken({
            userId: user.id,
            role: user.role
        });

        res.status(200).json({ message: "User login successfull", token });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
}