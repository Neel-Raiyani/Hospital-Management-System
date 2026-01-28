import api from './axios';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.ts';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<any> => {
        const response = await api.post('/auth/create', data);
        return response.data;
    },

    changePassword: async (data: any): Promise<any> => {
        const response = await api.patch('/auth/change-password', data);
        return response.data;
    }
};
