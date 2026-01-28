export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST';
}

export interface AuthResponse {
    message: string;
    token: string;
    user?: User; // Optional as backend might just return token
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    role: string;
    doctorData?: any;
    receptionistData?: any;
    labStaffData?: any;
}
