export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
    id: string;
    patientId: number;
    name: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    emergencyContact: string;
    medicalHistory?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePatientRequest {
    name: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    emergencyContact: string;
    medicalHistory?: string;
}

export interface CreatePatientResponse {
    message: string;
    patient: Omit<Patient, 'id' | 'patientId' | 'isActive' | 'createdAt' | 'updatedAt'>;
}

export interface PatientListResponse {
    page: number;
    limit: number;
    total: number;
    data: Patient[];
}
