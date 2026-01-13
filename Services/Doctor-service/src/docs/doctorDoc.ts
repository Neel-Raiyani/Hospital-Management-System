/**
 * @swagger
 * tags:
 *   - name: Doctor
 *     description: Doctor management APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Doctor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         specialization:
 *           type: string
 *         qualification:
 *           type: string
 *         experienceYears:
 *           type: number
 *         opdStartTime:
 *           type: string
 *           description: "OPD start time in HH:mm format"
 *         opdEndTime:
 *           type: string
 *           description: "OPD end time in HH:mm format"
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /doctor:
 *   get:
 *     summary: Get all active doctors
 *     tags: [Doctor]
 *     description: "Fetch all active doctors."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "List of active doctors"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       500:
 *         description: "Failed to fetch doctors"
 */

/**
 * @swagger
 * /doctor/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctor]
 *     description: "Fetch details of a specific doctor."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Doctor ID"
 *     responses:
 *       200:
 *         description: "Doctor details"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: "Doctor not found"
 *       500:
 *         description: "Failed to fetch doctor"
 */

/**
 * @swagger
 * /doctor/update/{id}:
 *   patch:
 *     summary: Update doctor details
 *     tags: [Doctor]
 *     description: "Admin or Doctor can update doctor details, including OPD timings."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Doctor ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specialization:
 *                 type: string
 *               qualification:
 *                 type: string
 *               experienceYears:
 *                 type: number
 *               opdStartTime:
 *                 type: string
 *                 description: "OPD start time in HH:mm format"
 *               opdEndTime:
 *                 type: string
 *                 description: "OPD end time in HH:mm format"
 *     responses:
 *       201:
 *         description: "Doctor updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedDoctor:
 *                   $ref: '#/components/schemas/Doctor'
 *       500:
 *         description: "Failed to update doctor"
 */

/**
 * @swagger
 * /doctor/deactivate:
 *   patch:
 *     summary: Deactivate doctor
 *     tags: [Doctor]
 *     description: "Admin can deactivate a doctor."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: "Doctor ID to deactivate"
 *     responses:
 *       200:
 *         description: "Doctor deactivated successfully"
 *       500:
 *         description: "Failed to deactivate doctor"
 */
