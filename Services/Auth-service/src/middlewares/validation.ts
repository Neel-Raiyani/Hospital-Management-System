import type { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

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

export const createUserValidation = [
    body("name")
        .notEmpty().withMessage("Name is Required"),

    body("email")
        .isEmail().withMessage("Valid email is required"),

    body("role")
        .notEmpty().withMessage("Role is required")
        .isIn(["DOCTOR", "LAB", "RECEPTIONIST"]).withMessage("Invalid Role!!!"),

    body("doctorData").if(body("role").equals("DOCTOR")).notEmpty().withMessage("Doctor data is required"),

    body("doctorData.specialization")
        .if((_, { req }) => req.body.role === "DOCTOR" && req.body.doctorData)
        .notEmpty().withMessage("Specialization is required"),

    body("doctorData.qualification")
        .if((_, { req }) => req.body.role === "DOCTOR" && req.body.doctorData)
        .notEmpty().withMessage("Qualification is required"),

    body("doctorData.experienceYears")
        .if((_, { req }) => req.body.role === "DOCTOR" && req.body.doctorData)
        .isInt({ min: 0 }).withMessage("Experience years must be a positive number"),

    body("doctorData.opdStartTime")
        .if((_, { req }) => req.body.role === "DOCTOR" && req.body.doctorData)
        .notEmpty().withMessage("OPD start time is required"),

    body("doctorData.opdEndTime")
        .if((_, { req }) => req.body.role === "DOCTOR" && req.body.doctorData)
        .notEmpty().withMessage("OPD end time is required"),

    body("receptionistData").if(body("role").equals("RECEPTIONIST")).notEmpty().withMessage("Receptionist data is required"),

    body("receptionistData.phone")
        .if((_, { req }) => req.body.role === "RECEPTIONIST" && req.body.receptionistData)
        .isMobilePhone("en-IN").withMessage("Valid phone number is required"),

    body("receptionistData.shift")
        .if((_, { req }) => req.body.role === "RECEPTIONIST" && req.body.receptionistData)
        .notEmpty().withMessage("Shift is required")
        .isIn(["MORNING", "EVENING", "NIGHT"]) .withMessage("Shift must be in uppercase: MORNING, EVENING, or NIGHT")
]

export const loginValidation = [
    body("email")
        .isEmail().withMessage("Valid email is required"),
    body("password")
        .notEmpty().withMessage("Password is required").isLength({ min: 6 })
        .withMessage("Password must be of minimum length 6").isLength({ max: 8 })
        .withMessage("Password must be of maximum length 8")
]

export const changePasswordValidation = [
    body("oldPassword")
        .notEmpty().withMessage("Old Password is required").isLength({ min: 6 })
        .withMessage("Password must be of minimum length 6")
        .isLength({ max: 8 }).withMessage("Password must be of maximum length 8"),
    body("newPassword")
        .notEmpty().withMessage("New Password is required")
        .isLength({ min: 6 }).withMessage("Password must be of minimum length 6")
        .isLength({ max: 8 }).withMessage("Password must be of maximum length 8")
]
