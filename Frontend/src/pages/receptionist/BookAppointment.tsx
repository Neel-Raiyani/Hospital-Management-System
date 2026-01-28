import React, { useState } from 'react';
import {
    Search, User, Calendar, Clock,
    ChevronRight, ChevronLeft, CheckCircle,
    Loader2, Filter,
    Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA FOR UI DEVELOPMENT ---
const MOCK_PATIENTS = [
    { id: '1', name: 'John Doe', phone: '9876543210', patientId: 1001, gender: 'MALE', age: 34 },
    { id: '2', name: 'Jane Smith', phone: '8765432109', patientId: 1002, gender: 'FEMALE', age: 28 },
    { id: '3', name: 'Michael Brown', phone: '7654321098', patientId: 1003, gender: 'MALE', age: 45 },
];

const MOCK_DOCTORS = [
    {
        id: 'd1', name: 'Dr. Rajesh Kumar', specialization: 'Cardiology',
        opdStartTime: '09:00', opdEndTime: '13:00', experienceYears: 12,
        availableTokens: 5
    },
    {
        id: 'd2', name: 'Dr. Sunita Sharma', specialization: 'Pediatrics',
        opdStartTime: '10:00', opdEndTime: '17:00', experienceYears: 8,
        availableTokens: 12
    },
    {
        id: 'd3', name: 'Dr. Amit Patel', specialization: 'Orthopedics',
        opdStartTime: '14:00', opdEndTime: '20:00', experienceYears: 15,
        availableTokens: 0
    },
];

const BookAppointment: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Filter patients based on search
    const filteredPatients = MOCK_PATIENTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.patientId.toString().includes(searchQuery)
    );

    // Generate dummy slots for a doctor
    const generateSlots = (startTime: string, endTime: string) => {
        const slots = [];
        let [hour, minute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const endTotal = endHour * 60 + endMinute;

        while (hour * 60 + minute < endTotal) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
            minute += 20; // 20 min slots
            if (minute >= 60) {
                hour += 1;
                minute -= 60;
            }
        }
        return slots;
    };

    const handleBook = async () => {
        setIsBooking(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsBooking(false);
        setIsSuccess(true);
    };

    const inputClasses = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all";

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                    <p className="text-gray-500">Schedule a new visit for a patient</p>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${step === s ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'
                                }`}
                        >
                            Step {s}
                        </div>
                    ))}
                </div>
            </div>

            {/* Success View */}
            {isSuccess ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-50 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        The appointment has been scheduled successfully. Token Number: <span className="font-bold text-blue-600">OPD-0{Math.floor(Math.random() * 99)}</span>
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/receptionist/dashboard')}
                            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => { setStep(1); setIsSuccess(false); setSelectedPatient(null); setSelectedDoctor(null); }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                        >
                            Book Another
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* STEP 1: PATIENT SEARCH */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-blue-600" />
                                    Find Patient
                                </h3>
                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by Name, Phone or ID..."
                                        className={`${inputClasses} pl-12`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {filteredPatients.map(patient => (
                                        <div
                                            key={patient.id}
                                            onClick={() => setSelectedPatient(patient)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedPatient?.id === patient.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-50'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-blue-600 font-bold">
                                                    {patient.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{patient.name}</p>
                                                    <p className="text-sm text-gray-500">ID: {patient.patientId} • {patient.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md uppercase">
                                                    {patient.gender} • {patient.age}y
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredPatients.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No patients found. Would you like to register a new one?</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        disabled={!selectedPatient}
                                        onClick={() => setStep(2)}
                                        className="bg-blue-600 text-white pr-6 pl-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group shadow-lg shadow-blue-100"
                                    >
                                        Next Component
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCTOR SELECTION */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                                        Select Doctor
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-100">
                                            <Filter className="w-4 h-4" />
                                            Specialization
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MOCK_DOCTORS.map(doctor => (
                                        <div
                                            key={doctor.id}
                                            onClick={() => doctor.availableTokens > 0 && setSelectedDoctor(doctor)}
                                            className={`relative p-5 rounded-2xl border transition-all ${doctor.availableTokens === 0 ? 'opacity-60 grayscale cursor-not-allowed border-gray-100' :
                                                selectedDoctor?.id === doctor.id
                                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-50 cursor-pointer'
                                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 cursor-pointer'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl">
                                                    Dr
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{doctor.name}</p>
                                                    <p className="text-sm font-semibold text-indigo-600">{doctor.specialization}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500 bg-white/50 p-3 rounded-xl border border-gray-50">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {doctor.opdStartTime} - {doctor.opdEndTime}
                                                </div>
                                                <div className="font-bold">
                                                    Tokens: {doctor.availableTokens}
                                                </div>
                                            </div>

                                            {selectedDoctor?.id === doctor.id && (
                                                <div className="absolute top-4 right-4 text-indigo-600">
                                                    <CheckCircle className="w-6 h-6 fill-indigo-50" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                    <button
                                        disabled={!selectedDoctor}
                                        onClick={() => setStep(3)}
                                        className="bg-indigo-600 text-white pr-6 pl-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group shadow-lg shadow-indigo-100"
                                    >
                                        Next Step
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SLOT SELECTION & CONFIRM */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Slot Selection */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <Clock className="w-6 h-6 text-orange-600" />
                                            Available Slots
                                        </h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {generateSlots(selectedDoctor.opdStartTime, selectedDoctor.opdEndTime).map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${selectedSlot === slot
                                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-transparent hover:border-orange-200'
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Summary */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-6">
                                        <h3 className="text-xl font-bold mb-6">Summary</h3>

                                        <div className="space-y-6">
                                            <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Patient</p>
                                                    <p className="font-bold text-gray-900">{selectedPatient.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <Stethoscope className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Doctor</p>
                                                    <p className="font-bold text-gray-900">{selectedDoctor.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center text-orange-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Schedule</p>
                                                    <p className="font-bold text-gray-900">Today, {selectedSlot || '--:--'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            disabled={!selectedSlot || isBooking}
                                            onClick={handleBook}
                                            className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isBooking ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    Confirming...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-6 h-6" />
                                                    Confirm Booking
                                                </>
                                            )}
                                        </button>

                                        <button
                                            disabled={isBooking}
                                            onClick={() => setStep(2)}
                                            className="w-full mt-3 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                        >
                                            Change Selection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookAppointment;
