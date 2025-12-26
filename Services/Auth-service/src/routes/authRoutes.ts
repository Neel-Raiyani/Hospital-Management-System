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

const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be of minimum length 6")
        .isLength({ max: 8 }).withMessage("Password must be of maximum length 8")
]

const changePasswordValidation = [
    body("oldPassword").notEmpty().withMessage("Old Password is required")
        .isLength({ min: 6 }).withMessage("Password must be of minimum length 6")
        .isLength({ max: 8 }).withMessage("Password must be of maximum length 8"),
    body("newPassword").notEmpty().withMessage("New Password is required")
        .isLength({ min: 6 }).withMessage("Password must be of minimum length 6")
        .isLength({ max: 8 }).withMessage("Password must be of maximum length 8")
]

router.post('/create', auth, role("ADMIN"), createUserValidation, validate, createUser);
router.post('/login', loginValidation, validate, login);

router.patch('/change-password', auth, changePasswordValidation, validate, changePassword);

export default router;