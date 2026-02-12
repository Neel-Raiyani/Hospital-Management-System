import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Lock,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../api/auth.service.ts';

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(8, 'Password must not exceed 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing reset token. Please request a new link.');
        }
    }, [token]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) return;

        setStatus('loading');
        setMessage(null);
        try {
            const response = await authService.resetPassword({
                token,
                newPassword: data.newPassword,
            });
            setStatus('success');
            setMessage(response.message);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to reset password. The link may be expired.');
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create New Password</h1>
                    <p className="text-gray-500 font-medium text-sm">Set a new secure password for your staff account.</p>
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                                    {message || "Your password has been reset successfully."}
                                </p>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                    Redirecting to login...
                                </p>
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

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                            New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Lock size={18} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="password"
                                                {...register('newPassword')}
                                                disabled={isSubmitting || !token}
                                                className={`w-full h-12 rounded-lg bg-white border-2 pl-12 pr-4 text-sm font-semibold text-gray-900 transition-all outline-none
                                                    ${errors.newPassword ? 'border-rose-400 focus:border-rose-500 ring-rose-500/10 focus:ring-4' : 'border-gray-50 group-hover:border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}
                                                `}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.newPassword && (
                                            <p className="text-xs font-bold text-rose-500 px-1">{errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                <ShieldCheck size={18} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="password"
                                                {...register('confirmPassword')}
                                                disabled={isSubmitting || !token}
                                                className={`w-full h-12 rounded-lg bg-white border-2 pl-12 pr-4 text-sm font-semibold text-gray-900 transition-all outline-none
                                                    ${errors.confirmPassword ? 'border-rose-400 focus:border-rose-500 ring-rose-500/10 focus:ring-4' : 'border-gray-50 group-hover:border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}
                                                `}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-xs font-bold text-rose-500 px-1">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !token}
                                    className="w-full h-14 rounded-lg bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
