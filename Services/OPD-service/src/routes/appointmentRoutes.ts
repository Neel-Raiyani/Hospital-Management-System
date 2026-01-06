import express from 'express';
import auth from '@middlewares/auth.js';
import role from '@middlewares/role.js';
import {
    bookAppointment,
    getDoctorAppointments,
    getPatientappointments,
    updateAppointmentStatus,
} from '@controllers/appointmentController.js';
import {
    bookAppointmentValidator,
    getDoctorAppointmentsValidator,
    getPatientAppointmentsValidator,
    updateAppointmentStatusValidator,
    validate,
} from '@middlewares/validation.js';

const router = express.Router();

router.post(
    '/book',
    auth,
    role('RECEPTIONIST'),
    bookAppointmentValidator,
    validate,
    bookAppointment,
);

router.get(
    '/doctor/:doctorId',
    auth,
    role('DOCTOR', 'RECEPTIONIST'),
    getDoctorAppointmentsValidator,
    validate,
    getDoctorAppointments,
);
router.get(
    '/patient/:patientId',
    auth,
    role('RECEPTIONIST', 'DOCTOR'),
    getPatientAppointmentsValidator,
    validate,
    getPatientappointments,
);

router.patch(
    '/update-status/:id',
    auth,
    role('DOCTOR', 'RECEPTIONIST'),
    updateAppointmentStatusValidator,
    validate,
    updateAppointmentStatus,
);

export default router;
