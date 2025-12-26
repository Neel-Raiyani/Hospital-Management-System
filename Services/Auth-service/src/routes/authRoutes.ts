import express from "express";
import { login, createUser, changePassword } from "@controllers/authController.js"
import { auth } from "@middlewares/auth.js";
import { role } from "@middlewares/role.js";

const router = express.Router();

router.post('/create', auth, role("ADMIN"), createUser);
router.post('/login', login);

router.patch('/change-password', auth, changePassword);

export default router;