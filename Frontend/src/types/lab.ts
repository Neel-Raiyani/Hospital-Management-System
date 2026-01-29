export interface LabTest {
    id: string;
    checkupId: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    testType: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
}

export interface LabReport {
    id: string;
    labTestId: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    reportUrls: string[];
    uploadedBy: string;
    createdAt: string;
}
