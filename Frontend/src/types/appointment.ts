export type AppointmentStatus = 'WAITING' | 'LAB_TESTS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    tokenNumber: number;
    appointmentDate: string;
    status: AppointmentStatus;
    createdAt: string;
    updatedAt: string;
    // Joined data
    patient?: {
        name: string;
        phone: string;
        patientId: number;
    };
    doctor?: {
        name: string;
        specialization: string;
    };
}

export interface AppointmentFilters {
    status?: AppointmentStatus;
    doctorId?: string;
    patientId?: string;
    date?: string;
}
