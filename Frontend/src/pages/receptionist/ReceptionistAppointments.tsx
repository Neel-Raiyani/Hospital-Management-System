import React, { useState, useEffect, useMemo } from 'react';
import { appointmentService } from '../../api/appointment.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import type { Doctor } from '../../api/doctor.service';
import { formatDoctorName } from '../../utils/nameUtils';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import {
    CheckCircle2, XCircle, CalendarDays, Hash, User,
    Stethoscope, Clock4, Shield, LayoutGrid, FileQuestion,
    ChevronLeft, ChevronRight, Search, Filter, RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components/ui/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { CustomDatePicker } from '../../components/common';


const ReceptionistAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; appointmentId: string; action: AppointmentStatus | null }>({ show: false, appointmentId: '', action: null });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
    const [dateFilter, setDateFilter] = useState<Date | null>(new Date());


    const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
        try {
            await appointmentService.updateStatus(id, newStatus);
            toast.success(`Appointment cancelled successfully`);

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
            const data = await appointmentService.getAppointments({ all: true });

            if (!Array.isArray(data)) {
                setAppointments([]);
                return;
            }

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
                        return app;
                    }
                })
            );

            setAppointments(enrichedData);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        }
    };

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setDoctorFilter('ALL');
        setDateFilter(new Date());
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, doctorFilter, dateFilter]);

    const statusConfig = {
        WAITING: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Waiting' },
        LAB_TESTS: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Lab Tests' },
        REVIEW: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Review' },
        COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
        CANCELLED: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
    };

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(app => {
                // Search Query Filter (Patient Name or Doctor Name)
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const patientMatch = app.patient?.name?.toLowerCase().includes(query);
                    const doctorMatch = app.doctor?.name?.toLowerCase().includes(query);
                    if (!patientMatch && !doctorMatch) return false;
                }

                // Status Filter
                if (statusFilter !== 'ALL' && app.status !== statusFilter) {
                    return false;
                }

                // Doctor Filter
                if (doctorFilter !== 'ALL' && app.doctorId !== doctorFilter) {
                    return false;
                }

                // Date Filter
                if (dateFilter) {
                    const appDate = new Date(app.appointmentDate).toDateString();
                    const filterDate = dateFilter.toDateString();
                    if (appDate !== filterDate) return false;
                }

                return true;
            })
            .sort((a, b) => a.tokenNumber - b.tokenNumber);
    }, [appointments, searchQuery, statusFilter, doctorFilter, dateFilter]);

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [appointments, searchQuery, statusFilter, doctorFilter, dateFilter]);

    const stats = useMemo(() => {
        return {
            total: filteredAppointments.length,
            waiting: filteredAppointments.filter(a => a.status === 'WAITING').length,
            completed: filteredAppointments.filter(a => a.status === 'COMPLETED').length,
            cancelled: filteredAppointments.filter(a => a.status === 'CANCELLED').length,
        };
    }, [filteredAppointments]);

    return (
        <div className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Appointments</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Manage and track patient queue
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDateFilter(null)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-all shadow-sm"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        View All Appointments
                    </button>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-400 rounded-lg hover:bg-gray-50 hover:text-teal-600 transition-all shadow-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="py-4 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                {/* Search */}
                <div className="flex-1 min-w-[240px] relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 group-focus-within:text-teal-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search patient or doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>

                <div className="w-[180px] relative group">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-gray-50 pl-10 pr-4 py-2 border-gray-400 h-10 text-sm rounded-lg focus:ring-2 focus:ring-teal-500/0 focus:border-teal-500 outline-none transition-all group">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 group-focus:text-teal-500 transition-colors" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="WAITING">Waiting</SelectItem>
                            <SelectItem value="LAB_TESTS">Lab Tests</SelectItem>
                            <SelectItem value="REVIEW">Review</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[220px] relative group">
                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                        <SelectTrigger className="bg-gray-50 pl-10 pr-4 py-2 border-gray-400 h-10 text-sm rounded-lg focus:ring-1 focus:ring-teal-500/0 focus:border-teal-500 outline-none transition-all group">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 group-focus:text-teal-500 transition-colors" />
                            <SelectValue placeholder="All Doctors" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Doctors</SelectItem>
                            {doctors.map(doc => (
                                <SelectItem key={doc.id} value={doc.id}>
                                    {formatDoctorName(doc.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Picker */}
                <CustomDatePicker
                    selected={dateFilter}
                    onChange={(date: Date | null) => setDateFilter(date)}
                    placeholderText="Select Date"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Results</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                            <LayoutGrid className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Waiting List</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.waiting}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Clock4 className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-300 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Cancelled</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelled}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-300">
                                <th className="px-6 py-3 text-[12px] font-bold text-gray-1000 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-teal-700" />Token</div>
                                </th>
                                <th className="px-6 py-3 text-[12px] font-bold text-gray-1000 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-teal-700" />Patient</div>
                                </th>
                                <th className="px-6 py-3 text-[12px] font-bold text-gray-1000 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-teal-700" />Doctor</div>
                                </th>
                                <th className="px-6 py-3 text-[12px] font-bold text-gray-1000 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Clock4 className="w-4 h-4 text-teal-700" />Schedule</div>
                                </th>
                                <th className="px-6 py-4 text-[12px] font-bold text-gray-1000 uppercase tracking-widest text-center">
                                    <div className="flex items-center justify-center gap-2"><Shield className="w-4 h-4 text-teal-700" />Status</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader size="md" text="Loading Appointments..." />
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="shrink-0 bg-gray-200 p-2 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <FileQuestion className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">No appointments found</h3>
                                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAppointments.map((app) => {
                                    const config = statusConfig[app.status];
                                    const isInactive = app.status === 'COMPLETED' || app.status === 'CANCELLED';
                                    return (
                                        <tr
                                            key={app.id}
                                            onClick={() => {
                                                if (isInactive) return;
                                                openConfirmDialog(app.id, 'CANCELLED');
                                            }}
                                            className={`transition-all duration-200 border-b border-gray-200 last:border-0 ${isInactive ? 'opacity-60 bg-gray-50/30' : 'hover:bg-gray-200 cursor-pointer'
                                                }`}
                                        >
                                            <td className="px-6 py-3">
                                                <span className="text-base font-medium text-gray-700">#{app.tokenNumber}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-base font-medium text-gray-700">{app.patient?.name || 'Unknown Patient'}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div>
                                                    <div className="text-base font-medium text-gray-700">{formatDoctorName(app.doctor?.name)}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{app.doctor?.specialization || 'General'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-base font-medium text-gray-700">{new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="text-xs font-medium text-gray-500 mt-0.5">{new Date(app.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
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

                {/* Pagination */}
                {!loading && filteredAppointments.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">Showing <span className="font-bold text-gray-900">{paginatedAppointments.length}</span> of <span className="font-bold text-gray-900">{filteredAppointments.length}</span> results</p>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{page}</button>
                                    ))}
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {
                confirmDialog.show && (
                    <>
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setConfirmDialog({ show: false, appointmentId: '', action: null })} />
                        <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none">
                            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-in zoom-in duration-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-red-100">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Cancel Appointment?</h3>
                                        <p className="text-sm text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setConfirmDialog({ show: false, appointmentId: '', action: null })} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button onClick={() => handleUpdateStatus(confirmDialog.appointmentId, 'CANCELLED')} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg bg-red-600 hover:bg-red-700 shadow-red-600/30">Yes, Cancel</button>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
};

export default ReceptionistAppointments;
