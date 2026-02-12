import React, { useEffect, useState, useMemo } from 'react';
import {
    DollarSign, Download,
    Search, Landmark, Clock4,
    FileQuestion, ChevronLeft, ChevronRight, RotateCcw,
    CreditCard, Users
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Loader } from '../../components/ui/Loader';
import { appointmentService } from '../../api/appointment.service';
import { adminService } from '../../api/admin.service';
import { patientService } from '../../api/patient.service';
import { doctorService } from '../../api/doctor.service';
import type { StaffUser } from '../../api/admin.service';
import type { Appointment } from '../../types/appointment';
import { Card, CardContent } from '../../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { AdminDatePicker } from '../../components/common/AdminDatePicker';
import { toast } from 'react-hot-toast';

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} `;
};

const RevenueAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [receptionists, setReceptionists] = useState<StaffUser[]>([]);

    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedReceptionist, setSelectedReceptionist] = useState<string>('all');
    const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rawAppointments, users] = await Promise.all([
                appointmentService.getAppointments({ all: true }),
                adminService.getAllUsers()
            ]);

            const enrichedData = await Promise.all(
                rawAppointments.map(async (app) => {
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
            setReceptionists(users.filter(u => u.role === 'RECEPTIONIST'));
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
            toast.error('Failed to load financial records');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedDate(null);
        setSelectedReceptionist('all');
        setSelectedPaymentType('all');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const patientMatch = app.patient?.name?.toLowerCase().includes(query);
                const doctorMatch = app.doctor?.name?.toLowerCase().includes(query);
                if (!patientMatch && !doctorMatch) return false;
            }
            if (selectedDate) {
                const appDate = new Date(app.appointmentDate).toDateString();
                const filterDate = selectedDate.toDateString();
                if (appDate !== filterDate) return false;
            }
            if (selectedReceptionist !== 'all' && app.receptionistId !== selectedReceptionist) {
                return false;
            }
            if (selectedPaymentType !== 'all' && app.paymentType !== selectedPaymentType) {
                return false;
            }
            return true;
        });
    }, [appointments, searchQuery, selectedDate, selectedReceptionist, selectedPaymentType]);

    const totalRevenue = useMemo(() =>
        filteredAppointments.reduce((sum, app) => sum + (app.checkupFee || 0), 0)
        , [filteredAppointments]);

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAppointments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDate, selectedReceptionist, selectedPaymentType]);

    const exportToExcel = () => {
        const headers = ["Date", "Patient Name", "Doctor Name", "Billed By", "Payment Type", "Amount"];
        const rows = filteredAppointments.map(app => [
            formatDate(app.appointmentDate),
            app.patient?.name || 'Unknown',
            `Dr.${app.doctor?.name || 'Unknown'} `,
            receptionists.find(r => r.id === app.receptionistId)?.name || 'System Admin',
            app.paymentType || 'CASH',
            app.checkupFee || 0
        ]);
        rows.push(["", "", "", "", "TOTAL REVENUE", totalRevenue]);

        let csvContent = headers.join(",") + "\n";
        rows.forEach(row => { csvContent += row.join(",") + "\n"; });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Revenue_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Excel report exported');
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const pageEasing = [0.4, 0, 0.2, 1] as const;

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15, scale: 0.99 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 24,
                mass: 0.8,
                ease: pageEasing
            }
        },
        exit: {
            opacity: 0, y: -10, transition: { duration: 0.2 }
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center">
            <Loader size="lg" variant="indigo" text="Loading Analytics..." />
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="px-8 pb-8 pt-4 max-w-[1600px] mx-auto space-y-6 overflow-x-hidden"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Insights</h1>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-2 font-medium uppercase tracking-wider">
                        <Landmark className="w-4 h-4 text-indigo-600" />
                        Monitor hospital revenue and billing trends
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 border border-indigo-700 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export Sheet
                    </button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-sm bg-white group border-l-4 border-l-indigo-600 rounded-lg overflow-hidden transition-all hover:shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">₹{totalRevenue.toLocaleString()}</h3>
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-7 h-7 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-sm bg-white group border-l-4 border-l-indigo-400 rounded-lg overflow-hidden transition-all hover:shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2">Billing Records</p>
                                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{filteredAppointments.length}</h3>
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                    <Clock4 className="w-7 h-7 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* In-line Filter Bar */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search patient or doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-400 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="w-[180px]">
                    <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
                        <SelectTrigger className="bg-white border-gray-400 h-10 text-sm font-bold text-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all hover:border-gray-500">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-600" />
                                <SelectValue placeholder="Payment Mode" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Modes</SelectItem>
                            <SelectItem value="CASH">Cash Payment</SelectItem>
                            <SelectItem value="ONLINE">Online Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[180px]">
                    <Select value={selectedReceptionist} onValueChange={setSelectedReceptionist}>
                        <SelectTrigger className="bg-white border-gray-400 h-10 text-sm font-bold text-gray-700 rounded-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all hover:border-gray-500">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                <SelectValue placeholder="Billed By" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Staff</SelectItem>
                            {receptionists.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <AdminDatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    placeholderText="Filter by Date"
                    className="rounded-lg"
                />
            </motion.div>

            {/* Appointment Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm border border-gray-400 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentPage} -${searchQuery} -${selectedPaymentType} -${selectedReceptionist} -${selectedDate} `}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-x-auto"
                    >
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="bg-indigo-600 border-b border-indigo-700">
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Patient Details
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Assigned Doctor
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Visit Date
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Booked By
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Pay Mode
                                    </th>
                                    <th className="px-6 py-4 text-[12px] font-bold text-indigo-50 uppercase tracking-widest text-center">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedAppointments.length > 0 ? (
                                    paginatedAppointments.map((app) => (
                                        <tr key={app.id} className="hover:bg-indigo-50/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-gray-900">{app.patient?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID: {app.patient?.patientId || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-gray-800">Dr. {app.doctor?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{app.doctor?.specialization || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-800">{formatDate(app.appointmentDate)}</div>
                                                <div className="text-[12px] text-gray-400 font-medium">
                                                    {new Date(app.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-600 text-sm">
                                                {receptionists.find(r => r.id === app.receptionistId)?.name || 'Admin Staff'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${app.paymentType === 'ONLINE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                                                    } `}>
                                                    {app.paymentType || 'CASH'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-base font-bold text-indigo-700 tracking-tight">₹{app.checkupFee || 0}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="bg-gray-100 p-3 rounded-lg inline-flex mb-4">
                                                <FileQuestion className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No Billing Records Found</h3>
                                            <p className="text-gray-500 text-sm font-medium">Try adjusting your filters or search query</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {filteredAppointments.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 font-medium">
                            Displaying <span className="font-bold text-gray-900">{paginatedAppointments.length}</span> of <span className="font-bold text-gray-900">{filteredAppointments.length}</span> records
                        </p>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w - 9 h - 9 rounded - lg text - sm font - bold transition - all active: scale - 95 ${currentPage === page
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                                } `}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default RevenueAnalytics;
