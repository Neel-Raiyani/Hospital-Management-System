/**
 * @swagger
 * tags:
 *   - name: Checkup
 *     description: Patient checkup management APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Checkup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         appointmentId:
 *           type: string
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         symptoms:
 *           type: string
 *         diagnosis:
 *           type: string
 *         doctorNotes:
 *           type: string
 *         labTests:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               testType:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED]
 *         nextFollowUp:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /checkup/create:
 *   post:
 *     summary: Create a checkup
 *     tags: [Checkup]
 *     description: "Doctor can create a checkup for a patient's appointment in WAITING state."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - symptoms
 *               - diagnosis
 *             properties:
 *               appointmentId:
 *                 type: string
 *               symptoms:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               doctorNotes:
 *                 type: string
 *               labTests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: "Checkup created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 checkup:
 *                   $ref: '#/components/schemas/Checkup'
 *       400:
 *         description: "Invalid appointment state"
 *       409:
 *         description: "Checkup already exists"
 *       500:
 *         description: "Failed to create checkup"
 */

/**
 * @swagger
 * /checkup/update/{id}:
 *   patch:
 *     summary: Update a checkup
 *     tags: [Checkup]
 *     description: "Doctor can update symptoms, diagnosis, notes, and add new lab tests."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Checkup ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symptoms:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               doctorNotes:
 *                 type: string
 *               labTests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: "Checkup updated successfully"
 *       400:
 *         description: "Missing required parameter or invalid data"
 *       404:
 *         description: "Checkup not found"
 *       500:
 *         description: "Failed to update checkup"
 */

/**
 * @swagger
 * /checkup/followup/{id}:
 *   patch:
 *     summary: Update next follow-up date
 *     tags: [Checkup]
 *     description: "Doctor can set or update the next follow-up date for a checkup."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Checkup ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nextFollowUp
 *             properties:
 *               nextFollowUp:
 *                 type: string
 *                 format: date-time
 *                 description: "Next follow-up date"
 *     responses:
 *       200:
 *         description: "Follow-up date updated successfully"
 *       400:
 *         description: "Missing required parameter"
 *       500:
 *         description: "Failed to update follow-up"
 */

/**
 * @swagger
 * /checkup/patient/{patientId}:
 *   get:
 *     summary: Get checkups of a patient
 *     tags: [Checkup]
 *     description: "Doctor can fetch all checkups for a patient."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Patient ID"
 *     responses:
 *       200:
 *         description: "List of checkups with lab tests"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Checkup'
 *       400:
 *         description: "Missing required parameter: patientId"
 *       500:
 *         description: "Failed to fetch checkups"
 */
