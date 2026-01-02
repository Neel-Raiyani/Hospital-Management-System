import express from "express";
import { updateDoctor, deactivateDoctor, getDoctorById, getDoctors } from "@controllers/doctorController.js";
import auth from "@middlewares/auth.js";
import role from "@middlewares/role.js";
import { updateValidation, softDeleteValidation, validate } from "@middlewares/validation.js";
const router = express.Router();

router.get('/', auth, getDoctors);
router.get('/:id', auth, getDoctorById);

router.patch('/update/:id', auth, role("ADMIN", "DOCTOR"), updateValidation, validate, updateDoctor);
router.patch('/deactivate', auth, role("ADMIN"), softDeleteValidation, validate, deactivateDoctor);

export default router;
