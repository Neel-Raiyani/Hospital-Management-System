import { createAxiosInstance } from './axiosInstanceFactory';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4018';
const PATIENT_API_URL = import.meta.env.VITE_PATIENT_API_URL || 'http://localhost:5018';
const APPOINTMENT_API_URL = import.meta.env.VITE_APPOINTMENT_API_URL || 'http://localhost:7018';
const CHECKUP_API_URL = import.meta.env.VITE_CHECKUP_API_URL || 'http://localhost:8018';
const LAB_API_URL = import.meta.env.VITE_LAB_API_URL || 'http://localhost:9018';
const PRESCRIPTION_API_URL = import.meta.env.VITE_PRESCRIPTION_API_URL || 'http://localhost:1018';
const DOCTOR_API_URL = import.meta.env.VITE_DOCTOR_API_URL || 'http://localhost:6018';

export const authApi = createAxiosInstance(AUTH_API_URL);
export const patientApi = createAxiosInstance(PATIENT_API_URL);
export const appointmentApi = createAxiosInstance(APPOINTMENT_API_URL);
export const checkupApi = createAxiosInstance(CHECKUP_API_URL);
export const labApi = createAxiosInstance(LAB_API_URL);
export const prescriptionApi = createAxiosInstance(PRESCRIPTION_API_URL);
export const doctorApi = createAxiosInstance(DOCTOR_API_URL);
