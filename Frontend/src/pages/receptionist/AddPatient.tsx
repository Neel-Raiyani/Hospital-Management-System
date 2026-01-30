import React, { useState } from 'react';
import { UserPlus, Calendar, Phone, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../api/patient.service';
import type { CreatePatientRequest } from '../../types/patient';
import { toast } from 'react-hot-toast';

const AddPatient: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CreatePatientRequest>({
        name: '',
        dateOfBirth: '',
        gender: 'MALE',
        phone: '',
        emergencyContact: '',
        medicalHistory: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreatePatientRequest, string>>>({});

    // Validation functions
    const validatePhone = (phone: string): boolean => {
        // Indian phone number validation (10 digits)
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    const validateDOB = (dob: string): boolean => {
        if (!dob) return false;
        const selectedDate = new Date(dob);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 150); // Max age 150 years

        // Check if date is valid and not in future
        return selectedDate <= today && selectedDate >= minDate;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof CreatePatientRequest]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreatePatientRequest, string>> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // DOB validation
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else if (!validateDOB(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth (not in future)';
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
        }

        // Emergency contact validation
        if (!formData.emergencyContact) {
            newErrors.emergencyContact = 'Emergency contact is required';
        } else if (!validatePhone(formData.emergencyContact)) {
            newErrors.emergencyContact = 'Please enter a valid 10-digit Indian phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            await patientService.createPatient(formData);

            // Show success toast
            toast.success('Patient registered successfully!', {
                duration: 4000,
                icon: '✅',
            });

            // Reset form
            setFormData({
                name: '',
                dateOfBirth: '',
                gender: 'MALE',
                phone: '',
                emergencyContact: '',
                medicalHistory: ''
            });

            // Navigate to patient list after success
            setTimeout(() => {
                navigate('/receptionist/patients');
            }, 1000);

        } catch (error: any) {
            console.error('Error creating patient:', error);

            // Handle validation errors or specific backend responses
            const errorMessage = error.response?.data?.message || 'Failed to register patient. Please try again.';

            // If backend returns field-specific errors (common in Zod or Prisma validation)
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                if (Array.isArray(backendErrors)) {
                    backendErrors.forEach((err: any) => {
                        toast.error(err.message || 'Validation error');
                    });
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 transition-all";
    const labelClasses = "block text-sm font-bold text-gray-700 mb-2";
    const errorClasses = "mt-1 text-sm text-red-600 flex items-center gap-1";

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
                        <p className="text-gray-500">Register a new patient in the system</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-2">
                        <label htmlFor="name" className={labelClasses}>
                            <User className="w-4 h-4 inline mr-1" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Enter patient's full name"
                        />
                        {errors.name && (
                            <p className={errorClasses}>
                                <AlertCircle className="w-4 h-4" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label htmlFor="dateOfBirth" className={labelClasses}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            className={`${inputClasses} ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                        />
                        {errors.dateOfBirth && (
                            <p className={errorClasses}>
                                <AlertCircle className="w-4 h-4" />
                                {errors.dateOfBirth}
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className={labelClasses}>
                            Gender *
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={`${inputClasses} ${errors.gender ? 'border-red-500' : ''}`}
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                        {errors.gender && (
                            <p className={errorClasses}>
                                <AlertCircle className="w-4 h-4" />
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className={labelClasses}>
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`${inputClasses} ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                        />
                        {errors.phone && (
                            <p className={errorClasses}>
                                <AlertCircle className="w-4 h-4" />
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label htmlFor="emergencyContact" className={labelClasses}>
                            <Phone className="w-4 h-4 inline mr-1" />
                            Emergency Contact *
                        </label>
                        <input
                            type="tel"
                            id="emergencyContact"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            className={`${inputClasses} ${errors.emergencyContact ? 'border-red-500' : ''}`}
                            placeholder="10-digit mobile number"
                            maxLength={10}
                        />
                        {errors.emergencyContact && (
                            <p className={errorClasses}>
                                <AlertCircle className="w-4 h-4" />
                                {errors.emergencyContact}
                            </p>
                        )}
                    </div>

                    {/* Medical History */}
                    <div className="md:col-span-2">
                        <label htmlFor="medicalHistory" className={labelClasses}>
                            Medical History (Optional)
                        </label>
                        <textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleInputChange}
                            rows={4}
                            className={inputClasses}
                            placeholder="Enter any relevant medical history, allergies, or conditions..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/receptionist/dashboard')}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Register Patient
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPatient;
