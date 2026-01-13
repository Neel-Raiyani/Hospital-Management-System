/**
 * @swagger
 * tags:
 *   - name: Prescription
 *     description: Prescription service APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Medicine:
 *       type: object
 *       required:
 *         - name
 *         - dose
 *         - duration
 *       properties:
 *         name:
 *           type: string
 *           example: Paracetamol
 *         dose:
 *           type: string
 *           example: 500mg
 *         duration:
 *           type: string
 *           example: 5 days
 *
 *     Prescription:
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
 *         diagnosis:
 *           type: string
 *         instructions:
 *           type: string
 *         medicines:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medicine'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /prescription/create:
 *   post:
 *     summary: Create prescription
 *     tags: [Prescription]
 *     description: >
 *       Creates a prescription for an appointment.
 *       Only doctors are allowed. One prescription per appointment.
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
 *               - medicines
 *             properties:
 *               appointmentId:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               instructions:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Medicine'
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Prescription cannot be created at this stage
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Prescription already exists
 */

/**
 * @swagger
 * /prescription/appointment/{appointmentId}:
 *   get:
 *     summary: Get prescription by appointment ID
 *     tags: [Prescription]
 *     description: Doctor can fetch prescription using appointment ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: Prescription not found
 */

/**
 * @swagger
 * /prescription/patient/{patientId}:
 *   get:
 *     summary: Get all prescriptions of a patient
 *     tags: [Prescription]
 *     description: Doctor can view all prescriptions of a patient.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prescription'
 *       404:
 *         description: Prescriptions not found
 */

/**
 * @swagger
 * /prescription/download/{id}:
 *   get:
 *     summary: Download prescription PDF
 *     tags: [Prescription]
 *     description: Doctors and receptionists can download prescription as PDF.
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
 *         description: Prescription PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Prescription not found
 */

/**
 * @swagger
 * /prescription/update/{id}:
 *   patch:
 *     summary: Update prescription
 *     tags: [Prescription]
 *     description: Doctor can update diagnosis, instructions and medicines.
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
 *               diagnosis:
 *                 type: string
 *               instructions:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Medicine'
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 */
