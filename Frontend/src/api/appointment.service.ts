import { appointmentApi } from './services';
import type { Appointment, AppointmentFilters, AppointmentStatus } from '../types/appointment';

export const appointmentService = {
    /**
     * Fetch appointments with optional filters
     */
    getAppointments: async (filters?: AppointmentFilters): Promise<Appointment[]> => {
        const response = await appointmentApi.get('/appointment/appointments', {
            params: filters
        });
        return response.data;
    },

    /**
     * Update appointment status
     */
    updateStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
        const response = await appointmentApi.patch(`/appointment/update-status/${id}`, { status });
        return response.data.updatedAppointment;
    },

    /**
     * Get appointments for a specific doctor
     */
    getDoctorAppointments: async (doctorId: string, date?: string): Promise<Appointment[]> => {
        const response = await appointmentApi.get(`/appointment/doctor/${doctorId}`, {
            params: { date }
        });
        return response.data;
    },

    /**
     * Book a new appointment
     */
    bookAppointment: async (patientId: string, doctorId: string, appointmentDate?: string): Promise<any> => {
        const response = await appointmentApi.post('/appointment/book', { patientId, doctorId, appointmentDate });
        return response.data;
    }
};
