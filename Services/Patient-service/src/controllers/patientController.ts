import type { Request, Response } from "express";
import prisma from "prisma/client.js";

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, dateOfBirth, gender, phone, emergencyContact, medicalHistory } = req.body;

        const patient = await prisma.patient.create({
            data: {
                name,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                phone,
                emergencyContact,
                medicalHistory
            },
            select: {
                name: true,
                dateOfBirth: true,
                gender: true,
                phone: true,
                emergencyContact: true,
                medicalHistory: true
            }
        });

        res.status(201).json({ message: "Patient added successfully", patient });
    } catch (error) {
        res.status(500).json({ messgae: "Patient can't be added due to internal server error" })
    }
}



export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: "Missing required parameter: id" })
        }
        const patient = await prisma.patient.findUnique({ where: { id } });

        if (!patient || !patient.isActive) {
            return res.status(404).json({ mesage: "Patient not found" });
        }
        res.json(patient);

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to get patient details" })
    }
}


export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { name, dateOfBirth, gender, phone, emergencyContact, medicalHistory } = req.body;

        const patient = await prisma.patient.findUnique({ where: { id } });

        if (!patient || !patient.isActive) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const updated = await prisma.patient.update({
            where: { id },
            data: {
                name,
                dateOfBirth,
                gender,
                phone,
                emergencyContact,
                medicalHistory
            }
        });

        res.status(200).json({ message: "Patient details updated successfully", updated });

    } catch (error) {
        res.status(500).json({ message: "Updation failed" })
    }
}



export const listPatients = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 5);
        const skip = (page - 1) * limit

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where: { isActive: true },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.patient.count({ where: { isActive: true } })
        ]);

        res.status(200).json({ page, limit, total, data: patients })
    } catch (error) {
        res.status(500).json({ message: "Failed to get data" })
    }
}



export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const patient = await prisma.patient.findFirst({
            where: {
                id,
                isActive: true
            }
        });

        if (!patient) {
            return res.status(404).json({ messgae: "Patient not found or already deleted" })
        }

        await prisma.patient.update({
            where: { id },
            data: { isActive: false }
        });

        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}