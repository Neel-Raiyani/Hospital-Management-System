import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    UserPlus, GraduationCap,
    Clock, CheckCircle, Loader2,
    ChevronLeft, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../../api/auth.service.ts';

// Doctor Validation Schema
const doctorSchema = z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experienceYears: z.coerce.number().min(0, 'Experience cannot be negative').max(50, 'Really? 50+ years?'),
    opdStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    opdEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
}).refine((data) => {
    const start = data.opdStartTime.split(':').map(Number);
    const end = data.opdEndTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
}, {
    message: "End time must be after start time",
    path: ["opdEndTime"],
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

const AddDoctorPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            specialization: '',
            qualification: '',
            experienceYears: 0,
            opdStartTime: '09:00',
            opdEndTime: '17:00'
        }
    });

    const onSubmit = async (data: DoctorFormValues) => {
        try {
            setError(null);
            const payload = {
                name: data.name,
                email: data.email,
                role: 'DOCTOR',
                doctorData: {
                    specialization: data.specialization,
                    qualification: data.qualification,
                    experienceYears: data.experienceYears,
                    opdStartTime: data.opdStartTime,
                    opdEndTime: data.opdEndTime
                }
            };

            await authService.register(payload);
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                reset();
                navigate('/admin/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add doctor. Please try again.');
        }
    };

    const inputClasses = (error?: any) => `
        block w-full px-4 py-3 bg-white border rounded-xl outline-none transition-all
        ${error
            ? 'border-red-300 focus:ring-2 focus:ring-red-50 focus:border-red-400'
            : 'border-gray-200 focus:ring-2 focus:ring-blue-50 focus:border-blue-400'}
    `;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-2 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
                    <p className="text-gray-500">Register a new medical professional to the system</p>
                </div>
                <div className="hidden md:flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl text-blue-600">
                    <UserPlus className="w-8 h-8" />
                </div>
            </div>

            {isSubmitted && (
                <div className="mb-8 bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                        <p className="font-bold">Doctor Added Successfully!</p>
                        <p className="text-sm opacity-90">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold">Error Adding Doctor</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                    {/* Basic Info Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    className={inputClasses(errors.name)}
                                    placeholder="Dr. Rajesh Kumar"
                                />
                                {errors.name && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={inputClasses(errors.email)}
                                    placeholder="rajesh@hospital.com"
                                />
                                {errors.email && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Professional Info Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Professional Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Specialization */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Specialization</label>
                                <input
                                    type="text"
                                    {...register('specialization')}
                                    className={inputClasses(errors.specialization)}
                                    placeholder="Cardiology"
                                />
                                {errors.specialization && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.specialization.message}</p>
                                )}
                            </div>

                            {/* Qualification */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Qualification</label>
                                <input
                                    type="text"
                                    {...register('qualification')}
                                    className={inputClasses(errors.qualification)}
                                    placeholder="MBBS, MD"
                                />
                                {errors.qualification && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.qualification.message}</p>
                                )}
                            </div>

                            {/* Experience */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Experience (Years)</label>
                                <input
                                    type="number"
                                    {...register('experienceYears')}
                                    className={inputClasses(errors.experienceYears)}
                                    placeholder="5"
                                />
                                {errors.experienceYears && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.experienceYears.message}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* OPD Info Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">OPD Timings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Time */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">OPD Start Time</label>
                                <input
                                    type="time"
                                    {...register('opdStartTime')}
                                    className={inputClasses(errors.opdStartTime)}
                                />
                                {errors.opdStartTime && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.opdStartTime.message}</p>
                                )}
                            </div>

                            {/* End Time */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">OPD End Time</label>
                                <input
                                    type="time"
                                    {...register('opdEndTime')}
                                    className={inputClasses(errors.opdEndTime)}
                                />
                                {errors.opdEndTime && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.opdEndTime.message}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="pt-8 border-t border-gray-50 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving Doctor...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Register Doctor</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDoctorPage;
