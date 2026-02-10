import React, { useState, useEffect } from 'react';
import { Users, Calendar, UserPlus, Clock, RefreshCw } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Toast, useToast } from '../../components/ui/Toast';
import { appointmentService } from '../../api/appointment.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import PatientSearch from '../../components/features/receptionist/PatientSearch';
import PatientRegistrationForm from '../../components/features/receptionist/PatientRegistrationForm';
import AppointmentBookingModal from '../../components/features/receptionist/AppointmentBookingModal';
import DailyOPDQueue from '../../components/features/receptionist/DailyOPDQueue';
import type { Appointment } from '../../types/appointment';
import type { Patient } from '../../types/patient';

const ReceptionistDashboard: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    // Modal states
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getAppointments();

            // Enrich with patient and doctor details
            const enrichedData = await Promise.all(
                data.map(async (app) => {
                    try {
                        const [patient, doctor] = await Promise.all([
                            patientService.getPatientById(app.patientId),
                            doctorService.getDoctorById(app.doctorId)
                        ]);
                        return { ...app, patient, doctor };
                    } catch (err) {
                        console.error(`Failed to enrich appointment ${app.id}:`, err);
                        return app;
                    }
                })
            );

            setAppointments(enrichedData);
        } catch (error) {
            console.error('Failed to fetch receptionist dashboard data:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowPatientSearch(false);
        setShowAppointmentModal(true);
    };

    const handleRegistrationSuccess = async (patientPhone: string) => {
        showToast('Patient registered successfully!', 'success');
        setShowRegistrationForm(false);

        // Fetch the newly created patient and open appointment modal
        try {
            const response = await patientService.listPatients(1, 100);
            const newPatient = response.data.find(p => p.phone === patientPhone);
            if (newPatient) {
                setSelectedPatient(newPatient);
                setShowAppointmentModal(true);
            }
        } catch (error) {
            console.error('Failed to fetch new patient:', error);
        }
    };



    const handleAppointmentSuccess = () => {
        showToast('Appointment booked successfully!', 'success');
        setShowAppointmentModal(false);
        setSelectedPatient(null);
        fetchDashboardData();
    };

    const handleBookAppointment = () => {
        setShowPatientSearch(true);
    };

    const waitingAppointments = appointments.filter(app => app.status === 'WAITING' || app.status === 'LAB_TESTS');
    const todayCount = appointments.length;
    const completedCount = appointments.filter(app => app.status === 'COMPLETED').length;

    return (
        <div className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Receptionist Dashboard</h1>
                    <p className="text-[#6B7280] mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">Live System</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">OPD Queue</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '...' : waitingAppointments.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Today's Total</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '...' : todayCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '...' : completedCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Wait</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-1">15m</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                <button
                    onClick={handleBookAppointment}
                    className="group bg-blue-600 hover:bg-blue-700 p-6 rounded-lg shadow-sm transition-all text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Book Appointment</h3>
                            <p className="text-sm text-blue-100 mt-0.5">Schedule OPD consultation</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setShowRegistrationForm(true)}
                    className="group bg-teal-600 hover:bg-teal-700 p-6 rounded-lg shadow-sm transition-all text-left"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Register Patient</h3>
                            <p className="text-sm text-teal-100 mt-0.5">Add new patient profile</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="group bg-gray-700 hover:bg-gray-800 p-6 rounded-lg shadow-sm transition-all text-left disabled:opacity-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            {loading ? (
                                <Loader size="sm" variant="teal" />
                            ) : (
                                <RefreshCw className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Refresh Queue</h3>
                            <p className="text-sm text-gray-300 mt-0.5">Update real-time data</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Daily OPD Queue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <Loader size="md" text="Loading Queue Data..." variant="teal" />
                    </div>
                ) : (
                    <DailyOPDQueue appointments={appointments} loading={loading} />
                )}
            </div>

            {/* Patient Search Modal */}
            <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                <DialogContent className="sm:max-w-[650px] rounded-lg p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-semibold text-gray-900">Find Patient</DialogTitle>
                    </DialogHeader>
                    <PatientSearch
                        onPatientSelect={handlePatientSelect}
                        onCreateNew={() => { }}
                    />
                </DialogContent>
            </Dialog>

            {/* Patient Registration Modal */}
            <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
                <DialogContent className="sm:max-w-[650px] rounded-lg p-0 border-none shadow-2xl [&>button]:hidden bg-transparent">
                    <div className="bg-white rounded-lg p-6">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                                    <UserPlus className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900">Register Patient</DialogTitle>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Create a new patient profile</p>
                                </div>
                            </div>
                        </DialogHeader>
                        <PatientRegistrationForm
                            onSuccess={handleRegistrationSuccess}
                            onCancel={() => setShowRegistrationForm(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Appointment Booking Modal */}
            <AppointmentBookingModal
                isOpen={showAppointmentModal}
                onClose={() => {
                    setShowAppointmentModal(false);
                    setSelectedPatient(null);
                }}
                patient={selectedPatient}
                onSuccess={handleAppointmentSuccess}
            />

            {/* Toast Notifications */}
            <Toast
                message={toast.message}
                type={toast.type}
                isOpen={toast.isOpen}
                onClose={hideToast}
            />
        </div>
    );
};

export default ReceptionistDashboard;
