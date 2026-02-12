import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    ChevronRight,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../api/auth.service.ts';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setStatus('loading');
        setMessage(null);
        try {
            const response = await authService.forgotPassword(data.email);
            setStatus('success');
            setMessage(response.message);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 font-['Inter',sans-serif] p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-14 h-14 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                            <Activity className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 font-medium text-sm px-8">Enter your registered email and we'll send you a link to reset your password.</p>
                </div>

                <div className="bg-white p-8 rounded-xl border-2 border-gray-100 shadow-sm">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                                    {message || "We've sent a password reset link to your email address."}
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                                >
                                    <ArrowLeft size={16} strokeWidth={2.5} />
                                    Back to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                {status === 'error' && (
                                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold text-rose-700 leading-snug">{message}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        Registered Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Mail size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="email"
                                            {...register('email')}
                                            disabled={isSubmitting}
                                            className={`w-full h-12 rounded-lg bg-white border-2 pl-12 pr-4 text-sm font-semibold text-gray-900 transition-all outline-none
                                                ${errors.email ? 'border-rose-400 focus:border-rose-500 ring-rose-500/10 focus:ring-4' : 'border-gray-50 group-hover:border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}
                                            `}
                                            placeholder="doctor@empyreal.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs font-bold text-rose-500 px-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-14 rounded-lg bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sending Link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                    >
                                        <ArrowLeft size={14} strokeWidth={3} />
                                        Return to Login
                                    </Link>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                        Security Notice
                    </p>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-xs mx-auto">
                        For your security, reset links are valid for one-time use and expire after 1 hour.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
