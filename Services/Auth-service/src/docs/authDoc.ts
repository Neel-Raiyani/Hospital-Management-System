/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, DOCTOR, RECEPTIONIST, LAB]
 *         isActive:
 *           type: boolean
 *         isPasswordChanged:
 *           type: boolean
 */

/**
 * @swagger
 * /auth/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     description: "Admin can create new users (Doctor, Receptionist, Lab Staff). Password is auto-generated."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, DOCTOR, RECEPTIONIST, LAB]
 *               doctorData:
 *                 type: object
 *                 properties:
 *                   specialization:
 *                     type: string
 *                   qualification:
 *                     type: string
 *                   experienceYears:
 *                     type: number
 *                   opdStartTime:
 *                     type: string
 *                   opdEndTime:
 *                     type: string
 *               receptionistData:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   shift:
 *                     type: string
 *               labStaffData:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   shift:
 *                     type: string
 *     responses:
 *       201:
 *         description: "User created successfully with generated password"
 *       409:
 *         description: "User already exists"
 *       500:
 *         description: "Internal server error"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: "Authenticate user and return JWT token"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Login successful, returns JWT token"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: "Invalid password"
 *       401:
 *         description: "Invalid credentials or inactive user"
 *       500:
 *         description: "Login failed"
 */

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Auth]
 *     description: "Authenticated user can change their password."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Password changed successfully"
 *       400:
 *         description: "Old password is incorrect"
 *       404:
 *         description: "User not found"
 *       500:
 *         description: "Internal server error"
 */
