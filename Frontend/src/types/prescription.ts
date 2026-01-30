export interface Medicine {
    name: string;
    dose: string;
    duration: string;
}

export interface Prescription {
    id: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    diagnosis?: string;
    medicines: Medicine[];
    instructions?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PrescriptionCreateData {
    appointmentId: string;
    diagnosis?: string;
    medicines: Medicine[];
    instructions?: string;
}
