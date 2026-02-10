import type { Request, Response } from 'express';
import prisma from 'prisma/client.js';
import logger from '@utils/logger.js';

export const bookAppointment = async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId, appointmentDate: requestedDate, paymentType, checkupFee } = req.body;
        const receptionist = req.user?.userId as string;



        logger.info(`Book appointment request | patientId=${patientId} | doctorId=${doctorId} | date=${requestedDate || 'today'} | paymentType=${paymentType} | fee=${checkupFee}`);

        // Fetch doctor profile to get the truth for checkupFee
        const doctorProfile = await (prisma as any).doctor.findUnique({
            where: { id: doctorId }
        });

        if (!doctorProfile) {
            logger.error(`Doctor profile not found for booking | doctorId=${doctorId}`);
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const finalCheckupFee = doctorProfile.checkupFee ?? checkupFee ?? 0;

        const appointmentDate = requestedDate ? new Date(requestedDate) : new Date();
        appointmentDate.setHours(0, 0, 0, 0);

        const opd = await prisma.oPD.findUnique({
            where: { doctorId },
        });

        if (!opd || !opd.isActive) {
            return res.status(400).json({ message: 'Doctor OPD not available' });
        }

        // Only enforce OPD hours check for CURRENT day bookings
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);

        if (appointmentDate.getTime() === todayAtMidnight.getTime()) {
            const [startHour = 0, startMinute = 0] = opd.startTime.split(':').map(Number);
            const [endHour = 0, endMinute = 0] = opd.endTime.split(':').map(Number);

            const now = new Date();
            const startTime = new Date();
            startTime.setHours(startHour, startMinute, 0, 0);
            const endTime = new Date();
            endTime.setHours(endHour, endMinute, 0, 0);

            if (now > endTime) {
                return res.status(400).json({ message: 'Cannot book appointment for today after OPD hours' });
            }
        } else if (appointmentDate.getTime() < todayAtMidnight.getTime()) {
            return res.status(400).json({ message: 'Cannot book appointment for a past date' });
        }

        const existing = await prisma.appointment.findFirst({
            where: {
                patientId,
                doctorId,
                appointmentDate,
                status: 'WAITING',
            },
        });

        if (existing) {
            return res.status(409).json({ message: 'Patient already has a waiting appointment with this doctor on this date' });
        }

        const lastAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate,
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
                appointmentDate,
                tokenNumber: nextToken,
                paymentType,
                checkupFee: finalCheckupFee,
                receptionistId: receptionist
            },
        });

        logger.info(
            `Appointment booked successfully | appointmentId=${appointment.id} | tokenNumber=${nextToken} | date=${appointmentDate.toISOString()}`,
        );

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        logger.error(`Book appointment error | error=${(error as Error).message}`);

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

        logger.info(
            `Fetch doctor appointments request | doctorId=${doctorId} | date=${appointmentDate.toISOString()}`,
        );

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentDate,
            },
            orderBy: { tokenNumber: 'asc' },
        });

        logger.info(
            `Doctor appointments fetched | doctorId=${doctorId} | count=${appointments.length}`,
        );

        res.status(200).json(appointments);
    } catch (error) {
        logger.error(`Fetch doctor appointments error | error=${(error as Error).message}`);

        res.status(500).json({ message: 'Failed to fetch doctor appointments', error });
    }
};

export const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const { date, all } = req.query;
        logger.info(`Fetch all appointments request | date=${date || 'today'} | all=${all || 'false'}`);

        const appointmentDate = date ? new Date(date as string) : new Date();
        appointmentDate.setHours(0, 0, 0, 0);

        const userRole = req.user?.role;
        const whereClause: any = {};

        if (all !== 'true') {
            whereClause.appointmentDate = appointmentDate;
        }

        if (userRole === 'LAB') {
            whereClause.status = 'LAB_TESTS';
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            orderBy: { tokenNumber: 'asc' },
        });

        logger.info(`All appointments fetched | date=${appointmentDate.toISOString()} | user=${req.user?.name} (${userRole}) | count=${appointments.length}`);

        res.status(200).json(appointments);
    } catch (error) {
        logger.error(`Fetch all appointments error | error=${(error as Error).message}`);

        res.status(500).json({ message: 'Failed to fetch appointments', error });
    }
};


export const getPatientappointments = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;

        logger.info(`Fetch patient appointments request | patientId=${patientId}`);

        if (!patientId) {
            return res.status(400).json({ message: 'Missing required parameter: patientId' });
        }

        const appointments = await prisma.appointment.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
        });

        logger.info(
            `Patient appointments fetched | patientId=${patientId} | count=${appointments.length}`,
        );

        res.status(200).json(appointments);
    } catch (error) {
        logger.error(`Fetch patient appointments error | error=${(error as Error).message}`);

        res.status(500).json({ message: 'Failed to fetch patient appointments', error });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user?.role;

        logger.info(
            `Update appointment status request | appointmentId=${id} | requestedStatus=${status} | user=${req.user?.name} (${userRole})`,
        );

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

        if (appointment.status === status) {
            return res.status(200).json({
                message: 'Status already updated',
                updatedAppointment: appointment,
            });
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

        if (userRole === 'LAB' && status === 'REVIEW') {
            const pendingTests = await prisma.labTest.count({
                where: {
                    appointmentId: id,
                    status: 'PENDING',
                },
            });

            if (pendingTests > 0) {
                return res.status(400).json({
                    message: 'Cannot move to REVIEW. Pending lab tests exist.',
                });
            }
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        logger.info(
            `Appointment status updated successfully | appointmentId=${id} | newStatus=${status}`,
        );

        res.status(200).json({ message: 'Status updated successfully', updatedAppointment });
    } catch (error) {
        logger.error(`Update appointment status error | error=${(error as Error).message}`);

        res.status(500).json({ message: 'Failed to update status', error });
    }
};
