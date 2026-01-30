import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserPlus, Clock, Loader2, ChevronRight } from 'lucide-react';
import { appointmentService } from '../../api/appointment.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import type { Appointment } from '../../types/appointment';

const ReceptionistDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const waitingAppointments = appointments.filter(app => app.status === 'WAITING' || app.status === 'LAB_TESTS');
    const todayCount = appointments.length;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Receptionist Dashboard</h1>
                    <p className="text-gray-500 font-medium">Manage patient check-ins and registrations</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-widest leading-none">Live System</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">OPD Queue</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : waitingAppointments.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Appointments</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{loading ? '...' : todayCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">New</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">12</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Wait Time</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">15m</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Real-time OPD Queue</h2>
                        <button
                            onClick={() => navigate('/appointments')}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        >
                            Full List
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Queue...</p>
                            </div>
                        ) : waitingAppointments.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Queue is currently empty</p>
                            </div>
                        ) : (
                            waitingAppointments.slice(0, 5).map((app, index) => (
                                <div key={app.id} className="flex items-center gap-5 p-5 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-100 group">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all ${index === 0 ? 'bg-blue-600 text-white shadow-blue-100 ring-4 ring-blue-50' : 'bg-white text-gray-400 group-hover:text-blue-600'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900 leading-none">{app.patient?.name || 'Unknown Patient'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                                Token: {app.tokenNumber}
                                            </span>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                Dr. {app.doctor?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${app.status === 'WAITING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                                            }`}>
                                            {app.status === 'WAITING' ? 'Waiting' : 'Lab Tests'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-4 flex-1">
                            <button
                                onClick={() => navigate('/receptionist/add-patient')}
                                className="group flex items-center justify-between p-6 bg-blue-50 rounded-[2rem] hover:bg-blue-600 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-blue-900 group-hover:text-white transition-colors">Register Patient</p>
                                        <p className="text-xs font-bold text-blue-400 group-hover:text-blue-100 transition-colors">New patient onboarding</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => navigate('/receptionist/book')}
                                className="group flex items-center justify-between p-6 bg-green-50 rounded-[2rem] hover:bg-green-600 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-green-900 group-hover:text-white transition-colors">Book Appointment</p>
                                        <p className="text-xs font-bold text-green-400 group-hover:text-green-100 transition-colors">Schedule OPD session</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-green-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => navigate('/appointments')}
                                className="group flex items-center justify-between p-6 bg-purple-50 rounded-[2rem] hover:bg-purple-600 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-purple-900 group-hover:text-white transition-colors">All Activities</p>
                                        <p className="text-xs font-bold text-purple-400 group-hover:text-purple-100 transition-colors">View full system logs</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-purple-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
