import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    User,
    Calendar,
    Phone,
    Shield,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Users,
    ChevronLeft,
    ChevronRight,
    UserPlus,
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/Select";
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
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('ALL');
    const [sortConfig, setSortConfig] = useState<{ key: 'patientId'; direction: 'asc' | 'desc' } | null>({ key: 'patientId', direction: 'asc' });

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await patientService.listPatients(page, limit, debouncedSearch);
            setPatients(response.data);
            setTotal(response.total);
        } catch (error: any) {
            console.error('Error fetching patients:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleRegistrationSuccess = () => {
        setShowRegistrationModal(false);
        fetchPatients();
    };

    const handleSort = (key: 'patientId') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const processedPatients = patients
        .filter((patient: Patient) => {
            const matchesGender = genderFilter === 'ALL' || patient.gender.toUpperCase() === genderFilter;
            return patient.isActive && matchesGender;
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500 font-['Inter',sans-serif]">
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
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-md shadow-teal-600/10 transition-all active:scale-95 text-sm"
                >
                    <UserPlus className="w-4.5 h-4.5" />
                    New Patient
                </button>
            </div>

            {/* Filters and Search Bar - Elegant Redesign */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <Search className="text-gray-400 w-4 h-4 group-focus-within:text-teal-600 transition-colors duration-200" />
                        <div className="w-px h-4 bg-gray-300 group-focus-within:bg-teal-200 transition-colors hidden sm:block" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, phone or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-[38px] bg-gray-50/50 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:bg-white transition-all duration-200"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-50/50 px-3 h-[38px] rounded-lg border border-gray-400">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">Filter By</span>
                        <div className="w-px h-4 bg-gray-300" />
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="border-none bg-transparent hover:bg-white/50 h-8 font-black text-gray-900 focus:ring-0 focus:ring-offset-0 transition-all px-2 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="8" cy="15" r="5" />
                                        <path d="M13 10l6 -6" />
                                        <path d="M19 4l0 4.5" />
                                        <path d="M19 4l-4.5 0" />
                                        <path d="M8 20l0 3" />
                                        <path d="M5.5 21l5 0" />
                                    </svg>
                                    <SelectValue placeholder="Gender" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="border-gray-400 rounded-lg shadow-xl">
                                <SelectItem value="ALL" className="font-bold py-2.5 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">
                                    All Genders
                                </SelectItem>
                                <SelectItem value="MALE" className="font-bold py-2.5 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">
                                    Male
                                </SelectItem>
                                <SelectItem value="FEMALE" className="font-bold py-2.5 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">
                                    Female
                                </SelectItem>
                                <SelectItem value="OTHER" className="font-bold py-2.5 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-10 px-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2.5 shadow-sm">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-teal-800 uppercase tracking-widest">
                            {processedPatients.length} Results
                        </span>
                    </div>
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-400 min-h-[450px] flex flex-col">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <Loader size="md" text="Loading Patients..." variant="teal" />
                    </div>
                ) : processedPatients.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 border border-gray-200">
                            <User className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No patients found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            There are no active patients registered in the system yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto grow">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-400">
                                    <th
                                        className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                        onClick={() => handleSort('patientId')}
                                    >
                                        <div className="flex items-center gap-2 justify-center">
                                            Patient ID
                                            {sortConfig?.key === 'patientId' ? (
                                                sortConfig.direction === 'asc' ? <ArrowUp className="w-5 h-5 text-teal-600 font-black" /> : <ArrowDown className="w-5 h-5 text-teal-600 font-black" />
                                            ) : (
                                                <ArrowUpDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                        <div className="flex items-center gap-2 justify-center">
                                            <User className="w-4 h-4 text-teal-600" />
                                            Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                        <div className="flex items-center gap-2 justify-center">
                                            <Calendar className="w-4 h-4 text-teal-600" />
                                            DOB
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                        <div className="flex items-center gap-2 justify-center">
                                            <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="8" cy="15" r="5" />
                                                <path d="M13 10l6 -6" />
                                                <path d="M19 4l0 4.5" />
                                                <path d="M19 4l-4.5 0" />
                                                <path d="M8 20l0 3" />
                                                <path d="M5.5 21l5 0" />
                                            </svg>
                                            Gender/Age
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                        <div className="flex items-center gap-2 justify-center">
                                            <Phone className="w-4 h-4 text-teal-600" />
                                            Contact
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-2 justify-center">
                                            <Shield className="w-4 h-4 text-teal-600" />
                                            Status
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {processedPatients.map((patient: Patient) => {
                                    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                                    return (
                                        <tr
                                            key={patient.id}
                                            className="hover:bg-teal-50/20 transition-colors group border-b border-gray-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <div className="flex justify-center">
                                                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-100">
                                                        #{patient.patientId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <div className="text-sm font-black text-gray-900 group-hover:text-teal-700 transition-colors">{patient.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <div className="text-sm font-black text-gray-700">
                                                    {new Date(patient.dateOfBirth).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <span className="text-sm font-black text-gray-800 capitalize">{patient.gender.toLowerCase()}</span>
                                                <span className="text-sm text-gray-500 font-black">, {age} yrs</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <div className="text-sm font-black text-gray-900">{patient.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex justify-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block border ${patient.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                        {patient.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && processedPatients.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-400 mt-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 font-black">
                            Showing <span className="font-black text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-black text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-black text-gray-900">{total}</span> patients
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setPage((p: number) => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 disabled:opacity-50 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={(e) => { e.stopPropagation(); setPage(p); }}
                                        className={`w-9 h-9 rounded-lg text-sm font-black transition-all shadow-sm border ${page === p
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white border-gray-400 text-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setPage((p: number) => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 disabled:opacity-50 transition-all shadow-sm"
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
