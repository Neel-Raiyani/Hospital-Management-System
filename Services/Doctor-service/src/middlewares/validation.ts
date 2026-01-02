import type { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(err => {
                return {
                    message: err.msg
                }
            })
        });
    }
    next();

}

export const updateValidation = [
    param("id").notEmpty().withMessage("Doctor ID is required").isString().withMessage("Doctor ID must be a string"),

    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("specialization").optional().trim().notEmpty().withMessage("Specialization cannot be empty"),
    body("qualification").optional().trim().notEmpty().withMessage("Qualification cannot be empty"),
    body("experienceYears").optional().isInt({ min: 0 }).withMessage("Experience years must be a positive number"),
    body("opdStartTime").optional().notEmpty().withMessage("OPD start time cannot be empty"),
    body("opdEndTime").optional().notEmpty().withMessage("OPD end time cannot be empty")
]

export const softDeleteValidation = [
    param("id").notEmpty().withMessage("Doctor ID is required").isString().withMessage("Doctor ID must be a string")
]