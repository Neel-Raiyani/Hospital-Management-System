import express from "express";
import { login, createUser, changePassword, getUsers, updateUserStatus } from "@controllers/authController.js"
import { auth } from "@middlewares/auth.js";
import { role } from "@middlewares/role.js";
import { createUserValidation, loginValidation, changePasswordValidation, validate } from "@middlewares/validation.js";

const router = express.Router();

router.post('/create', auth, role("ADMIN"), createUserValidation, validate, createUser);
router.post('/login', loginValidation, validate, login);
router.get('/users', auth, role("ADMIN"), getUsers);
router.patch('/users/:userId/status', auth, role("ADMIN"), updateUserStatus);

router.patch('/change-password', auth, changePasswordValidation, validate, changePassword);

export default router;