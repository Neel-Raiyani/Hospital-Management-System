import { authApi } from './services';
import { appointmentService } from './appointment.service';

export interface DashboardStats {
    doctorCount: number;
    receptionistCount: number;
    labStaffCount: number;
    adminCount: number;
    totalUsers: number;
    appointmentsByDay: { name: string; appointments: number }[];
    recentUsers: StaffUser[];
}

export interface StaffUser {
    id: string;
    name: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'LAB' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

export const adminService = {
    /**
     * Fetch all users
     */
    getAllUsers: async (): Promise<StaffUser[]> => {
        const response = await authApi.get<StaffUser[]>('/auth/users');
        return response.data;
    },

    /**
     * Fetch statistics for the admin dashboard.
     * Counts users by role and processes appointment trends.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const [users, appointments] = await Promise.all([
                adminService.getAllUsers(),
                appointmentService.getAppointments({ all: true })
            ]);

            const doctorCount = users.filter(u => u.role === 'DOCTOR').length;
            const receptionistCount = users.filter(u => u.role === 'RECEPTIONIST').length;
            const labStaffCount = users.filter(u => u.role === 'LAB').length;
            const adminCount = users.filter(u => u.role === 'ADMIN').length;

            // Calculate appointments per day for the last 7 days using local dates
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                // Standard YYYY-MM-DD local format
                const dateStr = [
                    d.getFullYear(),
                    String(d.getMonth() + 1).padStart(2, '0'),
                    String(d.getDate()).padStart(2, '0')
                ].join('-');

                return {
                    dayName: days[d.getDay()],
                    dateStr: dateStr
                };
            }).reverse();

            const appointmentsByDay = last7Days.map(day => {
                const count = appointments.filter(app => {
                    const d = new Date(app.appointmentDate);
                    const appDateStr = [
                        d.getFullYear(),
                        String(d.getMonth() + 1).padStart(2, '0'),
                        String(d.getDate()).padStart(2, '0')
                    ].join('-');
                    return appDateStr === day.dateStr;
                }).length;
                return { name: day.dayName, appointments: count };
            });

            return {
                doctorCount,
                receptionistCount,
                labStaffCount,
                adminCount,
                totalUsers: users.length,
                appointmentsByDay,
                recentUsers: users,
            };
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                doctorCount: 0,
                receptionistCount: 0,
                labStaffCount: 0,
                adminCount: 0,
                totalUsers: 0,
                appointmentsByDay: [],
                recentUsers: [],
            };
        }
    }
};
