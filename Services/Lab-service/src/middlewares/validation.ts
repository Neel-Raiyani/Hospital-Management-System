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

export const createLabReportValidator = [
    body('labTestId')
        .notEmpty()
        .withMessage('Lab test ID is required')
        .isMongoId()
        .withMessage('Lab test ID must be valid'),
];

export const updateLabReportValidator = [
    param('reportId')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be valid'),
];

export const cancelLabTestValidator = [
    param('id')
        .notEmpty()
        .withMessage('Labtest ID is required')
        .isMongoId()
        .withMessage('Labtest ID must be valid'),
];

export const getReportsByPatientValidator = [
    param('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .isMongoId()
        .withMessage('Patient ID must be valid'),
];

export const downloadReportValidator = [
    param('reportId')
        .notEmpty()
        .withMessage('Report ID is required')
        .isMongoId()
        .withMessage('Report ID must be valid'),
];
