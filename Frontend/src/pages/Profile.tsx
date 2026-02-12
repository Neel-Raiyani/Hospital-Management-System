import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Lock, KeyRound, CheckCircle, Mail, ArrowLeft,
    Stethoscope, Phone, Calendar, Clock, Award,
    Briefcase, CreditCard, AlertCircle, Pencil,
    ShieldCheck
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Loader } from '../components/ui/Loader';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { authService, type StaffUser } from '../api/auth.service';
import { formatDoctorName } from '../utils/nameUtils';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/cn';
import { AddUserDialog } from '../components/features/admin/AddUserDialog';

// ============================================================================
// PROFILE PAGE — Modern, Clean, Professional
// ============================================================================
const Profile: React.FC = () => {
    const { userId } = useParams<{ userId?: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [userData, setUserData] = useState<StaffUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit dialog state
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const isOwnProfile = !userId || userId === currentUser?.id;
    const isAdmin = currentUser?.role === 'ADMIN';

    // Smooth stagger animations
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06, delayChildren: 0.08 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 120, damping: 22, mass: 0.8 }
        }
    };

    const fetchProfile = async (quiet = false) => {
        try {
            if (!quiet) setLoading(true);
            const data = await authService.getUserProfile(userId);
            setUserData(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
            toast.error(err.response?.data?.message || 'Failed to load profile');
        } finally {
            if (!quiet) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            setUpdatingPassword(true);
            await authService.changePassword({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsPasswordDialogOpen(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to update password';
            setPasswordError(msg);
            toast.error(msg);
        } finally {
            setUpdatingPassword(false);
        }
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader size="lg" variant="indigo" text="Loading Profile..." />
            </div>
        );
    }

    // ── Error State ──
    if (error || !userData) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center"
                >
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mx-auto mb-4 border border-rose-100">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-sm text-gray-500 mb-6">{error || "Could not load this profile."}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full h-11 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        Go Back
                    </button>
                </motion.div>
            </div>
        );
    }

    const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const isDoctor = userData.role === 'DOCTOR';

    // Build info fields based on role
    const infoFields: { label: string; value: string; icon: any }[] = [
        { label: 'Email', value: userData.email, icon: Mail },
        { label: 'Phone', value: userData.phone || 'Not provided', icon: Phone },
        {
            label: 'Joined',
            value: new Date(userData.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            icon: Calendar
        },
        { label: 'Status', value: userData.status === 'ACTIVE' ? 'Active' : 'Inactive', icon: ShieldCheck },
    ];

    // Doctor-specific fields
    const doctorFields: { label: string; value: string; icon: any }[] = isDoctor ? [
        { label: 'Specialization', value: userData.specialization || 'General', icon: Stethoscope },
        { label: 'Qualification', value: userData.qualification || 'Not specified', icon: Award },
        { label: 'Experience', value: userData.experienceYears ? `${userData.experienceYears} years` : 'Not specified', icon: Briefcase },
        { label: 'Checkup Fee', value: userData.checkupFee ? `₹${userData.checkupFee}` : 'Not set', icon: CreditCard },
        { label: 'OPD Start', value: userData.opdStartTime || 'Not set', icon: Clock },
        { label: 'OPD End', value: userData.opdEndTime || 'Not set', icon: Clock },
    ] : [];

    // Receptionist/Lab fields
    const staffFields: { label: string; value: string; icon: any }[] = !isDoctor && userData.role !== 'ADMIN' ? [
        { label: 'Shift', value: userData.shift || 'Not assigned', icon: Clock },
    ] : [];

    const allFields = [...infoFields, ...doctorFields, ...staffFields];

    const getRoleBadgeStyle = () => {
        switch (userData.role) {
            case 'DOCTOR': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'RECEPTIONIST': return 'bg-gray-50 text-gray-700 border-gray-200';
            case 'LAB': return 'bg-violet-50 text-violet-700 border-violet-100';
            case 'ADMIN': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-[calc(100vh-100px)] flex flex-col px-6 py-4 max-w-[1200px] mx-auto overflow-hidden font-['Inter',sans-serif]"
        >
            {/* ── Header ── */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-90 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isOwnProfile ? 'Your account details' : `Viewing ${userData.name}'s profile`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwnProfile && (
                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.97] shadow-sm">
                                    <Lock size={14} />
                                    Change Password
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[420px] w-full max-h-[90vh] rounded-lg p-0 border-none shadow-2xl bg-transparent [&>button]:hidden flex flex-col">
                                <div className="bg-white rounded-lg overflow-hidden flex flex-col h-full font-['Inter',sans-serif]">
                                    {/* Fixed Header */}
                                    <div className="p-6 border-b border-gray-100/80 bg-white shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                                                <Lock className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Security Settings</h3>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">Update your account password</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content area */}
                                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
                                        <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-500 px-1 uppercase tracking-wider">Current Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                    <Input
                                                        type="password"
                                                        className="h-11 pl-11 rounded-lg bg-white border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 transition-all"
                                                        placeholder="Enter current password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-500 px-1 uppercase tracking-wider">New Password</label>
                                                <div className="relative group">
                                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                    <Input
                                                        type="password"
                                                        className="h-11 pl-11 rounded-lg bg-white border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                                        placeholder="Minimum 6 characters"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-500 px-1 uppercase tracking-wider">Confirm Password</label>
                                                <div className="relative group">
                                                    <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                                    <Input
                                                        type="password"
                                                        className="h-11 pl-11 rounded-lg bg-white border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                                        placeholder="Repeat new password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {passwordError && (
                                                <div className="p-3 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 flex items-center gap-2 uppercase tracking-wide">
                                                    <AlertCircle size={14} /> {passwordError}
                                                </div>
                                            )}
                                        </form>
                                    </div>

                                    {/* Fixed Footer */}
                                    <div className="p-6 border-t border-gray-100/80 bg-white shrink-0">
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsPasswordDialogOpen(false)}
                                                className="flex-1 h-11 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                form="password-form"
                                                disabled={updatingPassword}
                                                className="flex-1 h-11 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-[0.97] transition-all disabled:opacity-50 hover:bg-indigo-700"
                                            >
                                                {updatingPassword ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {(isOwnProfile || isAdmin) && (
                        <>
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.97] transition-all hover:bg-indigo-700"
                            >
                                <Pencil size={14} />
                                Edit Details
                            </button>
                            <AddUserDialog
                                open={isEditOpen}
                                onOpenChange={(open) => {
                                    setIsEditOpen(open);
                                }}
                                userToEdit={userData as any}
                                onSuccess={() => {
                                    fetchProfile(true);
                                    setIsEditOpen(false);
                                }}
                            />
                        </>
                    )}
                </div>
            </motion.div>

            {/* ── Main Content — Scrollable ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* ── Hero Card ── */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mb-5"
                >
                    <div className="relative">
                        {/* Gradient banner */}
                        <div className="h-28 bg-linear-to-br from-indigo-600 via-indigo-500 to-violet-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
                            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                        </div>

                        {/* Avatar overlapping banner */}
                        <div className="absolute left-8 -bottom-10">
                            <div className="w-20 h-20 rounded-lg bg-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-600/30 border-4 border-white">
                                {initials}
                            </div>
                        </div>
                    </div>

                    <div className="pt-14 pb-6 px-8 flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {isDoctor ? formatDoctorName(userData.name) : userData.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">{userData.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border",
                                getRoleBadgeStyle()
                            )}>
                                {userData.role}
                            </span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border",
                                userData.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                            )}>
                                {userData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ── Details Grid ── */}
                <motion.div variants={itemVariants}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                        {isDoctor ? 'Personal & Clinical Details' : 'Account Details'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allFields.map((field, i) => {
                            const Icon = field.icon;
                            const isStatus = field.label === 'Status';
                            return (
                                <motion.div
                                    key={field.label}
                                    variants={itemVariants}
                                    whileHover={{ y: -2 }}
                                    className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0 group-hover:bg-indigo-100 transition-colors">
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</p>
                                        <p className={cn(
                                            "text-sm font-semibold text-gray-900 truncate mt-0.5",
                                            isStatus && userData.status === 'ACTIVE' && 'text-emerald-600',
                                            isStatus && userData.status === 'INACTIVE' && 'text-rose-600',
                                        )}>
                                            {field.value}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── OPD Hours Highlight (Doctor only) ── */}
                {isDoctor && (userData.opdStartTime || userData.opdEndTime) && (
                    <motion.div variants={itemVariants} className="mt-5">
                        <div className="bg-linear-to-br from-indigo-600 to-violet-600 rounded-lg p-6 shadow-xl shadow-indigo-600/15 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">OPD Hours</p>
                                    <div className="text-3xl font-black text-white tracking-wider flex items-center gap-3">
                                        {userData.opdStartTime || '—'}
                                        <div className="h-0.5 w-6 bg-white/30 rounded-full" />
                                        {userData.opdEndTime || '—'}
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                                    <Clock size={28} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Bottom spacer */}
                <div className="h-4" />
            </div>
        </motion.div>
    );
};

export default Profile;
