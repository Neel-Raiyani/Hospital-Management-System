import express from "express";
import { body, param } from "express-validator";
import { updateDoctor, deactivateDoctor, getDoctorById, getDoctors } from "@controllers/doctorController.js";
import auth from "@middlewares/auth.js";
import role from "@middlewares/role.js";
import validate from "@middlewares/validation.js";
const router = express.Router();

const updateValidation = [
    param("id").notEmpty().withMessage("Doctor ID is required").isString().withMessage("Doctor ID must be a string"),

    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("specialization").optional().trim().notEmpty().withMessage("Specialization cannot be empty"),
    body("qualification").optional().trim().notEmpty().withMessage("Qualification cannot be empty"),
    body("experienceYears").optional().isInt({ min: 0 }).withMessage("Experience years must be a positive number"),
    body("opdStartTime").optional().notEmpty().withMessage("OPD start time cannot be empty"),
    body("opdEndTime").optional().notEmpty().withMessage("OPD end time cannot be empty")
]

const softDeleteValidation = [
    param("id").notEmpty().withMessage("Doctor ID is required").isString().withMessage("Doctor ID must be a string")
]

router.get('/', auth, getDoctors);
router.get('/:id', auth, getDoctorById);

router.patch('/update/:id', auth, role("ADMIN", "DOCTOR"), updateValidation, validate, updateDoctor);
router.patch('/deactivate', auth, role("ADMIN"), softDeleteValidation, validate, deactivateDoctor);

export default router;
