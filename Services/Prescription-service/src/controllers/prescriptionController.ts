import type { Request, Response } from 'express';
import prisma from 'prisma/client.js';
import PDFDocument from 'pdfkit';
import type { Medicine } from 'types/medicine.js';
import type { Prisma } from '@prisma/client';
import logger from '@utils/logger.js';

export const createPrescription = async (req: Request, res: Response) => {
    try {
        const { appointmentId, diagnosis, instructions, medicines } = req.body;

        logger.info(`Create prescription request | appointmentId=${appointmentId}`);

        const sanitizedMedicines: Prisma.InputJsonValue = medicines.map((med: Medicine) => ({
            name: med.name,
            dose: med.dose,
            duration: med.duration,
        }));

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const duplicate = await prisma.prescription.findFirst({ where: { appointmentId } });

        if (duplicate) {
            return res
                .status(409)
                .json({ messgae: 'Prescription already exist for this appointment' });
        }

        if (!['WAITING', 'REVIEW'].includes(appointment.status)) {
            return res.status(400).json({
                message: 'Prescription cannot be created at this stage',
            });
        }

        const created = await prisma.prescription.create({
            data: {
                appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                diagnosis,
                instructions,
                medicines: sanitizedMedicines,
            },
        });

        logger.info(`Prescription created successfully | appointmentId=${appointmentId}`);

        res.status(201).json({
            message: 'Prescription created successfully',
            created,
        });
    } catch (error) {
        logger.error(`Create prescription error | error=${(error as Error).message}`);
        res.status(500).json({ message: 'Failed to create prescription', error });
    }
};

export const getPrescriptionByAppointment = async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params as { appointmentId: string };

        logger.info(`Fetch prescription by appointment | appointmentId=${appointmentId}`);

        const prescription = await prisma.prescription.findFirst({
            where: { appointmentId: appointmentId },
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        logger.info(
            `Prescription fetched | appointmentId=${appointmentId} | prescriptionId=${prescription.id}`,
        );

        res.json(prescription);
    } catch (error) {
        logger.error(`Fetch prescription error | error=${(error as Error).message}`);
        res.status(500).json({ message: 'Failed to fetch prescription', error });
    }
};

export const getPatientPrescriptions = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params as { patientId: string };

        logger.info(`Fetch patient prescriptions | patientId=${patientId}`);

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' },
        });

        if (!prescriptions) {
            return res.status(404).json({ message: 'Prescriptions for this patient not found' });
        }

        logger.info(
            `Patient prescriptions fetched | patientId=${patientId} | count=${prescriptions.length}`,
        );

        res.json(prescriptions);
    } catch (error) {
        logger.error(`Fetch patient prescriptions error | error=${(error as Error).message}`);
        res.status(500).json({ message: 'Failed to fetch prescriptions', error });
    }
};

export const exportPrescriptionPDF = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        logger.info(`Export prescription PDF request | prescriptionId=${id}`);

        const prescription = await prisma.prescription.findUnique({
            where: { id },
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=prescription-${id}.pdf`);

        doc.pipe(res);

        doc.fontSize(18).text('HOSPITAL PRESCRIPTION', { align: 'center' }).moveDown(1.5);

        doc.fontSize(12)
            .text(`Prescription ID : ${prescription.id}`)
            .text(`Appointment ID  : ${prescription.appointmentId}`)
            .text(`Patient ID      : ${prescription.patientId}`)
            .text(`Doctor ID       : ${prescription.doctorId}`)
            .text(`Date            : ${new Date(prescription.createdAt).toDateString()}`)
            .moveDown();

        if (prescription.diagnosis) {
            doc.fontSize(14)
                .text('Diagnosis', { underline: true })
                .moveDown(0.5)
                .fontSize(12)
                .text(prescription.diagnosis)
                .moveDown();
        }

        doc.fontSize(14).text('Medicines', { underline: true }).moveDown(0.5);

        const medicines = prescription.medicines as any[];

        medicines.forEach((med, index) => {
            doc.fontSize(12).text(
                `${index + 1}. ${med.name} - ${med.dose}, ${med.frequency}, ${med.days} days`,
            );
        });

        doc.moveDown();

        if (prescription.instructions) {
            doc.fontSize(14)
                .text('Instructions', { underline: true })
                .moveDown(0.5)
                .fontSize(12)
                .text(prescription.instructions)
                .moveDown();
        }

        doc.moveDown(2)
            .fontSize(12)
            .text('Doctor Signature:', { align: 'right' })
            .moveDown(1)
            .text('_________________________', { align: 'right' });

        logger.info(`Prescription PDF exported successfully | prescriptionId=${id}`);

        doc.end();
    } catch (error) {
        logger.error(`Export prescription PDF error | error=${(error as Error).message}`);
        res.status(500).json({ message: 'Failed to export prescription PDF', error });
    }
};

export const updatePrescription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { diagnosis, instructions, medicines } = req.body;

        logger.info(`Update prescription request | prescriptionId=${id}`);

        const prescription = await prisma.prescription.findUnique({
            where: { id },
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        const sanitizedMedicines: Prisma.InputJsonValue = medicines.map((med: Medicine) => ({
            name: med.name,
            dose: med.dose,
            duration: med.duration,
        }));

        const updatedPrescription = await prisma.prescription.update({
            where: { id },
            data: {
                diagnosis: diagnosis,
                instructions: instructions,
                medicines: sanitizedMedicines,
            },
        });

        logger.info(`Prescription updated successfully | prescriptionId=${id}`);

        res.status(200).json({
            message: 'Prescription updated successfully',
            updatedPrescription,
        });
    } catch (error) {
        logger.error(`Update prescription error | error=${(error as Error).message}`);
        res.status(500).json({ message: 'Failed to update prescription', error });
    }
};
