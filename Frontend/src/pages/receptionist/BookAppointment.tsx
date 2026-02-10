import React, { useState, useEffect } from 'react';
import {
    Search, User, Calendar, Clock,
    ChevronRight, ChevronLeft, CheckCircle,
    Stethoscope,
    Hash, Info, Check, Zap
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../api/patient.service';
import { doctorService, type Doctor } from '../../api/doctor.service';
import { formatDoctorName } from '../../utils/nameUtils';
import { appointmentService } from '../../api/appointment.service';
import type { Patient } from '../../types/patient';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/Dialog";
import { Button } from "../../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/Form";

const bookingSchema = z.object({
    paymentType: z.enum(["CASH", "ONLINE"]),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookAppointment: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [appointmentDate] = useState<Date>(new Date());
    const [isBooking, setIsBooking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [paymentType, setPaymentType] = useState<'CASH' | 'ONLINE' | null>(null);
    const [totalPatients, setTotalPatients] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Debounced patient search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on search
            if (searchQuery.length >= 2) {
                fetchPatients(1, searchQuery);
            } else if (searchQuery.length === 0) {
                fetchPatients(1); // Fetch recent patients
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch patients when page changes
    useEffect(() => {
        if (searchQuery.length >= 2 || searchQuery.length === 0) {
            fetchPatients(currentPage, searchQuery || undefined);
        }
    }, [currentPage]);

    // Reset payment type when modal opens
    useEffect(() => {
        if (isConfirmModalOpen) {
            setPaymentType(null);
            form.reset({ paymentType: undefined });
        }
    }, [isConfirmModalOpen]);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
    });

    // Fetch doctors on mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchPatients = async (page: number = 1, query?: string) => {
        try {
            setIsLoading(true);
            const response = await patientService.listPatients(page, itemsPerPage, query);
            setPatients(response.data);
            setTotalPatients(response.total);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            toast.error('Failed to load patients');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getDoctors();
            setDoctors(data.filter(d => d.isActive));
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            toast.error('Failed to load doctors');
        }
    };

    const isDoctorAvailable = (startTime: string, endTime: string) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = startTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;

        const [endH, endM] = endTime.split(':').map(Number);
        const endMinutes = endH * 60 + endM;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };

    const handleBook = async () => {
        if (!selectedPatient || !selectedDoctor) return;

        try {
            setIsBooking(true);
            const response = await appointmentService.bookAppointment(
                selectedPatient.id,
                selectedDoctor.id,
                appointmentDate.toISOString().split('T')[0],
                paymentType || undefined,
                selectedDoctor.checkupFee || 0
            );
            setBookingDetails(response.appointment);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Book Appointment</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule and confirm new medical appointments
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3">
                    {[
                        { num: 1, label: 'Patient', icon: User },
                        { num: 2, label: 'Doctor', icon: Stethoscope }
                    ].map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = step === s.num;
                        const isCompleted = step > s.num;
                        return (
                            <React.Fragment key={s.num}>
                                <div
                                    onClick={() => isCompleted && setStep(s.num)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${isActive
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : isCompleted
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-400 hover:bg-emerald-100'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                                        }`}>
                                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                                    </div>
                                    <span className="font-semibold text-sm hidden sm:block">{s.label}</span>
                                    <Icon className="w-4 h-4 sm:hidden" />
                                </div>
                                {idx === 0 && (
                                    <ChevronRight className={`w-5 h-5 ${step > 1 ? 'text-emerald-500' : 'text-gray-300'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Left Panel - Main Form */}
                <div className="lg:col-span-2 flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: PATIENT SEARCH */}
                        {step === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full"
                            >
                                <div className="shrink-0 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-300">
                                            <User className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Select Patient</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Search and select a patient</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {totalPatients} found
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col p-6 min-h-0">
                                    {/* Search Input */}
                                    <div className="shrink-0 relative mb-5">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, phone or patient ID..."
                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white transition-all text-sm font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {isLoading && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader size="sm" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Patient List */}
                                    <div className="flex-1 border border-gray-300 rounded-xl overflow-hidden flex flex-col min-h-0 bg-white">
                                        {isLoading && patients.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center p-12">
                                                <Loader size="md" text="Searching..." />
                                            </div>
                                        ) : patients.length > 0 ? (
                                            <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                                                {patients.map((patient, index) => (
                                                    <motion.div
                                                        key={patient.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
                                                        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all ${selectedPatient?.id === patient.id
                                                            ? 'bg-teal-50 border-l-3 border-l-teal-500'
                                                            : 'hover:bg-gray-50 border-l-3 border-l-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${selectedPatient?.id === patient.id
                                                                ? 'bg-teal-600 text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {patient.name[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium text-sm ${selectedPatient?.id === patient.id ? 'text-teal-900' : 'text-gray-900'
                                                                    }`}>
                                                                    {patient.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                    <span className="font-medium">{patient.patientId}</span>
                                                                    <span>•</span>
                                                                    <span>{patient.phone}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {selectedPatient?.id === patient.id && (
                                                            <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center flex-1 flex flex-col justify-center items-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                    <User className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-[#111827] text-sm font-bold">Search for a patient</p>
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Enter at least 2 characters</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPatients > itemsPerPage && (
                                        <div className="shrink-0 flex items-center justify-between px-1 mt-4 mb-1">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Page <span className="text-teal-600">{currentPage}</span> of {Math.ceil(totalPatients / itemsPerPage)}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1 || isLoading}
                                                    className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => (prev * itemsPerPage < totalPatients ? prev + 1 : prev))}
                                                    disabled={currentPage * itemsPerPage >= totalPatients || isLoading}
                                                    className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-300 flex justify-end">
                                    <button
                                        disabled={!selectedPatient}
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: DOCTOR SELECTION */}
                        {step === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full"
                            >
                                <div className="shrink-0 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-300">
                                            <Stethoscope className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Select Doctor</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Choose an available doctor</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-300">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        {doctors.filter(d => isDoctorAvailable(d.opdStartTime, d.opdEndTime)).length} available
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                                        {doctors.map((doctor, index) => {
                                            const available = isDoctorAvailable(doctor.opdStartTime, doctor.opdEndTime);
                                            return (
                                                <motion.div
                                                    key={doctor.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    onClick={() => available && setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor)}
                                                    className={`relative p-4 rounded-lg border-2 transition-all ${available
                                                        ? 'cursor-pointer hover:shadow-md border-emerald-400 bg-emerald-50/40 hover:border-emerald-500'
                                                        : 'cursor-not-allowed border-gray-300 bg-gray-100/50'
                                                        } ${selectedDoctor?.id === doctor.id
                                                            ? 'border-teal-500 bg-teal-50'
                                                            : ''
                                                        }`}
                                                >
                                                    {selectedDoctor?.id === doctor.id && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center shadow-sm">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm ${selectedDoctor?.id === doctor.id
                                                            ? 'bg-teal-600 text-white'
                                                            : available
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-gray-300 text-gray-500'
                                                            }`}>
                                                            Dr
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-semibold text-sm truncate ${available ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                {formatDoctorName(doctor.name)}
                                                            </p>
                                                            <p className={`text-xs font-medium mt-0.5 ${available ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                                {doctor.specialization}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center justify-between p-2.5 rounded-md ${available ? 'bg-emerald-100/50' : 'bg-gray-200/50'}`}>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            <span>{doctor.opdStartTime} - {doctor.opdEndTime}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${available
                                                            ? 'bg-emerald-200 text-emerald-800'
                                                            : 'bg-gray-300 text-gray-600'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-600 animate-pulse' : 'bg-gray-500'
                                                                }`} />
                                                            {available ? 'Available' : 'Not Available'}
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">Fee</span>
                                                        <span className={`text-base font-bold ${available ? 'text-emerald-700' : 'text-gray-500'}`}>₹{doctor.checkupFee || 0}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-300 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                    <button
                                        disabled={!selectedDoctor}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        Confirm Booking
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Panel - Summary */}
                <div className="lg:col-span-1 h-full overflow-hidden">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-sm h-full flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-300">
                            <h3 className="font-bold text-[#111827] flex items-center gap-2">
                                <Info className="w-4 h-4 text-teal-600" />
                                Booking Summary
                            </h3>
                        </div>
                        <div className="p-5 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {/* Patient */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</label>
                                {selectedPatient ? (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                            {selectedPatient.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{selectedPatient.name}</p>
                                            <p className="text-xs text-gray-500">{selectedPatient.patientId}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                                        <p className="text-xs text-gray-400">Select a patient</p>
                                    </div>
                                )}
                            </div>

                            {/* Doctor */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</label>
                                {selectedDoctor ? (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                            Dr
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{formatDoctorName(selectedDoctor.name)}</p>
                                            <p className="text-xs text-teal-600 font-medium">{selectedDoctor.specialization}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                                        <p className="text-xs text-gray-400">Select a doctor</p>
                                    </div>
                                )}
                            </div>

                            {/* Date & Fee */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-300">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                            <Calendar className="w-4 h-4 text-teal-600" />
                                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee</label>
                                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-300">
                                        <p className="text-lg font-extrabold text-teal-700">
                                            ₹{selectedDoctor?.checkupFee || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[460px] rounded-lg overflow-hidden p-0 border border-gray-300 shadow-xl">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="confirm-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <DialogHeader className="px-6 py-5 border-b border-gray-300 bg-gray-50">
                                    <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-teal-600" />
                                        </div>
                                        Confirm Appointment
                                    </DialogTitle>
                                </DialogHeader>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(() => {
                                        handleBook();
                                    })} className="p-6 space-y-5">
                                        {/* Summary */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                                <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                                    {selectedPatient?.name[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400 font-medium">Patient</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{selectedPatient?.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                                <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                                    Dr
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400 font-medium">Doctor</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{formatDoctorName(selectedDoctor?.name)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                                                    <p className="text-xs text-gray-400 font-medium">Date</p>
                                                    <p className="font-semibold text-gray-900 text-sm mt-0.5">
                                                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-teal-50 rounded-lg border border-teal-300">
                                                    <p className="text-xs text-teal-600 font-medium">Fee</p>
                                                    <p className="font-bold text-teal-700 text-lg">₹{selectedDoctor?.checkupFee || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <FormField
                                            control={form.control}
                                            name="paymentType"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-gray-700">
                                                        Payment Method <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    field.onChange("CASH");
                                                                    setPaymentType("CASH");
                                                                }}
                                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${field.value === 'CASH'
                                                                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                                                                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                                                    }`}
                                                            >
                                                                <Hash className="w-4 h-4" />
                                                                <span className="font-semibold text-sm">Cash</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    field.onChange("ONLINE");
                                                                    setPaymentType("ONLINE");
                                                                }}
                                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${field.value === 'ONLINE'
                                                                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                                                                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                                                    }`}
                                                            >
                                                                <Zap className="w-4 h-4" />
                                                                <span className="font-semibold text-sm">Online</span>
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500" />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="pt-2 flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsConfirmModalOpen(false)}
                                                className="flex-1 h-11 rounded-lg border-gray-300 font-semibold text-sm"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isBooking || !form.formState.isValid}
                                                className="flex-1 h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
                                            >
                                                {isBooking ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader size="sm" />
                                                        <span>Booking...</span>
                                                    </div>
                                                ) : (
                                                    'Confirm Booking'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-view"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.4 }}
                                className="p-8 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-5"
                                >
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
                                <div className="inline-flex items-center px-4 py-2 bg-teal-50 rounded-lg border border-teal-300 mb-6">
                                    <span className="text-teal-700 font-bold">Token: #{bookingDetails?.tokenNumber || '---'}</span>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-300 space-y-3 text-left">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Patient</span>
                                        <span className="font-semibold text-gray-900">{selectedPatient?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Doctor</span>
                                        <span className="font-semibold text-gray-900">{formatDoctorName(selectedDoctor?.name)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Date & Fee</span>
                                        <span className="font-semibold text-teal-700">
                                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • ₹{selectedDoctor?.checkupFee}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/receptionist/appointments')}
                                        className="h-11 rounded-lg border-gray-300 font-semibold text-sm"
                                    >
                                        View List
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setStep(1);
                                            setIsSuccess(false);
                                            setSelectedPatient(null);
                                            setSelectedDoctor(null);
                                            setBookingDetails(null);
                                            setIsConfirmModalOpen(false);
                                        }}
                                        className="h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm"
                                    >
                                        Book Another
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookAppointment;
