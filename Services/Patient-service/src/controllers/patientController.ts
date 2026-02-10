import type { Request, Response } from "express";
import prisma from "prisma/client.js";
import logger from '@utils/logger.js';

export const createPatient = async (req: Request, res: Response) => {
    try {
        const { name, dateOfBirth, gender, phone, emergencyContact, medicalHistory } = req.body;
        const receptionist = req.user?.userId as string;

        logger.info('Create patient request received');

        // Check if patient with same phone already exists
        const existingPatient = await prisma.patient.findFirst({
            where: { phone, isActive: true }
        });

        if (existingPatient) {
            logger.warn(`Create patient failed | phone ${phone} already exists`);
            return res.status(400).json({ message: "A patient with this phone number already exists" });
        }

        const counter = await prisma.counter.update({
            where: { name: "patient" },
            data: {
                value: { increment: 1 }
            }
        })

        const patient = await prisma.patient.create({
            data: {
                name,
                patientId: counter.value,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                phone,
                emergencyContact,
                medicalHistory,
                receptionistId: receptionist
            },
            select: {
                name: true,
                dateOfBirth: true,
                gender: true,
                phone: true,
                emergencyContact: true,
                medicalHistory: true,
                patientId: true,
                receptionistId: true
            }
        });

        logger.info(`Patient created successfully | patientId=${counter.value} | name=${name} | phone=${phone}`);

        res.status(201).json({ message: "Patient added successfully", patient });
    } catch (error) {
        logger.error(`Create patient failed | error=${(error as Error).message}`);

        res.status(500).json({ message: "Patient can't be added due to internal server error" })
    }
}



export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        logger.info(`Get patient by ID request | patientId=${id}`);

        if (!id) {
            return res.status(400).json({ message: "Missing required parameter: id" })
        }
        const patient = await prisma.patient.findUnique({ where: { id } });

        if (!patient || !patient.isActive) {
            return res.status(404).json({ mesage: "Patient not found" });
        }

        logger.info(`Patient fetched successfully | patientId=${id}`);

        res.json(patient);

    } catch (error) {
        logger.error(`Get patient error | error=${(error as Error).message}`);

        res.status(500).json({ message: "Failed to get patient details" })
    }
}


export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { name, dateOfBirth, gender, phone, emergencyContact, medicalHistory } = req.body;

        logger.info(`Update patient request | patientId=${id}`);

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

        logger.info(`Patient updated successfully | patientId=${id}`);

        res.status(200).json({ message: "Patient details updated successfully", updated });

    } catch (error) {
        logger.error(`Update patient error | error=${(error as Error).message}`);
        res.status(500).json({ message: "Updation failed" })
    }
}



export const listPatients = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 5);
        const search = req.query.search as string;
        const skip = (page - 1) * limit

        logger.info(`List patients request | page=${page} | limit=${limit} | search=${search || 'none'}`);

        const whereClause: any = { isActive: true };

        if (search) {
            const isNumeric = !isNaN(Number(search));
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];

            if (isNumeric) {
                whereClause.OR.push({ patientId: Number(search) });
            }
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            prisma.patient.count({ where: whereClause })
        ]);

        logger.info(`Patients listed successfully | page=${page} | count=${patients.length} | total=${total}`);

        res.status(200).json({ page, limit, total, data: patients })
    } catch (error) {
        logger.error(`List patients error | error=${(error as Error).message}`);
        res.status(500).json({ message: "Failed to get data" })
    }
}



export const deactivatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        logger.info(`Deactivate patient request | patientId=${id}`);

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

        logger.info(`Patient deactivated successfully | patientId=${id}`);

        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        logger.error(`Deactivate patient error | error=${(error as Error).message}`);

        return res.status(500).json({ message: "Internal server error" });
    }
}