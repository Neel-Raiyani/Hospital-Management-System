import type { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((err) => {
                return {
                    message: err.msg,
                };
            }),
        });
    }
    next();
};

export const createCheckupValidator = [
    body('appointmentId')
        .notEmpty()
        .withMessage('appointmentId is required')
        .isMongoId()
        .withMessage('Invalid appointment ID'),

    body('symptoms').notEmpty().withMessage('Symptoms are required'),
    body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
    body('labTests').optional().isArray().withMessage('labTests should be an array'),
];

export const updateCheckupValidator = [
    param('id')
        .notEmpty()
        .withMessage('Checkup ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),

    body('symptoms').optional().isString(),
    body('diagnosis').optional().isString(),
    body('doctorNotes').optional().isString(),
    body('labTests').optional().isArray(),
];

export const updateFollowUpValidator = [
    param('id')
        .notEmpty()
        .withMessage('Checkup ID is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),

    body('nextFollowUp').notEmpty().isISO8601().withMessage('nextFollowUp must be a valid date'),
];

export const getPatientCheckupsValidator = [
    param('patientId')
        .notEmpty()
        .withMessage('patientId is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),
];
