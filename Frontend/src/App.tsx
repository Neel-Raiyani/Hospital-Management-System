import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import Layout from './components/layout/Layout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Unauthorized from './pages/Unauthorized.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AddDoctorPage from './pages/admin/AddDoctor.tsx';
import AddReceptionistPage from './pages/admin/AddReceptionist.tsx';
import DoctorDashboard from './pages/doctor/DoctorDashboard.tsx';
import LabDashboard from './pages/lab/LabDashboard.tsx';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.tsx';
import BookAppointment from './pages/receptionist/BookAppointment.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/add-doctor"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AddDoctorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/add-receptionist"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AddReceptionistPage />
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

            {/* Receptionist Routes */}
            <Route
              path="receptionist/dashboard"
              element={
                <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="receptionist/book"
              element={
                <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                  <BookAppointment />
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
