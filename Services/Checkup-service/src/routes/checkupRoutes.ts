import express from 'express';
import auth from '@middlewares/auth.js';
import role from '@middlewares/role.js';
import {
    createCheckup,
    getPatientCheckups,
    updateCheckup,
    updateFollowUp,
} from '@controllers/checkupController.js';
import {
    createCheckupValidator,
    getPatientCheckupsValidator,
    updateCheckupValidator,
    updateFollowUpValidator,
    validate,
} from '@middlewares/validation.js';

const router = express.Router();

router.post('/create', auth, role('DOCTOR'), createCheckupValidator, validate, createCheckup);

router.patch('/update/:id', auth, role('DOCTOR'), updateCheckupValidator, validate, updateCheckup);
router.patch(
    '/followup/:id',
    auth,
    role('DOCTOR'),
    updateFollowUpValidator,
    validate,
    updateFollowUp,
);

router.get(
    '/patient/:patientId',
    auth,
    role('DOCTOR'),
    getPatientCheckupsValidator,
    validate,
    getPatientCheckups,
);

export default router;
