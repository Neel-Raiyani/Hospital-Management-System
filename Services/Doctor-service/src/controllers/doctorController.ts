import type { Request, Response } from "express";
import prisma from "prisma/client.js";

export const updateDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const { name, specialization, qualification, experienceYears, opdStartTime, opdEndTime } = req.body;

        const doctor = await prisma.doctor.update({
            where: {id},
            data: {
                name,
                specialization,
                qualification,
                experienceYears,
                opdStartTime,
                opdEndTime
            }
        });

        res.status(201).json({ message: "Doctor updated successfully", doctor })

    } catch (error) {
        res.status(500).json({ message: "Failed to update doctor" });
    }
}



export const getDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await prisma.doctor.findMany({ where: { isActive: true } });

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch doctors" });
    }
}



export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const doctor = await prisma.doctor.findUnique({
            where: { id }
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch doctor" });
    }
}



export const deactivateDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        await prisma.doctor.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({ message: "Doctor deactivated" });
    } catch (error) {
        res.status(500).json({ message: "Failed to deactivate doctor" });
    }
};

