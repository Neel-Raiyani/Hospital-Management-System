import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/auth.service.ts';
import {
    UserPlus, CheckCircle, Loader2, ChevronLeft,
    Shield, AlertCircle
} from 'lucide-react';

// Receptionist Validation Schema
const receptionistSchema = z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    shift: z.enum(['MORNING', 'EVENING', 'NIGHT']),
});

type ReceptionistFormValues = z.infer<typeof receptionistSchema>;

const AddReceptionistPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ReceptionistFormValues>({
        resolver: zodResolver(receptionistSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            shift: 'MORNING'
        }
    });

    const onSubmit = async (data: ReceptionistFormValues) => {
        try {
            setError(null);
            const payload = {
                name: data.name,
                email: data.email,
                role: 'RECEPTIONIST',
                receptionistData: {
                    phone: data.phone,
                    shift: data.shift
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
            setError(err.response?.data?.message || 'Failed to add receptionist. Please try again.');
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
                    <h1 className="text-3xl font-bold text-gray-900">Add Receptionist</h1>
                    <p className="text-gray-500">Register a new front-desk staff member</p>
                </div>
                <div className="hidden md:flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl text-blue-600">
                    <Shield className="w-8 h-8" />
                </div>
            </div>

            {/* Success Message */}
            {isSubmitted && (
                <div className="mb-8 bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                        <p className="font-bold">Receptionist Added Successfully!</p>
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
                        <p className="font-bold">Error Adding Receptionist</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('name')}
                                    className={inputClasses(errors.name)}
                                    placeholder="Enter full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={inputClasses(errors.email)}
                                    placeholder="reception@hospital.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('phone')}
                                    className={inputClasses(errors.phone)}
                                    placeholder="9876543210"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Shift Selection */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Assign Shift</label>
                            <select
                                {...register('shift')}
                                className={inputClasses(errors.shift)}
                            >
                                <option value="MORNING">Morning Shift (08:00 AM - 02:00 PM)</option>
                                <option value="EVENING">Evening Shift (02:00 PM - 08:00 PM)</option>
                                <option value="NIGHT">Night Shift (08:00 PM - 08:00 AM)</option>
                            </select>
                            {errors.shift && (
                                <p className="text-xs font-medium text-red-500 ml-1 mt-1">{errors.shift.message}</p>
                            )}
                        </div>
                    </div>

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
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Register Receptionist</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReceptionistPage;
