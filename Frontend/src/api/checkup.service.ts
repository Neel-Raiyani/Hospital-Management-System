import axiosInstance from './axios';
import type { Checkup, CheckupCreateData } from '../types/checkup';

export const checkupService = {
    /**
     * Create a new checkup for an appointment
     */
    createCheckup: async (data: CheckupCreateData): Promise<Checkup> => {
        const response = await axiosInstance.post('/checkup/create', data);
        return response.data.checkup;
    },

    /**
     * Update an existing checkup
     */
    updateCheckup: async (id: string, data: Partial<CheckupCreateData>): Promise<void> => {
        await axiosInstance.patch(`/checkup/update/${id}`, data);
    },

    /**
     * Fetch all checkups for a specific patient
     */
    getPatientCheckups: async (patientId: string): Promise<Checkup[]> => {
        const response = await axiosInstance.get(`/checkup/patient/${patientId}`);
        return response.data.checkups;
    },

    /**
     * Update follow-up date for a checkup
     */
    updateFollowUp: async (id: string, nextFollowUp: string): Promise<Checkup> => {
        const response = await axiosInstance.patch(`/checkup/followup/${id}`, { nextFollowUp });
        return response.data.checkup;
    }
};
