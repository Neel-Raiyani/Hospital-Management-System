import { doctorApi } from './services';

export interface DashboardStats {
    doctorCount: number;
    receptionistCount: number;
    labStaffCount: number;
}

export const adminService = {
    /**
     * Fetch statistics for the admin dashboard.
     * Uses real doctor count and placeholder calls for others.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            // Real call for doctors
            const doctorsResponse = await doctorApi.get('/doctor');
            const doctorCount = Array.isArray(doctorsResponse.data) ? doctorsResponse.data.length : 0;

            // Placeholder logic for Receptionists and Lab Staff
            return {
                doctorCount,
                receptionistCount: 12, // Placeholder
                labStaffCount: 8,      // Placeholder
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            // Default/Fallback values
            return {
                doctorCount: 0,
                receptionistCount: 0,
                labStaffCount: 0,
            };
        }
    }
};
