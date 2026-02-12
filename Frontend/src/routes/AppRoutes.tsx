import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';
import Layout from '../components/layout/Layout.tsx';
import AdminLayout from '../components/layout/AdminLayout.tsx';
import { ReceptionistLayout } from '../components/layout/ReceptionistLayout.tsx';
import { lazyWithLoader } from '../components/ui/PageTransition.tsx';

// Lazy load pages with transition wrapper
const LoginPage = lazyWithLoader(() => import('../pages/LoginPage.tsx'));
const Unauthorized = lazyWithLoader(() => import('../pages/Unauthorized.tsx'));
const ForcePasswordChange = lazyWithLoader(() => import('../pages/ForcePasswordChange.tsx'));
const AdminDashboard = lazyWithLoader(() => import('../pages/admin/AdminDashboard.tsx'));
const StaffManagement = lazyWithLoader(() => import('../pages/admin/StaffManagement.tsx'));
const Settings = lazyWithLoader(() => import('../pages/admin/Settings.tsx'));
const Profile = lazyWithLoader(() => import('../pages/Profile.tsx'));
const DoctorDashboard = lazyWithLoader(() => import('../pages/doctor/DoctorDashboard.tsx'));
const LabDashboard = lazyWithLoader(() => import('../pages/lab/LabDashboard.tsx'));
const ReceptionistDashboard = lazyWithLoader(() => import('../pages/receptionist/ReceptionistDashboard.tsx'));
const ReceptionistAppointments = lazyWithLoader(() => import('../pages/receptionist/ReceptionistAppointments.tsx'));
const BookAppointment = lazyWithLoader(() => import('../pages/receptionist/BookAppointment.tsx'));
const DoctorDirectory = lazyWithLoader(() => import('../pages/receptionist/DoctorDirectory.tsx'));
const AppointmentList = lazyWithLoader(() => import('../pages/AppointmentList.tsx'));
const PatientList = lazyWithLoader(() => import('../pages/receptionist/PatientList.tsx'));
const RevenueAnalytics = lazyWithLoader(() => import('../pages/admin/RevenueAnalytics.tsx'));
const ForgotPasswordPage = lazyWithLoader(() => import('../pages/ForgotPassword.tsx'));
const ResetPasswordPage = lazyWithLoader(() => import('../pages/ResetPassword.tsx'));

import { useAuth } from '../context/AuthContext.tsx';

function ProfileRedirect() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (user?.role === 'ADMIN') return <Navigate to="/admin/profile" replace />;
    if (user?.role === 'RECEPTIONIST') return <Navigate to="/receptionist/profile" replace />;

    return <Profile />;
}

export function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/change-password-required" element={<ForcePasswordChange />} />

            {/* Admin Routes - Standalone with AdminLayout */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<StaffManagement />} />
                <Route path="staff" element={<Navigate to="/admin/users" replace />} />
                <Route path="settings" element={<Settings />} />
                <Route path="revenue" element={<RevenueAnalytics />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:userId" element={<Profile />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Receptionist Routes - Standalone with ReceptionistLayout */}
            <Route
                path="/receptionist"
                element={
                    <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                        <ReceptionistLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<ReceptionistDashboard />} />
                <Route path="appointments" element={<ReceptionistAppointments />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="doctors" element={<DoctorDirectory />} />
                <Route path="book-appointment" element={<BookAppointment />} />
                <Route path="profile" element={<Profile />} />
                <Route path="book" element={<Navigate to="/receptionist/book-appointment" replace />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Main App Routes with Layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="profile" element={<ProfileRedirect />} />

                {/* Shared Routes */}
                <Route
                    path="appointments"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR', 'RECEPTIONIST', 'ADMIN', 'LAB']}>
                            <AppointmentList />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor Routes */}
                <Route
                    path="doctor/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Lab Routes */}
                <Route
                    path="lab/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['LAB']}>
                            <LabDashboard />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
