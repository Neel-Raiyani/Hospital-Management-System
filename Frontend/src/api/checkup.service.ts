import { checkupApi } from './services';
import type { Checkup, CheckupCreateData } from '../types/checkup';

export const checkupService = {
    /**
     * Create a new checkup for an appointment
     */
    createCheckup: async (data: CheckupCreateData): Promise<Checkup> => {
        const response = await checkupApi.post('/checkup/create', data);
        return response.data.checkup;
    },

    /**
     * Update an existing checkup
     */
    updateCheckup: async (id: string, data: Partial<CheckupCreateData>): Promise<void> => {
        await checkupApi.patch(`/checkup/update/${id}`, data);
    },

    /**
     * Fetch all checkups for a specific patient
     */
    getPatientCheckups: async (patientId: string): Promise<Checkup[]> => {
        const response = await checkupApi.get(`/checkup/patient/${patientId}`);
        return response.data.checkups;
    },

    /**
     * Update follow-up date for a checkup
     */
    updateFollowUp: async (id: string, nextFollowUp: string): Promise<Checkup> => {
        const response = await checkupApi.patch(`/checkup/followup/${id}`, { nextFollowUp });
        return response.data.checkup;
    },

    /**
     * Get checkup by appointment ID
     */
    getCheckupByAppointment: async (appointmentId: string): Promise<Checkup> => {
        const response = await checkupApi.get(`/checkup/appointment/${appointmentId}`);
        return response.data;
    }
};
