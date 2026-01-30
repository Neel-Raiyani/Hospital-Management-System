import { authApi } from './services';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth.ts';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await authApi.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<any> => {
        const response = await authApi.post('/auth/create', data);
        return response.data;
    },

    changePassword: async (data: any): Promise<any> => {
        const response = await authApi.patch('/auth/change-password', data);
        return response.data;
    }
};
