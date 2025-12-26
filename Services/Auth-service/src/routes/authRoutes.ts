import express from "express";
import { body } from "express-validator"
import { login, createUser, changePassword } from "@controllers/authController.js"
import { auth } from "@middlewares/auth.js";
import { role } from "@middlewares/role.js";
import validate from "@middlewares/validation.js";

const router = express.Router();

const createUserValidation = [
    body("name").notEmpty().withMessage("Name is Required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("role").notEmpty().withMessage("Role is required").isIn(["ADMIN", "DOCTOR", "LAB", "RECEPTIONIST", "PATIENT"]).withMessage("Invalid Role!!!")
]

router.post('/create', auth, role("ADMIN"), createUserValidation, validate, createUser);
router.post('/login', login);

router.patch('/change-password', auth, changePassword);

export default router;