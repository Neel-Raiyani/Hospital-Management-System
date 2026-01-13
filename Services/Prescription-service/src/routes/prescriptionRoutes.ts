import express from 'express';
import auth from '@middlewares/auth.js';
import role from '@middlewares/role.js';
import {
    createPrescriptionValidator,
    getPatientPrescriptionValidator,
    getPrescriptionByAppointmentValidator,
    updatePrescriptionValidator,
    validate,
} from '@middlewares/validation.js';
import {
    createPrescription,
    exportPrescriptionPDF,
    getPatientPrescriptions,
    getPrescriptionByAppointment,
    updatePrescription,
} from '@controllers/prescriptionController.js';

const router = express.Router();

router.post(
    '/create',
    auth,
    role('DOCTOR'),
    createPrescriptionValidator,
    validate,
    createPrescription,
);

router.get(
    '/appointment/:appointmentId',
    auth,
    role('DOCTOR'),
    getPrescriptionByAppointmentValidator,
    validate,
    getPrescriptionByAppointment,
);
router.get(
    '/patient/:patientId',
    auth,
    role('DOCTOR'),
    getPatientPrescriptionValidator,
    validate,
    getPatientPrescriptions,
);
router.get('/download/:id', auth, role('DOCTOR', 'RECEPTIONIST'), exportPrescriptionPDF);

router.patch(
    '/update/:id',
    auth,
    role('DOCTOR'),
    updatePrescriptionValidator,
    validate,
    updatePrescription,
);

export default router;
