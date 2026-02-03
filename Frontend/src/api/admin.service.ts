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

interface StaffUser {
    id: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'LAB' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

export const adminService = {
    /**
     * Fetch statistics for the admin dashboard.
     * Counts users by role and processes appointment trends.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            const [usersResponse, appointments] = await Promise.all([
                authApi.get<StaffUser[]>('/auth/users'),
                appointmentService.getAppointments()
            ]);

            const users = usersResponse.data;

            const doctorCount = users.filter(u => u.role === 'DOCTOR').length;
            const receptionistCount = users.filter(u => u.role === 'RECEPTIONIST').length;
            const labStaffCount = users.filter(u => u.role === 'LAB').length;
            const adminCount = users.filter(u => u.role === 'ADMIN').length;

            // Calculate appointments per day for the last 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return {
                    dayName: days[d.getDay()],
                    dateStr: d.toISOString().split('T')[0]
                };
            }).reverse();

            const appointmentsByDay = last7Days.map(day => {
                const count = appointments.filter(app => {
                    const appDate = new Date(app.appointmentDate).toISOString().split('T')[0];
                    return appDate === day.dateStr;
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
