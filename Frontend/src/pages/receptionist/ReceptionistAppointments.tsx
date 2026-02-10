import React, { useState, useEffect, useMemo } from 'react';
import { appointmentService } from '../../api/appointment.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import { formatDoctorName } from '../../utils/nameUtils';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import {
    Search, CheckCircle2, XCircle, CalendarDays, Hash, User,
    Stethoscope, Clock4, Shield, LayoutGrid, FileQuestion,
    ChevronLeft, ChevronRight, ChevronDown, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader } from '../../components/ui/Loader';

const ReceptionistAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
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

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
        }
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

    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
    }, []);

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
                const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
                const matchesDoctor = doctorFilter === 'ALL' || app.doctorId === doctorFilter;
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

                return matchesStatus && matchesDoctor && matchesSearch && matchesDate;
            })
            .sort((a, b) => a.tokenNumber - b.tokenNumber);
    }, [appointments, statusFilter, doctorFilter, searchTerm, selectedDate, viewMode]);

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, doctorFilter, searchTerm, selectedDate, viewMode]);

    const stats = useMemo(() => {
        const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
        const currentView = appointments.filter(app => {
            const matchesDoctor = doctorFilter === 'ALL' || app.doctorId === doctorFilter;
            const localAppDateStr = new Date(app.appointmentDate).toLocaleDateString('en-CA');

            let matchesDate = true;
            if (viewMode === 'day') {
                matchesDate = localAppDateStr === selectedDateStr;
            }

            return matchesDoctor && matchesDate;
        });

        return {
            total: currentView.length,
            waiting: currentView.filter(a => a.status === 'WAITING').length,
            completed: currentView.filter(a => a.status === 'COMPLETED').length,
            cancelled: currentView.filter(a => a.status === 'CANCELLED').length,
        };
    }, [appointments, selectedDate, viewMode, doctorFilter]);

    return (
        <div className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Appointments</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Manage and track patient queue
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by patient, doctor, or token..."
                            className="w-full pl-11 pr-11 h-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 focus:bg-white transition-all text-sm font-medium shadow-sm shadow-black/5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg transition-all text-gray-400 hover:text-gray-600 active:scale-95"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Doctor Filter */}
                    <div className="relative min-w-[220px]">
                        <button
                            onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                            className="w-full pl-10 pr-10 h-9.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 transition-all text-sm font-semibold flex items-center justify-between group hover:bg-white"
                        >
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            <span className="truncate text-gray-700">
                                {doctorFilter === 'ALL' ? 'All Doctors' : formatDoctorName(doctors.find(d => d.id === doctorFilter)?.name)}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showDoctorDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showDoctorDropdown && (
                            <>
                                <div className="fixed inset-0 z-100" onClick={() => setShowDoctorDropdown(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-101 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                                    <div className="max-h-[300px] overflow-y-auto py-2">
                                        <button
                                            onClick={() => { setDoctorFilter('ALL'); setShowDoctorDropdown(false); }}
                                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-teal-50 flex items-center gap-3 ${doctorFilter === 'ALL' ? 'text-teal-600 bg-teal-50/50' : 'text-gray-700'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${doctorFilter === 'ALL' ? 'bg-teal-500' : 'bg-transparent'}`} />
                                            All Doctors
                                        </button>
                                        <div className="h-px bg-gray-50 my-1 mx-2" />
                                        {doctors.map((doctor) => (
                                            <button
                                                key={doctor.id}
                                                onClick={() => { setDoctorFilter(doctor.id); setShowDoctorDropdown(false); }}
                                                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-teal-50 flex items-center gap-3 ${doctorFilter === doctor.id ? 'text-teal-600 bg-teal-50/50' : 'text-gray-700'}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${doctorFilter === doctor.id ? 'bg-teal-500' : 'bg-transparent'}`} />
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{formatDoctorName(doctor.name)}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{doctor.specialization}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Date Picker Section */}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl items-center relative h-9.5">
                            {(['day', 'all'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`relative z-10 px-4 h-7.5 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300 uppercase tracking-widest ${viewMode === mode ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {viewMode === mode && (
                                        <div className="absolute inset-0 bg-white rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200" style={{ zIndex: -1 }} />
                                    )}
                                    {mode}
                                </button>
                            ))}
                        </div>
                        {viewMode === 'day' && (
                            <div className="relative animate-in fade-in slide-in-from-right-2 duration-300">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date: Date | null) => date && setSelectedDate(date)}
                                    dateFormat="MMM dd, yyyy"
                                    className="pl-3 pr-9 h-9.5 bg-gray-50 border border-gray-200 rounded-xl text-teal-600 font-bold text-[11px] cursor-pointer outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 transition-all w-[150px]"
                                />
                                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-600 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 border-t border-gray-50 pt-2 flex-wrap">
                    {/* Status Segmented Control */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Filter Status</span>
                        <div className="flex bg-gray-100 p-1 rounded-xl items-center relative h-9">
                            {(['ALL', 'WAITING', 'LAB_TESTS', 'REVIEW', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`relative z-10 px-3 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300 whitespace-nowrap ${statusFilter === s ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {statusFilter === s && (
                                        <div className="absolute inset-0 bg-white rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200" style={{ zIndex: -1 }} />
                                    )}
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total {viewMode === 'day' ? 'Today' : 'Appointments'}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                            <LayoutGrid className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group">
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group">
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Hash className="w-3 h-3" />Token</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><User className="w-3 h-3" />Patient</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Stethoscope className="w-3 h-3" />Doctor</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><Clock4 className="w-3 h-3" />Schedule</div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                    <div className="flex items-center justify-center gap-2"><Shield className="w-3 h-3" />Status</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader size="md" text="Loading Appointments..." />
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="shrink-0 bg-blue-100 p-2 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <FileQuestion className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">No appointments found</h3>
                                        <p className="text-gray-500 text-sm mt-1">{searchTerm ? `No results found for "${searchTerm}"` : 'No appointments match the selected filters.'}</p>
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
                                            className={`transition-all duration-200 border-b border-gray-50 last:border-0 ${isInactive ? 'opacity-60 bg-gray-50/30' : 'hover:bg-gray-200 cursor-pointer'
                                                }`}
                                        >
                                            <td className="px-6 py-5">
                                                <span className="text-base font-semibold text-gray-800">#{app.tokenNumber}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-base font-bold text-gray-900">{app.patient?.name || 'Unknown Patient'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="text-base font-bold text-gray-900">{formatDoctorName(app.doctor?.name)}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{app.doctor?.specialization || 'General'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-base font-semibold text-gray-900">{new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="text-xs font-medium text-gray-500 mt-0.5">{new Date(app.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
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
            {confirmDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setConfirmDialog({ show: false, appointmentId: '', action: null })} />
                    <div className="fixed inset-0 z-51 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-in zoom-in duration-200">
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
            )}
        </div>
    );
};

export default ReceptionistAppointments;
