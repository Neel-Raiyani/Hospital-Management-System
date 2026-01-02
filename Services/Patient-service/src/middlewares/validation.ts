import type { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array().map(err => {
                return {
                    message: err.msg
                }
            })
        })
    }
    next();
}

export const createValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required").isISO8601().withMessage("Date of birth must be in YYYY-MM-DD format"),
    body("gender").notEmpty().withMessage("Gender is required").isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be MALE, FEMALE, or OTHER in UPPERCASE"),
    body("phone").notEmpty().withMessage("Phone number is required").isMobilePhone("en-IN").withMessage("Phone number must be valid"),
    body("emergencyContact").notEmpty().withMessage("Emergency contact is required").isMobilePhone("en-IN").withMessage("Emergency contact must be valid"),
    body("medicalHistory").optional().isString().withMessage("Medical history must be a string")
]

export const updateValidation = [
    body("name").optional(),
    body("dateOfBirth").optional().isISO8601().withMessage("Date of birth must be in YYYY-MM-DD format"),
    body("gender").optional().isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be male, female, or other"),
    body("phone").optional().isMobilePhone("en-IN").withMessage("Phone number must be valid"),
    body("emergencyContact").optional().isMobilePhone("en-IN").withMessage("Emergency contact must be valid"),
    body("medicalHistory").optional().isString().withMessage("Medical history must be a string")
]