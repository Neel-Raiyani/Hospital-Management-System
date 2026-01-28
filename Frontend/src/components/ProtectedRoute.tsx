import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Array<'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { isAuthenticated, user, isLoading, checkAuth } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Check if token is valid
    if (!checkAuth() || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
