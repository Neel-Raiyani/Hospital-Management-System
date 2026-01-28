import React, { useState, useEffect } from 'react';
import {
    Calendar, RefreshCw, Loader2, ChevronRight,
    Search, XCircle
} from 'lucide-react';
import { appointmentService } from '../../api/appointment.service';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { useAuth } from '../../hooks/useAuth';

const AppointmentList: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            let data: Appointment[];

            if (user?.role === 'DOCTOR') {
                data = await appointmentService.getDoctorAppointments(user.id);
            } else {
                data = await appointmentService.getAppointments();
            }

            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.id, user?.role]);

    const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
        try {
            setUpdatingId(id);
            await appointmentService.updateStatus(id, newStatus);
            await fetchAppointments();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const statusColors = {
        WAITING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        LAB_TESTS: 'bg-purple-100 text-purple-700 border-purple-200',
        REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
        COMPLETED: 'bg-green-100 text-green-700 border-green-200',
        CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesStatus = filter === 'ALL' || app.status === filter;
        const matchesSearch =
            app.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.tokenNumber.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 text-sm">Manage and track patient visits</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAppointments}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-100"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patient or token..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all text-sm w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'WAITING', 'LAB_TESTS', 'REVIEW', 'COMPLETED', 'CANCELLED'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filter === s
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                            }`}
                    >
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Appointment Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Loading appointments...</p>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500">No appointments found</p>
                                    </td>
                                </tr>
                            ) : filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">#{app.tokenNumber}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {new Date(app.appointmentDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                {app.patient?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{app.patient?.name || 'Unknown Patient'}</div>
                                                <div className="text-xs text-gray-500">{app.patient?.phone || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-700">{app.doctor?.name || 'Unknown Doctor'}</div>
                                        <div className="text-[10px] text-indigo-500 font-bold uppercase">{app.doctor?.specialization || 'General'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${statusColors[app.status]}`}>
                                            {app.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {updatingId === app.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            ) : (
                                                <>
                                                    {user?.role === 'DOCTOR' && app.status === 'WAITING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'LAB_TESTS')}
                                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Lab Tests
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                                                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}
                                                    {user?.role === 'RECEPTIONIST' && app.status === 'WAITING' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                                            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                        >
                                                            <XCircle className="w-3 h-3" />
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 group-hover:text-blue-600 transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AppointmentList;
