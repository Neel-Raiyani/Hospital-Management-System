/**
 * @swagger
 * tags:
 *   - name: Patient
 *     description: Patient management APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         patientId:
 *           type: integer
 *         name:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *         phone:
 *           type: string
 *         emergencyContact:
 *           type: string
 *         medicalHistory:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /patient/create:
 *   post:
 *     summary: Add a new patient
 *     tags: [Patient]
 *     description: Receptionist can add a new patient to the system.
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
 *               - dateOfBirth
 *               - gender
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               phone:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               medicalHistory:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /patient/list:
 *   get:
 *     summary: List all patients
 *     tags: [Patient]
 *     description: Receptionist and doctors can view all active patients. Supports pagination with query params `page` and `limit`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *       500:
 *         description: Failed to get data
 */

/**
 * @swagger
 * /patient/{id}:
 *   get:
 *     summary: Get patient details by ID
 *     tags: [Patient]
 *     description: Receptionist and doctors can fetch details of a single patient.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: "Missing required parameter: id"
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Failed to get patient details
 */

/**
 * @swagger
 * /patient/update/{id}:
 *   patch:
 *     summary: Update patient details
 *     tags: [Patient]
 *     description: Receptionist can update patient information.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               phone:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               medicalHistory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient details updated successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Updation failed
 */

/**
 * @swagger
 * /patient/deactivate/{id}:
 *   patch:
 *     summary: Deactivate patient
 *     tags: [Patient]
 *     description: Admin can deactivate (soft delete) a patient.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found or already deleted
 *       500:
 *         description: Internal server error
 */
