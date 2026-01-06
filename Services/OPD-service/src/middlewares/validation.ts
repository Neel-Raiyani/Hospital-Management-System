import type { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

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

export const bookAppointmentValidator = [
    body('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),

    body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isMongoId()
        .withMessage('Invalid doctor ID'),
];

export const getDoctorAppointmentsValidator = [
    param('doctorId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),

    query('date')
        .optional()
        .isISO8601({ strict: true })
        .withMessage('date must be in YYYY-MM-DD format'),
];

export const getPatientAppointmentsValidator = [
    param('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),
];

export const updateAppointmentStatusValidator = [
    param('id')
        .notEmpty()
        .withMessage('Appointment ID is required')
        .isMongoId()
        .withMessage('Invalid appointment ID'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['COMPLETED', 'CANCELLED'])
        .withMessage('Status must be COMPLETED or CANCELLED'),
];
