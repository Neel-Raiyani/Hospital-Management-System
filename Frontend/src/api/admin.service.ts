import { authApi } from './services';

export interface DashboardStats {
    doctorCount: number;
    receptionistCount: number;
    labStaffCount: number;
    adminCount: number;
    totalUsers: number;
}

interface StaffUser {
    id: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'LAB' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
}

export const adminService = {
    /**
     * Fetch statistics for the admin dashboard.
     * Counts users by role from Auth service.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const response = await authApi.get<StaffUser[]>('/auth/users');
            const users = response.data;

            const doctorCount = users.filter(u => u.role === 'DOCTOR').length;
            const receptionistCount = users.filter(u => u.role === 'RECEPTIONIST').length;
            const labStaffCount = users.filter(u => u.role === 'LAB').length;
            const adminCount = users.filter(u => u.role === 'ADMIN').length;

            return {
                doctorCount,
                receptionistCount,
                labStaffCount,
                adminCount,
                totalUsers: users.length,
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                doctorCount: 0,
                receptionistCount: 0,
                labStaffCount: 0,
                adminCount: 0,
                totalUsers: 0,
            };
        }
    }
};
