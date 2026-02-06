import { patientApi } from './services';
import type { CreatePatientRequest, CreatePatientResponse, Patient, PatientListResponse } from '../types/patient';

export const patientService = {
    /**
     * Create a new patient
     */
    createPatient: async (data: CreatePatientRequest): Promise<CreatePatientResponse> => {
        const response = await patientApi.post('/patient/create', data);
        return response.data;
    },

    /**
     * Get patient by ID
     */
    getPatientById: async (id: string): Promise<Patient> => {
        const response = await patientApi.get(`/patient/${id}`);
        return response.data;
    },

    /**
     * List patients with pagination and optional search
     */
    listPatients: async (page: number = 1, limit: number = 5, search?: string): Promise<PatientListResponse> => {
        const response = await patientApi.get('/patient/list', {
            params: { page, limit, search }
        });
        return response.data;
    },

    /**
     * Update patient details
     */
    updatePatient: async (id: string, data: Partial<CreatePatientRequest>): Promise<{ message: string; updated: Patient }> => {
        const response = await patientApi.patch(`/patient/update/${id}`, data);
        return response.data;
    },

    /**
     * Deactivate patient (soft delete)
     */
    deactivatePatient: async (id: string): Promise<{ message: string }> => {
        const response = await patientApi.patch(`/patient/deactivate/${id}`, {});
        return response.data;
    }
};
