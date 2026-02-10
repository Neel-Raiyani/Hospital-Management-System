import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Loader2, Stethoscope, Pill, RefreshCw, Activity, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../api/doctor.service';
import { patientService } from '../../api/patient.service';
import { appointmentService } from '../../api/appointment.service';
import { prescriptionService } from '../../api/prescription.service';
import { checkupService } from '../../api/checkup.service';
import type { Appointment } from '../../types/appointment';
import CheckupForm from '../../components/features/appointments/CheckupForm';
import PrescriptionForm from '../../components/features/appointments/PrescriptionForm';

const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [doctorInfo, setDoctorInfo] = useState<any>(null);
    const [checkupAppointment, setCheckupAppointment] = useState<Appointment | null>(null);
    const [prescriptionAppointment, setPrescriptionAppointment] = useState<Appointment | null>(null);

    const fetchDashboardData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const doctor = await doctorService.getDoctorByUserId(user.id);

            if (doctor) {
                setDoctorInfo(doctor);
                const today = new Date().toISOString().split('T')[0];
                const appointmentsData = await appointmentService.getDoctorAppointments(doctor.id, today);

                const enrichedData = await Promise.all(
                    appointmentsData.map(async (app: Appointment) => {
                        try {
                            const [patient, checkup, prescription] = await Promise.allSettled([
                                patientService.getPatientById(app.patientId),
                                checkupService.getCheckupByAppointment(app.id),
                                prescriptionService.getPrescriptionByAppointment(app.id)
                            ]);

                            return {
                                ...app,
                                patient: patient.status === 'fulfilled' ? patient.value : undefined,
                                hasCheckup: checkup.status === 'fulfilled',
                                hasPrescription: prescription.status === 'fulfilled'
                            };
                        } catch (err) {
                            console.error(`Failed to enrich appointment ${app.id}:`, err);
                            return app;
                        }
                    })
                );

                setAppointments(enrichedData);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user?.id]);

    const getAppointmentsByStatus = (status: string) => {
        return appointments.filter(app => app.status === status);
    };

    const waiting = getAppointmentsByStatus('WAITING');
    const labPending = getAppointmentsByStatus('LAB_TESTS');
    const review = getAppointmentsByStatus('REVIEW');
    const completedCount = appointments.filter(app => app.status === 'COMPLETED').length;

    const stats = [
        { label: 'Waiting', value: waiting.length, icon: Clock, color: 'blue', sub: 'Ready for checkup' },
        { label: 'Lab Tests', value: labPending.length, icon: Activity, color: 'purple', sub: 'Awaiting results' },
        { label: 'For Review', value: review.length, icon: Stethoscope, color: 'indigo', sub: 'Results ready' },
        { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'emerald', sub: 'Finished today' }
    ];

    const AppointmentCard = ({ app, type }: { app: Appointment; type: 'WAITING' | 'LAB_TESTS' | 'REVIEW' }) => (
        <div className="bg-white p-5 rounded-4xl border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all ${type === 'WAITING' ? 'bg-blue-50 text-blue-600' :
                    type === 'LAB_TESTS' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                    {app.patient?.name?.[0] || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 leading-none truncate">{app.patient?.name || 'Unknown Patient'}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            Token: {app.tokenNumber}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {type === 'WAITING' && (
                    <>
                        <button
                            onClick={() => setCheckupAppointment(app)}
                            className={`flex-1 min-w-[120px] py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${app.hasCheckup
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-indigo-50'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                }`}
                        >
                            <Stethoscope className="w-3.5 h-3.5" /> {app.hasCheckup ? 'Update Checkup' : 'Checkup'}
                        </button>
                        <button
                            onClick={() => setPrescriptionAppointment(app)}
                            className={`flex-1 min-w-[120px] py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${app.hasPrescription
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-50'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                                }`}
                        >
                            <Pill className="w-3.5 h-3.5" /> {app.hasPrescription ? 'Update RX' : 'Prescription'}
                        </button>
                    </>
                )}
                {type === 'REVIEW' && (
                    <button
                        onClick={() => setPrescriptionAppointment(app)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${app.hasPrescription
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                            }`}
                    >
                        <Pill className="w-4 h-4" /> {app.hasPrescription ? 'Update Prescription' : 'Prescription'}
                    </button>
                )}
                {type === 'LAB_TESTS' && (
                    <div className="flex-1 py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border border-gray-100">
                        <Activity className="w-3 h-3 animate-pulse" /> At Laboratory
                    </div>
                )}
                <button
                    onClick={() => navigate(`/appointments`)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
                >
                    <Info className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Doctor Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">Welcome back, Dr. {doctorInfo?.name || 'Loading...'}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchDashboardData}
                        className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative overflow-hidden rounded-4xl bg-white p-8 shadow-2xl shadow-blue-900/10 sm flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-black text-gray-600 uppercase tracking-widest leading-none">On Duty</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                        <div className="relative">
                            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : stat.value}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Columns Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Waiting Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" /> Waiting List
                        </h2>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {waiting.length} Patients
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
                        ) : waiting.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-gray-100">
                                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Empty Queue</p>
                            </div>
                        ) : (
                            waiting.map(app => <AppointmentCard key={app.id} app={app} type="WAITING" />)
                        )}
                    </div>
                </div>

                {/* Lab Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" /> At Lab
                        </h2>
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {labPending.length} Active
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? null : labPending.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-gray-100">
                                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Active Tests</p>
                            </div>
                        ) : (
                            labPending.map(app => <AppointmentCard key={app.id} app={app} type="LAB_TESTS" />)
                        )}
                    </div>
                </div>

                {/* Review Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-indigo-500" /> For Review
                        </h2>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {review.length} Ready
                        </span>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? null : review.length === 0 ? (
                            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-gray-100">
                                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Reviews</p>
                            </div>
                        ) : (
                            review.map(app => <AppointmentCard key={app.id} app={app} type="REVIEW" />)
                        )}
                    </div>
                </div>
            </div>

            {/* Clinical Forms */}
            {checkupAppointment && (
                <CheckupForm
                    appointment={checkupAppointment}
                    isOpen={!!checkupAppointment}
                    onClose={() => setCheckupAppointment(null)}
                    onSuccess={fetchDashboardData}
                />
            )}
            {prescriptionAppointment && (
                <PrescriptionForm
                    appointment={prescriptionAppointment}
                    isOpen={!!prescriptionAppointment}
                    onClose={() => setPrescriptionAppointment(null)}
                    onSuccess={fetchDashboardData}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;

