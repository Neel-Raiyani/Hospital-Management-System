import { authApi } from './services';
import type { LoginCredentials, AuthResponse } from '../types/auth.ts';

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'LAB' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    // Doctor fields
    specialization?: string | null;
    experienceYears?: number | null;
    opdStartTime?: string | null;
    opdEndTime?: string | null;
    // Receptionist/Lab fields
    phone?: string | null;
    shift?: string | null;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'LAB' | 'ADMIN';
    doctorData?: {
        specialization: string;
        qualification?: string;
        experienceYears?: number;
        opdStartTime: string;
        opdEndTime: string;
    };
    receptionistData?: {
        phone?: string;
        shift: string;
    };
    labStaffData?: {
        phone: string;
        shift: string;
    };
}

export interface CreateUserResponse {
    message: string;
    Credentials: {
        email: string;
        password: string;
    };
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await authApi.post('/auth/login', credentials);
        return response.data;
    },

    changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ message: string; token?: string }> => {
        const response = await authApi.patch('/auth/change-password', data);
        return response.data;
    },

    getUsers: async (): Promise<StaffUser[]> => {
        const response = await authApi.get('/auth/users');
        return response.data;
    },

    createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
        const response = await authApi.post('/auth/create', data);
        return response.data;
    },

    deleteUser: async (userId: string): Promise<{ message: string }> => {
        const response = await authApi.delete(`/auth/users/${userId}`);
        return response.data;
    },

    updateUserStatus: async (userId: string, isActive: boolean): Promise<{ message: string }> => {
        const response = await authApi.patch(`/auth/users/${userId}/status`, { isActive });
        return response.data;
    },
    getUserProfile: async (userId?: string): Promise<StaffUser> => {
        const url = userId ? `/auth/users/profile/${userId}` : '/auth/users/profile';
        const response = await authApi.get(url);
        return response.data;
    },
};
