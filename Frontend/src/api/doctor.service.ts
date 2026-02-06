import { doctorApi } from './services';

export interface Doctor {
    id: string;
    userId: string;
    name: string;
    specialization: string;
    qualification?: string;
    experienceYears?: number;
    opdStartTime: string;
    opdEndTime: string;
    checkupFee?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const doctorService = {
    /**
     * Fetch all active doctors
     */
    getDoctors: async (): Promise<Doctor[]> => {
        const response = await doctorApi.get('/doctor');
        return response.data;
    },

    /**
     * Get doctor by ID
     */
    getDoctorById: async (id: string): Promise<Doctor> => {
        const response = await doctorApi.get(`/doctor/${id}`);
        return response.data;
    },

    /**
     * Get doctor by userId (Auth service user ID)
     */
    getDoctorByUserId: async (userId: string): Promise<Doctor | null> => {
        const doctors = await doctorService.getDoctors();
        return doctors.find(doctor => doctor.userId === userId) || null;
    }
};
