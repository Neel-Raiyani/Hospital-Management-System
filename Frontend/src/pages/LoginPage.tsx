import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ShieldCheck,
    Lock,
    User,
    ShieldAlert,
    ChevronRight,
    Activity,
    Stethoscope,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.ts';
import { decodeToken } from '../utils/jwt.ts';

// ─── Login Validation Schema ────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string()
        .min(1, 'Employee ID or Email is required')
        .refine(
            (val) => val.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : val.length >= 3,
            'Please enter a valid Employee ID or Email'
        ),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
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
            setServerError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-['Inter',sans-serif]">
            {/* ── Left Side: Brand & Visual ── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center p-12">
                {/* Structural background elements (Solid, No Gradients) */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="h-full w-full border-b border-r border-slate-700" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)' }} />
                </div>

                {/* Role Harmony Accents (Solid Blocks) */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 flex">
                    <div className="flex-1 bg-indigo-600" />
                    <div className="flex-1 bg-teal-500" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.07, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none"
                >
                    <Activity size={600} strokeWidth={0.5} className="text-white" />
                </motion.div>

                <div className="relative z-10 w-full max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-2xl">
                                <Activity className="text-indigo-400 w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tighter">Empyreal</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Healthcare Solutions</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                            Unified Portal for <br />
                            <span className="text-indigo-500">Hospital Staff.</span>
                        </h2>

                        <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-md font-medium">
                            A secure, private platform for Administrators, Doctors, and Receptionists to work together.
                        </p>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                            {[
                                { icon: ShieldCheck, text: "Enterprise Security", color: "text-indigo-400" },
                                { icon: Lock, text: "Data Encryption", color: "text-indigo-400" },
                                { icon: Activity, text: "Live Operations", color: "text-teal-500" },
                                { icon: User, text: "Multi-Role Access", color: "text-teal-500" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${item.color}`}>
                                        <item.icon size={16} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-slate-300 font-bold text-xs uppercase tracking-wide">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Right Side: Login Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[420px] relative z-10"
                >
                    <div className="text-center lg:text-left mb-12">
                        {/* Mobile Logo Only */}
                        <div className="lg:hidden flex items-center justify-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl border border-slate-800">
                                <Activity className="text-indigo-500 w-9 h-9" strokeWidth={2.5} />
                            </div>
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">Staff Login</h3>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">Log in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Server Error Message */}
                        <AnimatePresence>
                            {serverError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-xl flex items-start gap-4">
                                        <div className="bg-rose-500 p-1 rounded-md">
                                            <ShieldAlert className="text-white w-4 h-4 shrink-0" />
                                        </div>
                                        <p className="text-sm font-bold text-rose-700 leading-tight">{serverError}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    User ID or Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <User size={18} strokeWidth={3} />
                                    </div>
                                    <input
                                        type="text"
                                        {...register('email')}
                                        disabled={isSubmitting}
                                        className={`w-full h-14 rounded-xl bg-white border-2 pl-12 pr-4 text-sm font-bold text-slate-900 transition-all outline-none shadow-sm
                                            ${errors.email ? 'border-rose-200 focus:border-rose-500 ring-rose-500/10 focus:ring-4' : 'border-slate-100 group-hover:border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}
                                        `}
                                        placeholder="Enter ID or email"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[11px] font-black text-rose-500 px-1 uppercase tracking-wide">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                        <Lock size={18} strokeWidth={3} />
                                    </div>
                                    <input
                                        type="password"
                                        {...register('password')}
                                        disabled={isSubmitting}
                                        className={`w-full h-14 rounded-xl bg-white border-2 pl-12 pr-4 text-sm font-bold text-slate-900 transition-all outline-none shadow-sm
                                            ${errors.password ? 'border-rose-200 focus:border-rose-500 ring-rose-500/10 focus:ring-4' : 'border-slate-100 group-hover:border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/5'}
                                        `}
                                        placeholder="Enter password"
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-[11px] font-black text-rose-500 px-1 uppercase tracking-wide">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" />
                                <span className="text-xs font-black text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider">Remember me</span>
                            </label>
                            <Link to="/forgot-password" title="Forgot Password" className="text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-[0.1em]">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-15 rounded-xl bg-slate-950 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-950/20 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed group border border-slate-800"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-16 pt-10 border-t border-slate-200 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-4">
                            <ShieldCheck size={12} className="text-slate-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Staff Only</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-xs mx-auto uppercase tracking-tighter">
                            Authorized access only. All actions are recorded for hospital security.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
