import type { Request, Response } from "express";
import { hashPassword, comparePassword } from "@utils/password.js";
import { generateToken } from "@utils/jwt.js";
import prisma from "../prisma/client.js"


export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, role, doctorData, receptionistData } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) return res.status(409).json({ message: "User already exists" })

        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(password);

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role
                }
            });

            if (role === "DOCTOR") {
                await tx.doctor.create({
                    data: {
                        userId: user.id,
                        name,
                        specialization: doctorData.specialization,
                        qualification: doctorData.qualification,
                        experienceYears: doctorData.experienceYears,
                        opdStartTime: doctorData.opdStartTime,
                        opdEndTime: doctorData.opdEndTime,
                    }
                })
            }

            if (role === "RECEPTIONIST") {
                await tx.receptionist.create({
                    data: {
                        userId: user.id,
                        name,
                        phone: receptionistData.phone,
                        shift: receptionistData.shift
                    }
                })
            }
        });

        res.status(201).json({ message: `${role} created successfully.`, Credentials: { email, password: password }, Doctor_Details: doctorData, Receptionist_Details: receptionistData })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}



export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = generateToken({
            userId: user.id,
            role: user.role,
            forcePasswordChange: !user.isPasswordChanged
        });

        res.status(200).json({ message: "User login successfull", token });

    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
}



export const changePassword = async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user!.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                isPasswordChanged: true
            }
        });

        res.status(201).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}