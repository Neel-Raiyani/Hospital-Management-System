export interface LabTestSuggestion {
    id?: string;
    testType: string;
    status?: 'PENDING' | 'COMPLETED';
}

export interface Checkup {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    symptoms: string;
    diagnosis: string;
    doctorNotes?: string;
    labTests?: LabTestSuggestion[];
    nextFollowUp?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CheckupCreateData {
    appointmentId: string;
    symptoms: string;
    diagnosis: string;
    doctorNotes?: string;
    labTests?: string[]; // Array of test types
}
