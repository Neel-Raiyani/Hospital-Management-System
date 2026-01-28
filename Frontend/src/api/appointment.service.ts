import axiosInstance from './axios';
import type { Appointment, AppointmentFilters, AppointmentStatus } from '../types/appointment';

export const appointmentService = {
    /**
     * Fetch appointments with optional filters
     */
    getAppointments: async (filters?: AppointmentFilters): Promise<Appointment[]> => {
        const response = await axiosInstance.get('/opd/appointments', { params: filters });
        return response.data;
    },

    /**
     * Update appointment status
     */
    updateStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
        const response = await axiosInstance.patch(`/opd/appointments/${id}/status`, { status });
        return response.data.updatedAppointment;
    },

    /**
     * Get appointments for a specific doctor
     */
    getDoctorAppointments: async (doctorId: string, date?: string): Promise<Appointment[]> => {
        const response = await axiosInstance.get(`/opd/doctor/${doctorId}`, { params: { date } });
        return response.data;
    },

    /**
     * Book a new appointment
     */
    bookAppointment: async (patientId: string, doctorId: string): Promise<any> => {
        const response = await axiosInstance.post('/opd/book', { patientId, doctorId });
        return response.data;
    }
};
