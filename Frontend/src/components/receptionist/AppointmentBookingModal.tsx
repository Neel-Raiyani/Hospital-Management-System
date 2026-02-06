import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, User, Zap, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { doctorService, type Doctor } from '../../api/doctor.service';
import { appointmentService } from '../../api/appointment.service';
import type { Patient } from '../../types/patient';

interface AppointmentBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onSuccess?: () => void;
}

type Priority = 'NORMAL' | 'URGENT' | 'EMERGENCY';

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
    isOpen,
    onClose,
    patient,
    onSuccess
}) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [priority, setPriority] = useState<Priority>('NORMAL');
    const [loading, setLoading] = useState(false);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeError, setTimeError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDoctors();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedDoctor && appointmentTime) {
            validateTimeSlot();
        }
    }, [selectedDoctor, appointmentTime]);

    const fetchDoctors = async () => {
        try {
            setDoctorsLoading(true);
            const data = await doctorService.getDoctors();
            setDoctors(data.filter(d => d.isActive));
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
        } finally {
            setDoctorsLoading(false);
        }
    };

    const validateTimeSlot = () => {
        const doctor = doctors.find(d => d.id === selectedDoctor);
        if (!doctor || !appointmentTime) return;

        const [hours, minutes] = appointmentTime.split(':').map(Number);
        const appointmentMinutes = hours * 60 + minutes;

        const [startHours, startMinutes] = doctor.opdStartTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;

        const [endHours, endMinutes] = doctor.opdEndTime.split(':').map(Number);
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (appointmentMinutes < startTotalMinutes || appointmentMinutes > endTotalMinutes) {
            setTimeError(
                `Dr. ${doctor.name} is available from ${doctor.opdStartTime} to ${doctor.opdEndTime}`
            );
        } else {
            setTimeError(null);
        }
    };

    const handleSubmit = async () => {
        if (!patient) {
            setError('No patient selected');
            return;
        }

        if (!selectedDoctor) {
            setError('Please select a doctor');
            return;
        }

        if (!appointmentTime) {
            setError('Please select appointment time');
            return;
        }

        if (timeError) {
            setError('Please select a valid time slot');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await appointmentService.bookAppointment(
                patient.id,
                selectedDoctor,
                new Date().toISOString().split('T')[0]
            );

            onSuccess?.();
            onClose();
            resetForm();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedDoctor('');
        setAppointmentTime('');
        setPriority('NORMAL');
        setError(null);
        setTimeError(null);
    };

    const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

    const priorityOptions = [
        { value: 'NORMAL', label: 'Normal', color: 'border-gray-300 text-gray-700 hover:border-teal-500', activeColor: 'border-teal-600 bg-teal-50 text-teal-700', icon: Calendar },
        { value: 'URGENT', label: 'Urgent', color: 'border-gray-300 text-gray-700 hover:border-amber-500', activeColor: 'border-amber-600 bg-amber-50 text-amber-700', icon: Clock },
        { value: 'EMERGENCY', label: 'Emergency', color: 'border-gray-300 text-gray-700 hover:border-red-500', activeColor: 'border-red-600 bg-red-50 text-red-700', icon: Zap }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] rounded-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-[#27374D] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-3">
                            <Calendar className="w-5 h-5" />
                            Book Appointment
                        </DialogTitle>
                        <DialogDescription className="text-teal-100 mt-1">
                            Schedule an OPD consultation for the patient
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-5">
                    {/* Patient Info */}
                    {patient && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-600 mb-2">Patient Details</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                    {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                                    <p className="text-xs text-gray-600">ID: {patient.patientId} • Phone: {patient.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Doctor <span className="text-red-500">*</span>
                        </label>
                        {doctorsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                            </div>
                        ) : (
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                <option value="">Choose a doctor...</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.name} - {doctor.specialization} ({doctor.opdStartTime} - {doctor.opdEndTime})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Selected Doctor Info */}
                    {selectedDoctorData && (
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-teal-900">Dr. {selectedDoctorData.name}</h4>
                                    <p className="text-sm text-teal-700 mt-0.5">{selectedDoctorData.specialization}</p>
                                    <div className="flex items-center gap-2 text-xs text-teal-600 mt-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        OPD Hours: {selectedDoctorData.opdStartTime} - {selectedDoctorData.opdEndTime}
                                        {selectedDoctorData.experienceYears && ` • ${selectedDoctorData.experienceYears} years exp.`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Appointment Date
                            </label>
                            <div className="flex items-center gap-3 text-teal-900 font-bold">
                                <Calendar className="w-5 h-5 text-teal-600" />
                                <span>Today ({new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Appointment Time <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="time"
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                                className={`h-11 ${timeError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>

                    {/* Time Validation Error */}
                    {timeError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900">{timeError}</p>
                        </div>
                    )}

                    {/* Priority Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {priorityOptions.map((option) => {
                                const Icon = option.icon;
                                const isActive = priority === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setPriority(option.value as Priority)}
                                        className={`p-3 rounded-md border-2 transition-all ${isActive ? option.activeColor : option.color
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mx-auto mb-1.5" />
                                        <p className="text-xs font-medium">{option.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm font-medium text-red-900">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-10 rounded-md font-medium border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !!timeError}
                            className="flex-1 h-10 rounded-md font-medium bg-[#769FCD] hover:bg-[#5a8bbd] text-white disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Confirm Booking
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentBookingModal;
