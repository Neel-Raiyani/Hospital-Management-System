import type { Request, Response } from 'express';
import prisma from 'prisma/client.js';

export const createCheckup = async (req: Request, res: Response) => {
    try {
        const { appointmentId, symptoms, diagnosis, doctorNotes, labTests } = req.body;

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });

        if (!appointment || appointment.status !== 'WAITING') {
            return res.status(400).json({
                message: 'Checkup can only be created when appointment is in WAITING state',
            });
        }

        const existingCheckup = await prisma.checkup.findFirst({
            where: { appointmentId },
        });

        if (existingCheckup) {
            return res.status(409).json({ message: 'Checkup already exists for this appointment' });
        }

        const checkup = await prisma.checkup.create({
            data: {
                appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                symptoms,
                diagnosis,
                doctorNotes,
                labTests: {
                    create: labTests?.map((test: string) => ({ testType: test })),
                },
            },
            include: {
                labTests: true,
            },
        });

        res.status(201).json({ message: 'Checkup created', checkup });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create checkup', error });
    }
};

export const updateCheckup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { symptoms, diagnosis, doctorNotes, labTests } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Missing required parameter: id' });
        }

        const checkup = await prisma.checkup.findUnique({ where: { id } });
        if (!checkup) {
            return res.status(404).json({ message: 'Checkup not found' });
        }

        await prisma.checkup.update({
            where: { id },
            data: {
                symptoms,
                diagnosis,
                doctorNotes,
            },
        });

        if (labTests?.length) {
            const existingTests = await prisma.labTest.findMany({
                where: { checkupId: id },
                select: { testType: true },
            });

            const existingTestSet = new Set(existingTests.map((test) => test.testType));

            const newTests = labTests.filter((test: string) => !existingTestSet.has(test));

            if (newTests.length) {
                await prisma.labTest.createMany({
                    data: newTests.map((test: string) => ({
                        checkupId: id,
                        testType: test,
                    })),
                });
            }
        }

        res.json({ message: 'Checkup updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update checkup', error });
    }
};

export const getPatientCheckups = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({ message: 'Missing required parameter: patientId' });
        }

        const checkups = await prisma.checkup.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: { labTests: true },
        });

        res.json({ checkups });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch checkups', error });
    }
};

export const updateFollowUp = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nextFollowUp } = req.body;

        const followupDate = new Date(nextFollowUp);

        if (!id) {
            return res.status(400).json({ message: 'Missing required parameter: id' });
        }

        const checkup = await prisma.checkup.update({
            where: { id },
            data: { nextFollowUp: followupDate },
        });

        res.json({ message: 'Follow-up date updated', checkup });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update follow-up', error });
    }
};
