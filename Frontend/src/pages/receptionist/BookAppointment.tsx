import React, { useState, useEffect } from 'react';
import {
    Search, User, Calendar, Clock,
    ChevronRight, ChevronLeft, CheckCircle,
    Loader2, Stethoscope,
    Phone, Hash, Info, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../api/patient.service';
import { doctorService, type Doctor } from '../../api/doctor.service';
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

    // Debounced patient search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                fetchPatients(searchQuery);
            } else if (searchQuery.length === 0) {
                fetchPatients(); // Fetch recent patients
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch doctors on mount
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchPatients = async (query?: string) => {
        try {
            setIsLoading(true);
            const response = await patientService.listPatients(1, 5, query);
            setPatients(response.data);
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
                appointmentDate.toISOString().split('T')[0]
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
        <div className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Book Appointment</h1>
                    <p className="text-[#6B7280] mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Today: {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="hidden md:flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${step === s ? 'bg-teal-600 text-white' : 'text-gray-400'}`}
                        >
                            {s === 1 ? 'Patient' : 'Doctor'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Success View */}
            {isSuccess ? (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Appointment Confirmed</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Token: <span className="font-bold text-teal-600">#{bookingDetails?.tokenNumber || '---'}</span>
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto text-left text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">Patient</span>
                            <span className="font-semibold text-gray-900">{selectedPatient?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">Doctor</span>
                            <span className="font-semibold text-gray-900">Dr. {selectedDoctor?.name}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500">Date</span>
                            <span className="font-semibold text-gray-900">{appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => navigate('/receptionist/appointments')}
                            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all"
                        >
                            View Appointments
                        </button>
                        <button
                            onClick={() => { setStep(1); setIsSuccess(false); setSelectedPatient(null); setSelectedDoctor(null); setBookingDetails(null); }}
                            className="px-5 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-all"
                        >
                            Book Another
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* STEP 1: PATIENT SEARCH */}
                    {step === 1 && (
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-teal-600" />
                                    Find Patient
                                </h3>
                                <span className="text-xs text-gray-400">{patients.length} found</span>
                            </div>

                            <div className="p-4">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone or ID..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {isLoading && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 animate-spin" />
                                    )}
                                </div>

                                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
                                    {patients.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {patients.map((patient, index) => (
                                                <div
                                                    key={patient.id}
                                                    onClick={() => setSelectedPatient(patient)}
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left-2 ${selectedPatient?.id === patient.id
                                                        ? 'bg-teal-50 border-l-2 border-teal-500 shadow-sm'
                                                        : 'hover:bg-gray-50 hover:shadow-sm border-l-2 border-transparent hover:translate-x-1'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                                                            {patient.name[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                <span>{patient.patientId}</span>
                                                                <span>•</span>
                                                                <span>{patient.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedPatient?.id === patient.id && (
                                                        <Check className="w-4 h-4 text-teal-600 animate-in zoom-in duration-200" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-400">
                                            <User className="w-6 h-6 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Search for a patient</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
                                <button
                                    disabled={!selectedPatient}
                                    onClick={() => setStep(2)}
                                    className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-teal-700 hover:shadow-md hover:shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 active:scale-95"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCTOR SELECTION */}
                    {step === 2 && (
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-teal-600" />
                                    Select Doctor
                                </h3>
                                <span className="text-xs text-gray-400">{doctors.length} available</span>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {doctors.map((doctor, index) => {
                                        const available = isDoctorAvailable(doctor.opdStartTime, doctor.opdEndTime);
                                        return (
                                            <div
                                                key={doctor.id}
                                                onClick={() => {
                                                    if (available) {
                                                        setSelectedDoctor(doctor);
                                                    }
                                                }}
                                                style={{ animationDelay: `${index * 75}ms` }}
                                                className={`relative p-4 rounded-lg border transition-all duration-200 animate-in fade-in zoom-in-95 ${available ? 'cursor-pointer hover:border-teal-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5' : 'cursor-not-allowed opacity-50 grayscale'} ${selectedDoctor?.id === doctor.id
                                                    ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-500/10'
                                                    : 'border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        Dr
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">Dr. {doctor.name}</p>
                                                        <p className="text-xs text-teal-600 font-medium">{doctor.specialization}</p>
                                                    </div>
                                                    {selectedDoctor?.id === doctor.id && (
                                                        <Check className="w-4 h-4 text-teal-600 ml-auto animate-in zoom-in duration-200" />
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {doctor.opdStartTime} - {doctor.opdEndTime}
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${available ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                        {available ? 'Online' : 'Offline'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-1 transition-all duration-200 hover:-translate-x-0.5"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    disabled={!selectedDoctor}
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    className="bg-teal-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-teal-700 hover:shadow-md hover:shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 active:scale-95"
                                >
                                    Confirm
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[380px] rounded-lg overflow-hidden p-0 border-none shadow-xl">
                    <DialogHeader className="bg-[#111827] px-6 py-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-teal-400" />
                            </div>
                            Confirm Booking
                        </DialogTitle>
                        <p className="text-gray-400 mt-2 text-sm font-medium">Please review the appointment details</p>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-teal-600 shadow-sm">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Patient Name</p>
                                    <p className="font-bold text-gray-900 truncate">{selectedPatient?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-teal-600 shadow-sm">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Consultant Doctor</p>
                                    <p className="font-bold text-gray-900 truncate">Dr. {selectedDoctor?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-teal-100 text-teal-600 shadow-sm">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Appointment For</p>
                                    <p className="font-bold text-teal-900">Today, {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                A sequential token will be generated. The patient will be seen on a first-come, first-served basis.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all uppercase text-[10px] tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                handleBook();
                            }}
                            disabled={isBooking}
                            className="flex-1 h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all uppercase text-[10px] tracking-widest"
                        >
                            {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirm & Book
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookAppointment;
