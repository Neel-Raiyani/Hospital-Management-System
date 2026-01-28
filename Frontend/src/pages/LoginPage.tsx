import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hospital, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { decodeToken } from '../utils/jwt.ts';

// Login Validation Schema
const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardMap: Record<string, string> = {
                ADMIN: '/admin/dashboard',
                DOCTOR: '/doctor/dashboard',
                LAB: '/lab/dashboard',
                RECEPTIONIST: '/receptionist/dashboard',
            };
            navigate(dashboardMap[user.role] || '/', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError(null);
        try {
            await login(data);

            const token = localStorage.getItem('token');
            if (token) {
                const decoded = decodeToken(token);
                if (decoded) {
                    const dashboardMap: Record<string, string> = {
                        ADMIN: '/admin/dashboard',
                        DOCTOR: '/doctor/dashboard',
                        LAB: '/lab/dashboard',
                        RECEPTIONIST: '/receptionist/dashboard',
                    };
                    navigate(dashboardMap[decoded.role] || '/');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        }
    };

    const inputClasses = (error?: any) => `
        block w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all
        ${error
            ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400'
            : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400'}
        disabled:opacity-50
    `;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4 text-blue-600">
                        <Hospital className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Empyreal <span className="text-blue-600">HMS</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Healthcare management simplified</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-8 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
                        <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your dashboard</p>
                    </div>

                    {serverError && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{serverError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    {...register('email')}
                                    disabled={isSubmitting}
                                    className={inputClasses(errors.email)}
                                    placeholder="name@hospital.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    {...register('password')}
                                    disabled={isSubmitting}
                                    className={inputClasses(errors.password)}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                'Sign Into Dashboard'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <p className="text-center text-gray-500 text-xs mt-8">
                    &copy; 2024 Empyreal HMS. All rights reserved. <br />
                    Authorized medical personnel only.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
