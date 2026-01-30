import { prescriptionApi } from './services';
import type { Prescription, PrescriptionCreateData } from '../types/prescription';

export const prescriptionService = {
    /**
     * Create a new prescription
     */
    createPrescription: async (data: PrescriptionCreateData): Promise<Prescription> => {
        const response = await prescriptionApi.post('/prescription/create', data);
        return response.data.created;
    },

    /**
     * Get all prescriptions for a specific patient
     */
    getPatientPrescriptions: async (patientId: string): Promise<Prescription[]> => {
        const response = await prescriptionApi.get(`/prescription/patient/${patientId}`);
        return response.data;
    },

    /**
     * Get prescription by appointment ID
     */
    getPrescriptionByAppointment: async (appointmentId: string): Promise<Prescription> => {
        const response = await prescriptionApi.get(`/prescription/appointment/${appointmentId}`);
        return response.data;
    },

    /**
     * Get download URL for prescription PDF
     */
    getDownloadUrl: (prescriptionId: string): string => {
        const baseURL = import.meta.env.VITE_PRESCRIPTION_API_URL || 'http://localhost:1018';
        return `${baseURL}/prescription/download/${prescriptionId}`;
    },

    /**
     * Update an existing prescription
     */
    updatePrescription: async (id: string, data: Partial<PrescriptionCreateData>): Promise<Prescription> => {
        const response = await prescriptionApi.patch(`/prescription/update/${id}`, data);
        return response.data.updatedPrescription || response.data;
    },

    /**
     * Download prescription PDF with auth headers
     */
    downloadPrescription: async (prescriptionId: string) => {
        const response = await prescriptionApi.get(`/prescription/download/${prescriptionId}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
