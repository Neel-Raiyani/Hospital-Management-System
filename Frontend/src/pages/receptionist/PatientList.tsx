import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, UserPlus, Phone, User, Calendar, Users,
    ChevronLeft, ChevronRight, ChevronDown, X,
    Hash, Shield, Activity
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import PatientRegistrationForm from '../../components/features/receptionist/PatientRegistrationForm';
import { patientService } from '../../api/patient.service';
import type { Patient } from '../../types/patient';
import { toast } from 'react-hot-toast';

const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await patientService.listPatients(page, limit);
            setPatients(response.data);
            setTotal(response.total);
        } catch (error: any) {
            console.error('Error fetching patients:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleRegistrationSuccess = (patientPhone: string) => {
        toast.success(`Patient registered successfully! Phone: ${patientPhone}`);
        setShowRegistrationModal(false);
        fetchPatients();
    };



    const filteredPatients = patients.filter((patient: Patient) => {
        const matchesSearch =
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.patientId.toString().includes(searchTerm);

        const matchesStatus =
            statusFilter === 'ALL' ? true :
                statusFilter === 'ACTIVE' ? patient.isActive :
                    !patient.isActive;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.patientId - b.patientId;
        } else {
            return b.patientId - a.patientId;
        }
    });

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Patients</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Manage registered patient profiles
                    </p>
                </div>
                <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md shadow-teal-600/10 transition-all active:scale-95 text-sm"
                >
                    <UserPlus className="w-4.5 h-4.5" />
                    New Patient
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-11 h-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-400 focus:bg-white transition-all text-sm font-medium shadow-sm shadow-black/5"
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
                </div>

                <div className="flex items-center gap-6 border-t border-gray-50 pt-2 flex-wrap">
                    {/* Status Segmented Control */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Patient Status</span>
                        <div className="flex bg-gray-100 p-1 rounded-xl items-center relative h-9">
                            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`relative z-10 px-4 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300 whitespace-nowrap ${statusFilter === s ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {statusFilter === s && (
                                        <div className="absolute inset-0 bg-white rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200" style={{ zIndex: -1 }} />
                                    )}
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Control */}
                    <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sort Order</span>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className={`flex items-center gap-2 h-9 px-4 rounded-xl font-bold text-[10px] transition-all duration-200 border ${sortOrder === 'asc'
                                ? 'bg-white border-gray-200 text-gray-700 shadow-sm'
                                : 'bg-teal-50 border-teal-100 text-teal-700 shadow-sm shadow-teal-600/5'
                                }`}
                        >
                            <div className={`transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center text-gray-500">
                        <Loader size="md" text="Loading Patients..." />
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <User className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {searchTerm
                                ? `We couldn't find any results matching "${searchTerm}"`
                                : "There are no patients registered in the system yet."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-teal-600 font-bold hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-3 h-3" />
                                            ID
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            DOB
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3 h-3" />
                                            Gender/Age
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3" />
                                            Contact
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Shield className="w-3 h-3" />
                                            Status
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient: Patient) => {
                                    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                                    return (
                                        <tr
                                            key={patient.id}
                                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                                    #{patient.patientId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{patient.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-700">
                                                    {new Date(patient.dateOfBirth).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-700 capitalize">{patient.gender.toLowerCase()}</span>
                                                <span className="text-sm text-gray-500 font-medium">, {age} yrs</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-[#111827]">{patient.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded inline-block ${patient.isActive
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                    {patient.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredPatients.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> patients
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setPage((p: number) => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={(e) => { e.stopPropagation(); setPage(p); }}
                                        className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${page === p
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setPage((p: number) => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Patient Registration Modal */}
            <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
                <DialogContent className="sm:max-w-[650px] rounded-lg p-0 border-none shadow-2xl [&>button]:hidden bg-transparent">
                    <div className="bg-white rounded-lg p-6">
                        <DialogHeader className="mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                                    <UserPlus className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900">Register Patient</DialogTitle>
                                    <p className="text-xs text-gray-500 font-medium">Create a new medical profile</p>
                                </div>
                            </div>
                        </DialogHeader>
                        <PatientRegistrationForm
                            onSuccess={handleRegistrationSuccess}
                            onCancel={() => setShowRegistrationModal(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    );
};

export default PatientList;
