import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth.service.ts';
import { getUserFromToken, isTokenExpired } from '../utils/jwt.ts';
import type { LoginCredentials } from '../types/auth.ts';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST';
    forcePasswordChange: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    checkAuth: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (storedToken && !isTokenExpired(storedToken)) {
            const userData = getUserFromToken(storedToken);
            if (userData) {
                setToken(storedToken);
                setUser(userData);
            } else {
                localStorage.removeItem('token');
            }
        } else {
            localStorage.removeItem('token');
        }

        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            const { token: newToken } = response;

            // Store token
            localStorage.setItem('token', newToken);
            setToken(newToken);

            // Decode and set user data
            const userData = getUserFromToken(newToken);
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const checkAuth = (): boolean => {
        if (!token) return false;
        if (isTokenExpired(token)) {
            logout();
            return false;
        }
        return true;
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
