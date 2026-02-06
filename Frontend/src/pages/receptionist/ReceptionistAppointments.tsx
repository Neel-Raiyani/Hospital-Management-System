import React, { useState, useEffect, useMemo } from 'react';
import { appointmentService } from '../../api/appointment.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { Loader2, Search, CheckCircle2, XCircle, CalendarDays, Hash, User, Stethoscope, Clock4, Shield, LayoutGrid, FileQuestion, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ReceptionistAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'all'>('day');
    const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; appointmentId: string; action: AppointmentStatus | null }>({ show: false, appointmentId: '', action: null });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
        try {
            await appointmentService.updateStatus(id, newStatus);
            const actionText = newStatus === 'CANCELLED' ? 'cancelled' : newStatus === 'WAITING' ? 'restored to waiting' : 'updated';
            toast.success(`Appointment ${actionText} successfully`);

            // Update the specific appointment in the list without full reload
            setAppointments(prev => prev.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));

            setConfirmDialog({ show: false, appointmentId: '', action: null });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const openConfirmDialog = (appointmentId: string, action: AppointmentStatus) => {
        setConfirmDialog({ show: true, appointmentId, action });
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Fetch ALL appointments explicitly with { all: true } parameter
            const data = await appointmentService.getAppointments({ all: true });

            if (!Array.isArray(data)) {
                console.error('API did not return an array:', data);
                setAppointments([]);
                return;
            }

            // Enrich with patient and doctor details
            const enrichedData = await Promise.all(
                data.map(async (app: Appointment) => {
                    try {
                        const [patient, doctor] = await Promise.allSettled([
                            patientService.getPatientById(app.patientId),
                            doctorService.getDoctorById(app.doctorId),
                        ]);

                        return {
                            ...app,
                            patient: patient.status === 'fulfilled' ? patient.value : undefined,
                            doctor: doctor.status === 'fulfilled' ? doctor.value : undefined,
                        };
                    } catch (err) {
                        console.error(`Failed to enrich appointment ${app.id}:`, err);
                        return app;
                    }
                })
            );

            setAppointments(enrichedData);
        } catch (error: any) {
            console.error('Failed to fetch appointments:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const statusConfig = {
        WAITING: {
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'Waiting'
        },
        LAB_TESTS: {
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            label: 'Lab Tests'
        },
        REVIEW: {
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'Review'
        },
        COMPLETED: {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'Completed'
        },
        CANCELLED: {
            color: 'bg-red-50 text-red-700 border-red-200',
            label: 'Cancelled'
        },
    };

    const filteredAppointments = useMemo(() => {
        // ... (existing logic)
        return appointments.filter(app => {
            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
            const patientName = app.patient?.name?.toLowerCase() || '';
            const doctorName = app.doctor?.name?.toLowerCase() || '';
            const matchesSearch =
                patientName.includes(searchTerm.toLowerCase()) ||
                doctorName.includes(searchTerm.toLowerCase()) ||
                app.tokenNumber.toString().includes(searchTerm);

            const localAppDateStr = new Date(app.appointmentDate).toLocaleDateString('en-CA');
            const selectedDateStr = selectedDate.toLocaleDateString('en-CA');

            let matchesDate = true;
            if (viewMode === 'day') {
                matchesDate = localAppDateStr === selectedDateStr;
            }

            return matchesStatus && matchesSearch && matchesDate;
        });
    }, [appointments, statusFilter, searchTerm, selectedDate, viewMode]);

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, selectedDate, viewMode]);

    const stats = useMemo(() => {
        // Stats are based on the CURRENT VIEW (Day/All)
        const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
        const currentView = appointments.filter(app => {
            const localAppDateStr = new Date(app.appointmentDate).toLocaleDateString('en-CA');
            if (viewMode === 'day') return localAppDateStr === selectedDateStr;
            return true;
        });

        return {
            total: currentView.length,
            waiting: currentView.filter(a => a.status === 'WAITING').length,
            completed: currentView.filter(a => a.status === 'COMPLETED').length,
            cancelled: currentView.filter(a => a.status === 'CANCELLED').length,
        };
    }, [appointments, selectedDate, viewMode]);





    return (
        <div className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Appointments</h1>
                    <p className="text-[#6B7280] mt-1 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Manage and track all patient appointments
                    </p>
                </div>
            </div>

            {/* Professional Filter Bar */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name, doctor, or token number..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl min-w-[120px]">
                            {(['day', 'all'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 ${viewMode === mode
                                        ? 'bg-white text-[#0d9488] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {viewMode === 'day' && (
                            <div className="relative animate-in fade-in duration-200">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date: Date | null) => date && setSelectedDate(date)}
                                    dateFormat="MMM dd, yyyy"
                                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-teal-600 font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-teal-600/10 focus:border-teal-600 transition-all min-w-[160px] text-center"
                                    calendarClassName="shadow-2xl border-gray-200 rounded-lg"
                                />
                                <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Filter Status:</span>
                    {(['ALL', 'WAITING', 'LAB_TESTS', 'REVIEW', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap border ${statusFilter === s
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-600 hover:text-teal-600'
                                }`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total {viewMode === 'day' ? 'Today' : 'Appointments'}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center transition-colors group-hover:bg-teal-100">
                            <LayoutGrid className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Waiting List</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.waiting}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center transition-colors group-hover:bg-amber-100">
                            <Clock4 className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Cancelled</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelled}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center transition-colors group-hover:bg-red-100">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-3 h-3" />
                                        Token
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        Patient
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope className="w-3 h-3" />
                                        Doctor
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Clock4 className="w-3 h-3" />
                                        Schedule
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Shield className="w-3 h-3" />
                                        Status
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                                        <p className="text-gray-500 text-sm font-medium">Fetching real-time appointments...</p>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <FileQuestion className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">No appointments found</h3>
                                        <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                                            {searchTerm ? `No results found for "${searchTerm}"` : 'No appointments match the selected filters.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAppointments.map((app) => {
                                    const config = statusConfig[app.status];
                                    return (
                                        <tr
                                            key={app.id}
                                            onClick={() => {
                                                if (app.status === 'COMPLETED') return;
                                                const action = app.status === 'CANCELLED' ? 'WAITING' : 'CANCELLED';
                                                openConfirmDialog(app.id, action);
                                            }}
                                            className={`transition-all duration-200 border-b border-gray-50 last:border-0 ${app.status === 'COMPLETED' ? 'bg-gray-50/50' : 'hover:bg-teal-50/50 cursor-pointer'
                                                }`}
                                        >
                                            <td className="px-6 py-5">
                                                <span className="text-base font-semibold text-gray-800">#{app.tokenNumber}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-base font-bold text-gray-900">
                                                    {app.patient?.name || 'Unknown Patient'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="text-base font-bold text-gray-900">{app.doctor?.name || 'Unknown Doctor'}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{app.doctor?.specialization || 'General'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-base font-semibold text-gray-900">
                                                    {new Date(app.appointmentDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs font-medium text-gray-500 mt-0.5">
                                                    {new Date(app.appointmentDate).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.color}`}>
                                                    {config.label}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer & Pagination */}
                {!loading && filteredAppointments.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-900">{paginatedAppointments.length}</span> of <span className="font-bold text-gray-900">{filteredAppointments.length}</span> results
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
                        onClick={() => setConfirmDialog({ show: false, appointmentId: '', action: null })}
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-in zoom-in duration-200">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${confirmDialog.action === 'CANCELLED' ? 'bg-red-100' : 'bg-teal-100'
                                    }`}>
                                    {confirmDialog.action === 'CANCELLED' ? (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    ) : (
                                        <Clock4 className="w-6 h-6 text-teal-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {confirmDialog.action === 'CANCELLED' ? 'Cancel Appointment?' : 'Restore Appointment?'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {confirmDialog.action === 'CANCELLED'
                                            ? 'Are you sure you want to cancel this appointment? This action can be reversed later.'
                                            : 'This will restore the appointment to waiting status. The patient will be added back to the queue.'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setConfirmDialog({ show: false, appointmentId: '', action: null })}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(confirmDialog.appointmentId, confirmDialog.action!)}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg ${confirmDialog.action === 'CANCELLED'
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                        : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                                        }`}
                                >
                                    {confirmDialog.action === 'CANCELLED' ? 'Yes, Cancel' : 'Yes, Restore'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReceptionistAppointments;
