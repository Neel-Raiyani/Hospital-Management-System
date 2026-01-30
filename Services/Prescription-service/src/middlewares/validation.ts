import type { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array().map((err) => {
                return {
                    message: err.msg,
                };
            }),
        });
    }
    next();
};

export const createPrescriptionValidator = [
    body('appointmentId')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .isMongoId()
        .withMessage('Appointment ID must be valid'),

    body('medicines').isArray({ min: 1 }).withMessage('Medicines must be a non-empty array'),
    body('medicines.*.name')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine name is required'),
    body('medicines.*.dose')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine dose is required'),
    body('medicines.*.duration')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine duration is required'),
    body('diagnosis').optional().isString(),
    body('instructions').optional().isString(),
];

export const getPrescriptionByAppointmentValidator = [
    param('appointmentId')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .isMongoId()
        .withMessage('Appointment ID must be valid'),
];

export const getPatientPrescriptionValidator = [
    param('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Patient ID must be valid'),
];

export const exportPrescriptionValidator = [
    param('id')
        .notEmpty()
        .withMessage('Precription ID is required')
        .isMongoId()
        .withMessage('Precription ID must be valid'),
];

export const updatePrescriptionValidator = [
    param('id')
        .notEmpty()
        .withMessage('Prescription ID is required')
        .isMongoId()
        .withMessage('Prescription ID must be valid'),

    body('medicines').isArray({ min: 1 }).withMessage('Medicines must be a non-empty array'),
    body('medicines.*.name')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine name is required'),
    body('medicines.*.dose')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine dose is required'),
    body('medicines.*.duration')
        .if(body('medicines').exists())
        .notEmpty()
        .withMessage('Medicine duration is required'),
    body('diagnosis').optional().isString(),
    body('instructions').optional().isString(),
];
