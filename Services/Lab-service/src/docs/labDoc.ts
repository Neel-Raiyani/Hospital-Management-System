/**
 * @swagger
 * tags:
 *   - name: Lab
 *     description: Lab management APIs
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     LabTest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         appointmentId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELLED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     LabReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         labTestId:
 *           type: string
 *         patientId:
 *           type: string
 *         doctorId:
 *           type: string
 *         appointmentId:
 *           type: string
 *         reportUrls:
 *           type: array
 *           items:
 *             type: string
 *         uploadedBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /lab/create-report:
 *   post:
 *     summary: Create lab report
 *     tags: [Lab]
 *     description: "Lab staff can upload PDF reports for a lab test. Max 5 files allowed."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - labTestId
 *               - report
 *             properties:
 *               labTestId:
 *                 type: string
 *               report:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: "Lab report created successfully"
 *       400:
 *         description: "At least one PDF report required or invalid data"
 *       404:
 *         description: "Lab test not found"
 *       409:
 *         description: "Report already exists"
 *       500:
 *         description: "Failed to create lab report"
 */

/**
 * @swagger
 * /lab/labtests/pending:
 *   get:
 *     summary: Get pending lab tests
 *     tags: [Lab]
 *     description: "Lab staff can fetch all pending lab tests."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "List of pending lab tests"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabTest'
 *       500:
 *         description: "Unable to fetch pending lab tests"
 */

/**
 * @swagger
 * /lab/report/{patientId}:
 *   get:
 *     summary: Get lab reports by patient
 *     tags: [Lab]
 *     description: "Lab staff can fetch all lab reports for a specific patient."
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
 *         description: "List of lab reports for the patient"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabReport'
 *       400:
 *         description: "Missing required parameter: patientId"
 *       500:
 *         description: "Failed to fetch lab reports"
 */

/**
 * @swagger
 * /lab/download/{reportId}:
 *   get:
 *     summary: Download lab report
 *     tags: [Lab]
 *     description: "Lab staff or doctors can download lab reports. If multiple files exist, a zip will be sent."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Lab report ID"
 *     responses:
 *       200:
 *         description: "PDF or zip of lab report downloaded"
 *       400:
 *         description: "Missing required parameter: reportId"
 *       404:
 *         description: "Report not found"
 *       500:
 *         description: "Failed to download report"
 */

/**
 * @swagger
 * /lab/update/report/{reportId}:
 *   patch:
 *     summary: Update lab report
 *     tags: [Lab]
 *     description: "Lab staff can update an existing lab report. Max 5 PDF files allowed."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Lab report ID"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - report
 *             properties:
 *               report:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: "Lab report updated successfully"
 *       400:
 *         description: "Missing parameter or no files provided"
 *       404:
 *         description: "Report not found"
 *       500:
 *         description: "Failed to update report"
 */

/**
 * @swagger
 * /lab/cancel-labtest/{id}:
 *   patch:
 *     summary: Cancel lab test
 *     tags: [Lab]
 *     description: "Lab staff can cancel a lab test."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Lab test ID"
 *     responses:
 *       200:
 *         description: "Lab test cancelled successfully"
 *       400:
 *         description: "Missing required parameter: id"
 *       500:
 *         description: "Failed to cancel lab test"
 */
