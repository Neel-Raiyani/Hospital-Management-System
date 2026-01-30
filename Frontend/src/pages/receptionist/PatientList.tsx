import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, UserPlus, Phone, Calendar, User,
    MoreHorizontal, Filter, Loader2, AlertCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../api/patient.service';
import type { Patient } from '../../types/patient';
import { toast } from 'react-hot-toast';

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyActive] = useState(true); // Default to active only as requested

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            // Note: Backend currently doesn't support server-side search by name/phone in listPatients
            // So we will fetch and do client-side filtering if search is active, 
            // or just use pagination if not.
            // Ideally backend should support this.

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

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm);
        const matchesActive = showOnlyActive ? patient.isActive : true;
        return matchesSearch && matchesActive;
    });

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-500">Manage and view all registered patients</p>
                </div>
                <button
                    onClick={() => navigate('/receptionist/add-patient')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Register New Patient
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or phone number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        <p className="font-medium">Loading patients...</p>
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
                                className="mt-4 text-blue-600 font-bold hover:underline"
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
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Patient ID</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Name</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Gender/Age</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Contact</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => {
                                    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
                                    return (
                                        <tr key={patient.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                    #{patient.patientId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{patient.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="capitalize">{patient.gender.toLowerCase()}</span>, {age} yrs
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {patient.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${patient.isActive
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {patient.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
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
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> patients
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === i + 1
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                                : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Help/Empty State Tips */}
            {!loading && filteredPatients.length === 0 && !searchTerm && (
                <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Need help?</h4>
                        <p className="text-sm text-gray-600">Register your first patient by clicking the "Register New Patient" button above.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientList;
