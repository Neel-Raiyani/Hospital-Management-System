import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import Layout from './components/layout/Layout.tsx';
import AdminLayout from './components/layout/AdminLayout.tsx';
import { ReceptionistLayout } from './components/layout/ReceptionistLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Unauthorized from './pages/Unauthorized.tsx';
import ForcePasswordChange from './pages/ForcePasswordChange.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import StaffManagement from './pages/admin/StaffManagement.tsx';
import Settings from './pages/admin/Settings.tsx';
import Profile from './pages/Profile.tsx';
import DoctorDashboard from './pages/doctor/DoctorDashboard.tsx';
import LabDashboard from './pages/lab/LabDashboard.tsx';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.tsx';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments.tsx';
import BookAppointment from './pages/receptionist/BookAppointment.tsx';
import AppointmentList from './pages/common/AppointmentList.tsx';
import PatientList from './pages/receptionist/PatientList.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
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
            <Route path="book-appointment" element={<BookAppointment />} />
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
            <Route path="profile" element={<Profile />} />

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
      </Router>
    </AuthProvider>
  );
}

export default App;
