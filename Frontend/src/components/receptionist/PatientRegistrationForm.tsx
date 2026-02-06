import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/datepicker.css';
import { User, Calendar, Phone, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { patientService } from '../../api/patient.service';
import type { Gender } from '../../types/patient';
import { toast } from 'react-hot-toast';

// Validation schema matching backend requirements
const patientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    dateOfBirth: z.date().refine((date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 0 && age <= 150;
    }, 'Please enter a valid date of birth'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).refine((val) => val !== undefined, {
        message: 'Please select a gender',
    }),
    phone: z.string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .min(10, 'Phone number must be 10 digits')
        .max(10, 'Phone number must be 10 digits'),
    emergencyContact: z.string()
        .regex(/^\d{10}$/, 'Emergency contact must be exactly 10 digits')
        .min(10, 'Emergency contact must be 10 digits')
        .max(10, 'Emergency contact must be 10 digits'),
    medicalHistory: z.string().max(500, 'Medical history is too long (max 500 characters)').optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientRegistrationFormProps {
    onSuccess: (patientPhone: string) => void;
    onCancel: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ onSuccess, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isGenderOpen, setIsGenderOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
    });

    const selectedGender = watch('gender');

    const genderOptions: { value: Gender; label: string }[] = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' },
    ];

    const onSubmit = async (data: PatientFormData) => {
        try {
            setIsSubmitting(true);

            // Format date to ISO string for backend
            const formattedData = {
                ...data,
                dateOfBirth: data.dateOfBirth.toISOString(),
            };

            await patientService.createPatient(formattedData);
            toast.success('Patient registered successfully!');
            onSuccess(data.phone);
        } catch (error: any) {
            console.error('Failed to register patient:', error);
            toast.error(error.response?.data?.message || 'Failed to register patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-['Inter',_sans-serif]">
            {/* Primary Info Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            {...register('name')}
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            className={`w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>}
                </div>

                {/* Date of Birth Field */}
                <div>
                    <label htmlFor="dateOfBirth" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => {
                                setSelectedDate(date);
                                if (date) setValue('dateOfBirth', date, { shouldValidate: true });
                            }}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            maxDate={new Date()}
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            className={`w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium ${errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600 font-medium">{errors.dateOfBirth.message}</p>}
                </div>
            </div>

            {/* Contact Info Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Gender Field */}
                <div>
                    <label htmlFor="gender" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsGenderOpen(!isGenderOpen)}
                            className={`w-full pl-3 pr-9 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm text-left font-medium ${errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'} ${!selectedGender ? 'text-gray-400' : 'text-gray-900'}`}
                        >
                            {selectedGender ? genderOptions.find((opt) => opt.value === selectedGender)?.label : 'Select Gender'}
                        </button>
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isGenderOpen ? 'rotate-180' : ''}`} />
                        {isGenderOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsGenderOpen(false)} />
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden py-1">
                                    {genderOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setValue('gender', option.value, { shouldValidate: true });
                                                setIsGenderOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors ${selectedGender === option.value ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    {errors.gender && <p className="mt-1 text-xs text-red-600 font-medium">{errors.gender.message}</p>}
                </div>

                {/* Phone Field */}
                <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            {...register('phone')}
                            type="tel"
                            id="phone"
                            placeholder="9999900000"
                            maxLength={10}
                            className={`w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>}
                </div>
            </div>

            {/* Emergency and Medical Info */}
            <div className="space-y-4">
                {/* Emergency Contact */}
                <div>
                    <label htmlFor="emergencyContact" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            {...register('emergencyContact')}
                            type="tel"
                            id="emergencyContact"
                            placeholder="Emergency contact number"
                            maxLength={10}
                            className={`w-full px-3 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium ${errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                    </div>
                    {errors.emergencyContact && <p className="mt-1 text-xs text-red-600 font-medium">{errors.emergencyContact.message}</p>}
                </div>

                {/* Medical History */}
                <div>
                    <label htmlFor="medicalHistory" className="block text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wider">
                        Medical History <span className="text-gray-400 text-[10px] font-normal lowercase tracking-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea
                            {...register('medicalHistory')}
                            id="medicalHistory"
                            rows={3}
                            placeholder="Allergies, chronic conditions, etc."
                            className={`w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border rounded-lg outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium resize-none ${errors.medicalHistory ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        />
                    </div>
                    {errors.medicalHistory && <p className="mt-1 text-xs text-red-600 font-medium">{errors.medicalHistory.message}</p>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50 tracking-wide uppercase active:scale-[0.98]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-600/20 tracking-wide uppercase active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Register Patient'
                    )}
                </button>
            </div>
        </form>
    );
};

export default PatientRegistrationForm;
