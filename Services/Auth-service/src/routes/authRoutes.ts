import express from "express";
import { login, createUser, changePassword, getUsers, updateUserStatus, getUserProfile, updateUser, forgotPassword, resetPassword } from "@controllers/authController.js"
import { auth } from "@middlewares/auth.js";
import { role } from "@middlewares/role.js";
import { createUserValidation, loginValidation, changePasswordValidation, validate, forgotPasswordValidation, resetPasswordValidation } from "@middlewares/validation.js";

const router = express.Router();

router.post('/create', auth, role("ADMIN"), createUserValidation, validate, createUser);
router.post('/login', loginValidation, validate, login);
router.get('/users', auth, role("ADMIN"), getUsers);
router.patch('/users/:userId', auth, role("ADMIN"), createUserValidation, validate, updateUser);
router.patch('/users/:userId/status', auth, role("ADMIN"), updateUserStatus);
router.get('/users/profile', auth, getUserProfile);
router.get('/users/profile/:userId', auth, getUserProfile);

router.patch('/change-password', auth, changePasswordValidation, validate, changePassword);

router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

export default router;