import type { Express, Request, Response } from 'express';
import prisma from 'prisma/client.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export const getPendingLabTests = async (req: Request, res: Response) => {
    try {
        const tests = await prisma.labTest.findMany({
            where: { status: 'PENDING' },
        });

        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Unable to fetch pending labtests', error });
    }
};

export const createLabReport = async (req: Request, res: Response) => {
    try {
        const { labTestId } = req.body;
        const files = req.files as Express.Multer.File[];
        const userId = req.user?.userId as string;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'At least one PDF report required' });
        }

        const labTest = await prisma.labTest.findUnique({
            where: { id: labTestId },
        });

        if (!labTest) {
            return res.status(404).json({ message: 'Lab test not found' });
        }

        const existingReport = await prisma.labReport.findFirst({
            where: { labTestId },
        });

        if (existingReport) {
            return res.status(409).json({
                message: 'Report already exists. Use update API.',
            });
        }

        const count = await prisma.$transaction(async (tx) => {
            await tx.labReport.create({
                data: {
                    labTestId,
                    appointmentId: labTest.appointmentId,
                    patientId: labTest.patientId,
                    doctorId: labTest.doctorId,
                    reportUrls: files.map((f) => `/uploads/reports/${f.filename}`),
                    uploadedBy: userId,
                },
            });

            await tx.labTest.update({
                where: { id: labTestId },
                data: { status: 'COMPLETED' },
            });

            const pending = await tx.labTest.count({
                where: {
                    appointmentId: labTest.appointmentId,
                    status: 'PENDING',
                },
            });
            return pending;
        });

        res.status(201).json({ message: 'Lab report created successfully', Pending_tests: count });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create lab report', error });
    }
};

export const updateLabReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!reportId) {
            return res.status(400).json({ message: 'Missing required parameter: reportId' });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'At least one PDF required' });
        }

        const report = await prisma.labReport.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        for (const filePath of report.reportUrls) {
            const absolutePath = path.resolve(filePath);

            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        await prisma.labReport.update({
            where: { id: reportId },
            data: {
                reportUrls: files.map((f) => `uploads/reports/${f.filename}`),
            },
        });

        res.json({ message: 'Lab report updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update report', error });
    }
};

export const getReportsByPatient = async (req: Request, res: Response) => {
    const { patientId } = req.params;

    if (!patientId) {
        return res.status(400).json({ message: 'Missing required parameter: patientId' });
    }

    const reports = await prisma.labReport.findMany({
        where: { patientId },
    });

    res.json(reports);
};

export const downloadReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).json({ message: 'Missing required parameter: reportId' });
        }

        const report = await prisma.labReport.findUnique({
            where: { id: reportId },
        });

        if (!report || !report.reportUrls || report.reportUrls.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.reportUrls.length === 1) {
            const filePath = report.reportUrls[0];

            if (!fs.existsSync(filePath as string)) {
                return res.status(404).json({ message: 'File not found on server' });
            }

            return res.download(filePath as string);
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=lab-report-${reportId}.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(res);

        for (const filePath of report.reportUrls) {
            if (fs.existsSync(filePath)) {
                archive.file(filePath, {
                    name: path.basename(filePath),
                });
            }
        }

        await archive.finalize();
    } catch (error) {
        res.status(500).json({ message: 'Failed to download report', error });
    }
};

export const cancelLabTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Missing required parameter: id' });
        }

        await prisma.labTest.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
        });
        res.status(200).json({ message: 'Labtest cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel labtest', error });
    }
};
