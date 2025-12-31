import express from "express";
import { body } from "express-validator";
import validate from "@middlewares/validation.js";
import auth from "@middlewares/auth.js";
import role from "@middlewares/role.js";
import { createPatient, deactivatePatient, getPatientById, listPatients, updatePatient } from "@controllers/patientController.js";
const router = express.Router();

const createValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required").isISO8601().withMessage("Date of birth must be in YYYY-MM-DD format"),
    body("gender").notEmpty().withMessage("Gender is required").isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be MALE, FEMALE, or OTHER in UPPERCASE"),
    body("phone").notEmpty().withMessage("Phone number is required").isMobilePhone("en-IN").withMessage("Phone number must be valid"),
    body("emergencyContact").notEmpty().withMessage("Emergency contact is required").isMobilePhone("en-IN").withMessage("Emergency contact must be valid"),
    body("medicalHistory").optional().isString().withMessage("Medical history must be a string")
]

const updateValidation = [
    body("name").optional(),
    body("dateOfBirth").optional().isISO8601().withMessage("Date of birth must be in YYYY-MM-DD format"),
    body("gender").optional().isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be male, female, or other"),
    body("phone").optional().isMobilePhone("en-IN").withMessage("Phone number must be valid"),
    body("emergencyContact").optional().isMobilePhone("en-IN").withMessage("Emergency contact must be valid"),
    body("medicalHistory").optional().isString().withMessage("Medical history must be a string")
]

router.post('/create', auth, role("RECEPTIONIST"), createValidation, validate, createPatient);

router.get('/list', auth, role("RECEPTIONIST", "DOCTOR"), listPatients);
router.get('/:id', auth, role("RECEPTIONIST", "DOCTOR"), getPatientById);

router.patch('/update/:id', auth, role("RECEPTIONIST"), updateValidation, validate, updatePatient);
router.patch('/deactivate/:id', auth, role("ADMIN"), deactivatePatient)

export default router;