import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { PageLoader } from './ui/PageTransition.tsx';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Array<'ADMIN' | 'DOCTOR' | 'LAB' | 'RECEPTIONIST'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { isAuthenticated, user, isLoading, checkAuth } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return <PageLoader />;
    }

    // Check if token is valid
    if (!checkAuth() || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user needs to change password (redirect to force password change page)
    // Skip this check if already on the password change page
    if (user?.forcePasswordChange && location.pathname !== '/change-password-required') {
        return <Navigate to="/change-password-required" replace />;
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
