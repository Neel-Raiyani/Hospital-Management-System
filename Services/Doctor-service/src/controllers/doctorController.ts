import type { Request, Response } from "express";
import prisma from "prisma/client.js";
import logger from "@utils/logger.js";

export const updateDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const { name, specialization, qualification, experienceYears, opdStartTime, opdEndTime, checkupFee } = req.body;

        logger.info(`Update doctor request | doctorId=${id} | user=${req.user?.name}`);

        const updatedDoctor = await prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.update({
                where: { id },
                data: {
                    name,
                    specialization,
                    qualification,
                    experienceYears,
                    opdStartTime,
                    opdEndTime,
                    checkupFee
                }
            });

            // Also update the User's name if it was changed
            if (name) {
                await (tx as any).user.update({
                    where: { id: doctor.userId },
                    data: { name }
                });
            }

            await tx.oPD.update({
                where: { doctorId: id },
                data: {
                    startTime: doctor.opdStartTime,
                    endTime: doctor.opdEndTime
                }
            })
            return doctor;
        });

        logger.info(
            `Doctor updated successfully | doctorId=${id} | opdStart=${updatedDoctor.opdStartTime} | opdEnd=${updatedDoctor.opdEndTime}`
        );


        res.status(201).json({ message: "Doctor updated successfully", updatedDoctor });

    } catch (error) {
        logger.error(`Update doctor error | error=${(error as Error).message}`);

        res.status(500).json({ message: "Failed to update doctor" });
    }
}



export const getDoctors = async (req: Request, res: Response) => {
    try {
        logger.info('Fetch active doctors request');
        const doctors = await prisma.doctor.findMany({ where: { isActive: true } });

        logger.info(`Doctors fetched successfully | count=${doctors.length}`);
        res.status(200).json(doctors);
    } catch (error) {
        logger.error(
            `Update doctor error | error=${(error as Error).message}`
        );
        logger.error(`Fetch doctors error | error=${(error as Error).message}`);
        res.status(500).json({ message: "Failed to fetch doctors" });
    }
}



export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        logger.info(`Fetch doctor by ID request | doctorId=${id}`);

        const doctor = await prisma.doctor.findUnique({
            where: { id }
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        logger.info(`Doctor fetched successfully | doctorId=${id}`);

        res.json(doctor);
    } catch (error) {
        logger.error(`Fetch doctor error | error=${(error as Error).message}`);

        res.status(500).json({ message: "Failed to fetch doctor" });
    }
}



export const deactivateDoctor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        logger.info(`Deactivate doctor request | doctorId=${id} | user=${req.user?.name}`);

        await prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.update({
                where: { id },
                data: { isActive: false }
            });

            // Also deactivate the OPD status
            await tx.oPD.update({
                where: { doctorId: id },
                data: { isActive: false }
            });

            // Also deactivate the User account
            await (tx as any).user.update({
                where: { id: doctor.userId },
                data: { isActive: false }
            });
        });

        logger.info(`Doctor deactivated successfully | doctorId=${id}`);

        res.json({ message: "Doctor deactivated" });
    } catch (error) {
        logger.error(`Deactivate doctor error | error=${(error as Error).message}`);

        res.status(500).json({ message: "Failed to deactivate doctor" });
    }
};

