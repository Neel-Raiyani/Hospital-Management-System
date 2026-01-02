import express from "express";
import {createValidation, updateValidation, validate} from "@middlewares/validation.js";
import auth from "@middlewares/auth.js";
import role from "@middlewares/role.js";
import { createPatient, deactivatePatient, getPatientById, listPatients, updatePatient } from "@controllers/patientController.js";
const router = express.Router();

router.post('/create', auth, role("RECEPTIONIST"), createValidation, validate, createPatient);

router.get('/list', auth, role("RECEPTIONIST", "DOCTOR"), listPatients);
router.get('/:id', auth, role("RECEPTIONIST", "DOCTOR"), getPatientById);

router.patch('/update/:id', auth, role("RECEPTIONIST"), updateValidation, validate, updatePatient);
router.patch('/deactivate/:id', auth, role("ADMIN"), deactivatePatient)

export default router;