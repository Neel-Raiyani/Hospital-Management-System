import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

interface ErrorResponse {
    message?: string;
}

export const createAxiosInstance = (baseURL: string): AxiosInstance => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor for adding JWT token
    api.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: AxiosError) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for handling common errors
    api.interceptors.response.use(
        (response) => response,
        (error: AxiosError<ErrorResponse>) => {
            if (error.response?.status === 401) {
                // Handle unauthorized error (e.g., redirect to login)
                localStorage.removeItem('token');

                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // Handle 403 - Password change required
            if (error.response?.status === 403) {
                const message = error.response.data?.message || '';

                // Check if this is a password change required error
                if (message.toLowerCase().includes('password change required')) {
                    // Only redirect if not already on password change page
                    if (!window.location.pathname.includes('/change-password')) {
                        window.location.href = '/change-password-required';
                    }
                }
            }

            return Promise.reject(error);
        }
    );

    return api;
};
