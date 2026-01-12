import express from 'express';
import upload from '@middlewares/upload.js';
import {
    downloadReport,
    getPendingLabTests,
    getReportsByPatient,
    createLabReport,
    updateLabReport,
    cancelLabTest,
} from '@controllers/labController.js';
import auth from '@middlewares/auth.js';
import role from '@middlewares/role.js';
import {
    cancelLabTestValidator,
    createLabReportValidator,
    downloadReportValidator,
    getReportsByPatientValidator,
    updateLabReportValidator,
    validate,
} from '@middlewares/validation.js';
const router = express.Router();

router.post(
    '/create-report',
    auth,
    role('LAB'),
    upload.array('report', 5),
    createLabReportValidator,
    validate,
    createLabReport,
);

router.get('/labtests/pending', auth, role('LAB'), getPendingLabTests);
router.get(
    '/report/:patientId',
    auth,
    role('LAB'),
    getReportsByPatientValidator,
    validate,
    getReportsByPatient,
);
router.get(
    '/download/:reportId',
    auth,
    role('LAB', 'DOCTOR'),
    downloadReportValidator,
    validate,
    downloadReport,
);

router.patch(
    '/update/report/:reportId',
    auth,
    role('LAB'),
    upload.array('report', 5),
    updateLabReportValidator,
    validate,
    updateLabReport,
);
router.patch(
    '/cancel-labtest/:id',
    auth,
    role('LAB'),
    cancelLabTestValidator,
    validate,
    cancelLabTest,
);

export default router;
