/**
 * @swagger
 * tags:
 *   - name: Appointment
 *     description: Appointment management APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         appointmentDate:
 *           type: string
 *           format: date
 *         tokenNumber:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [WAITING, LAB_TESTS, REVIEW, COMPLETED, CANCELLED]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /appointment/book:
 *   post:
 *     summary: Book an appointment
 *     tags: [Appointment]
 *     description: "Receptionist can book a new appointment for a patient with a doctor. Checks OPD hours and existing appointments."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Appointment booked successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: "Cannot book appointment outside OPD hours or OPD unavailable"
 *       409:
 *         description: "Appointment already exists for today"
 *       500:
 *         description: "Failed to book appointment"
 */

/**
 * @swagger
 * /appointment/doctor/{doctorId}:
 *   get:
 *     summary: Get doctor appointments
 *     tags: [Appointment]
 *     description: "Doctors and receptionists can fetch appointments for a specific doctor. Optionally filter by date using `?date=YYYY-MM-DD`."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Doctor ID"
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: "Optional date to filter appointments"
 *     responses:
 *       200:
 *         description: "List of appointments"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: "Missing required parameter: doctorId"
 *       500:
 *         description: "Failed to fetch doctor appointments"
 */

/**
 * @swagger
 * /appointment/patient/{patientId}:
 *   get:
 *     summary: Get patient appointments
 *     tags: [Appointment]
 *     description: "Receptionist and doctors can fetch all appointments for a patient."
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
 *         description: "List of patient appointments"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: "Missing required parameter: patientId"
 *       500:
 *         description: "Failed to fetch patient appointments"
 */

/**
 * @swagger
 * /appointment/update-status/{id}:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointment]
 *     description: "Doctors, receptionists, and lab staff can update appointment status. Validates allowed transitions and pending lab tests."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Appointment ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [WAITING, LAB_TESTS, REVIEW, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: "Status updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedAppointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: "Missing parameter, invalid transition, or finalized appointment"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Role cannot change to the requested status"
 *       404:
 *         description: "Appointment not found"
 *       500:
 *         description: "Failed to update status"
 */
