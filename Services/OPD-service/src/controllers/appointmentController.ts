import type { Request, Response } from 'express';
import prisma from 'prisma/client.js';

export const bookAppointment = async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const opd = await prisma.oPD.findUnique({
            where: { doctorId },
        });

        if (!opd || !opd.isActive) {
            return res.status(400).json({ message: 'Doctor OPD not available' });
        }

        const [startHour = 0, startMinute = 0] = opd.startTime.split(':').map(Number);
        const [endHour = 0, endMinute = 0] = opd.endTime.split(':').map(Number);

        const now = new Date();
        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);
        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        if (now < startTime || now > endTime) {
            return res.status(400).json({ message: 'Cannot book appointment outside OPD hours' });
        }

        const existing = await prisma.appointment.findFirst({
            where: {
                patientId,
                doctorId,
                appointmentDate: today,
                status: 'WAITING',
            },
        });

        if (existing) {
            return res.status(409).json({ message: 'Appointment already exists for today' });
        }

        const lastAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate: today,
            },
            orderBy: {
                tokenNumber: 'desc',
            },
        });

        const nextToken = lastAppointment ? lastAppointment.tokenNumber + 1 : 1;

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                appointmentDate: today,
                tokenNumber: nextToken,
            },
        });

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to book appointment', error });
    }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!doctorId) {
            return res.status(400).json({ message: 'Missing required parameter: DoctorId' });
        }

        const appointmentDate = date ? new Date(date as string) : new Date();
        appointmentDate.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentDate,
                status: 'WAITING',
            },
            orderBy: { tokenNumber: 'asc' },
        });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch doctor appointments', error });
    }
};

export const getPatientappointments = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({ message: 'Missing required parameter: patientId' });
        }

        const appointments = await prisma.appointment.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch patient appointments', error });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!id) {
            return res.status(400).json({ message: 'Missing required parameter: id' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const finalizedStatuses = ['COMPLETED', 'CANCELLED'];

        if (finalizedStatuses.includes(appointment.status)) {
            return res.status(400).json({ message: 'Finalized appointment cannot be updated' });
        }

        const allowedTransitions: { [key: string]: string[] } = {
            WAITING: ['LAB_TESTS', 'COMPLETED', 'CANCELLED'],
            LAB_TESTS: ['REVIEW'],
            REVIEW: ['COMPLETED'],
        };

        if (!allowedTransitions[appointment.status]?.includes(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${appointment.status} to ${status}`,
            });
        }

        const roleStatusMap: { [role: string]: string[] } = {
            DOCTOR: ['LAB_TESTS', 'COMPLETED'],
            LAB: ['REVIEW'],
            RECEPTIONIST: ['CANCELLED'],
        };

        const allowedStatuses = roleStatusMap[userRole];

        if (!allowedStatuses?.includes(status)) {
            return res.status(403).json({
                message: `Role ${userRole} cannot change status to ${status}`,
            });
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        res.status(200).json({ message: 'Status updated successfully', updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error });
    }
};
