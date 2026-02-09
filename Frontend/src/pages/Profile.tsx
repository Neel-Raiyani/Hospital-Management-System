import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Shield, Clock, Lock,
    KeyRound, Eye, EyeOff, CheckCircle,
    User as UserIcon, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogTrigger
} from '../components/ui/Dialog';
import { authService, type StaffUser } from '../api/auth.service';
import { formatDoctorName } from '../utils/nameUtils';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

const Profile: React.FC = () => {
    const { userId } = useParams<{ userId?: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    const [userData, setUserData] = useState<StaffUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const isOwnProfile = !userId || userId === currentUser?.id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await authService.getUserProfile(userId);
                setUserData(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load profile');
                showToast(err.response?.data?.message || 'Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, showToast]);

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
            showToast('Password updated successfully', 'success');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsPasswordDialogOpen(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to update password';
            setPasswordError(msg);
            showToast(msg, 'error');
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader
                    size="md"
                    variant={currentUser?.role === 'RECEPTIONIST' ? 'teal' : 'blue'}
                    text="Loading security context..."
                />
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                <p className="text-gray-500 mb-6">{error || "The profile could not be loaded."}</p>
                <Button onClick={() => window.history.back()} variant="outline" className="rounded-xl">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const isReceptionist = userData.role === 'RECEPTIONIST';
    const isDoctor = userData.role === 'DOCTOR';
    const isAdmin = userData.role === 'ADMIN';

    const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-[#1e293b] text-white border-[#B9D7EA] shadow-sm';
            case 'DOCTOR': return 'bg-[#F7FBFC] text-[#769FCD] border-[#B9D7EA]';
            case 'RECEPTIONIST': return 'bg-teal-50 text-teal-700 border-teal-100 shadow-sm shadow-teal-600/5';
            case 'LAB': return 'bg-[#EEF2FF] text-[#818CF8] border-[#B9D7EA]';
            default: return 'bg-[#F7FBFC] text-[#64748B] border-[#B9D7EA]';
        }
    };

    return (
        <div className="px-8 pb-8 pt-4 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 overflow-hidden">
            {/* Back Navigation */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className={`group flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${isReceptionist ? 'text-teal-600 hover:text-teal-700 hover:bg-teal-50' : 'text-[#64748B] hover:text-[#27374D] hover:bg-[#D6E6F2]'
                        }`}
                >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="font-bold text-xs uppercase tracking-widest">Go Back</span>
                </Button>
            </div>

            {/* Minimal Header */}
            <header className={`bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-6 ${isReceptionist ? 'border-teal-100/50 shadow-teal-600/5' : 'border-[#B9D7EA]'
                }`}>
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0"
                    style={{
                        backgroundColor: isAdmin ? '#1e293b' :
                            isDoctor ? '#769FCD' :
                                isReceptionist ? '#0d9488' : '#818CF8'
                    }}
                >
                    {initials}
                </div>
                <div className="grow">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                            {isDoctor ? formatDoctorName(userData.name) : userData.name}
                        </h1>
                        <Badge className={`${getRoleColor(userData.role)} px-2.5 py-1 font-extrabold text-[10px] tracking-wider rounded-lg border-none`}>
                            {userData.role}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1.5 font-bold">
                            <div className={`w-2 h-2 rounded-full ${isReceptionist ? 'bg-teal-500' : 'bg-[#10B981]'}`} /> Active Status
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                            <Clock size={14} className={isReceptionist ? 'text-teal-400' : 'text-[#94A3B8]'} />
                            Joined: <span className="text-[#1E293B]">{new Date(userData.createdAt).toLocaleDateString()}</span>
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Unified Information Section */}
                <Card className={`shadow-sm rounded-2xl bg-white flex flex-col ${isOwnProfile ? 'md:col-span-8' : 'md:col-span-12'} ${isReceptionist ? 'border-teal-100' : 'border-[#B9D7EA]'
                    }`}>
                    <div className={`p-4 border-b flex items-center gap-2 rounded-t-2xl ${isReceptionist ? 'bg-teal-50/50 border-teal-100' : 'bg-[#F7FBFC] border-[#B9D7EA]'
                        }`}>
                        <UserIcon size={16} className={isReceptionist ? 'text-teal-600' : 'text-[#769FCD]'} />
                        <h2 className="font-extrabold text-sm text-[#1E293B]">Profile Information</h2>
                    </div>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        {userData && (
                            <Tabs defaultValue="personal" className="w-full h-full flex flex-col">
                                <div className={`px-6 pt-4 border-b ${isReceptionist ? 'bg-teal-50/20 border-teal-50' : 'bg-[#F7FBFC]/50 border-[#D6E6F2]'
                                    }`}>
                                    <TabsList className="gap-2 bg-transparent p-0 h-auto justify-start border-none">
                                        <TabsTrigger
                                            value="personal"
                                            className={`data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent px-4 py-2 rounded-t-xl text-xs font-extrabold transition-all ${isReceptionist ? 'data-[state=active]:border-teal-100 data-[state=active]:text-teal-600' : 'data-[state=active]:border-[#B9D7EA]'
                                                }`}
                                        >
                                            <UserIcon size={14} className="mr-2 opacity-70" />
                                            Personal Details
                                        </TabsTrigger>
                                        {(userData.role !== 'ADMIN' && (userData.specialization || userData.experienceYears || userData.opdStartTime || userData.shift)) && (
                                            <TabsTrigger
                                                value="professional"
                                                className={`data-[state=active]:bg-white data-[state=active]:shadow-sm border border-transparent px-4 py-2 rounded-t-xl text-xs font-extrabold transition-all ${isReceptionist ? 'data-[state=active]:border-teal-100 data-[state=active]:text-teal-600' : 'data-[state=active]:border-[#B9D7EA]'
                                                    }`}
                                            >
                                                <Shield size={14} className="mr-2 opacity-70" />
                                                Professional Info
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </div>

                                <div className="p-6 grow">
                                    <TabsContent value="personal" className="m-0 focus-visible:ring-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Email Address</label>
                                                    <div className={`text-sm font-bold break-all p-3 rounded-xl border shadow-sm ${isReceptionist ? 'bg-gray-50 border-teal-50/50 text-teal-900' : 'bg-[#F7FBFC] border-[#F1F5F9] text-[#1E293B]'
                                                        }`}>
                                                        {userData.email}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Phone Number</label>
                                                    <div className={`text-sm font-bold p-3 rounded-xl border shadow-sm ${isReceptionist ? 'bg-gray-50 border-teal-50/50 text-teal-900' : 'bg-[#F7FBFC] border-[#F1F5F9] text-[#1E293B]'
                                                        }`}>
                                                        {userData.phone || 'Not provided'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`flex flex-col items-center justify-center border-l border-dashed pl-8 ${isReceptionist ? 'border-teal-100/50' : 'border-[#B9D7EA]'
                                                }`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isReceptionist ? 'bg-teal-50 text-teal-600' : 'bg-[#F1F5F9] text-[#64748B]'
                                                    }`}>
                                                    <UserIcon size={28} opacity={0.3} />
                                                </div>
                                                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isReceptionist ? 'text-teal-600/70' : 'text-[#94A3B8]'}`}>Registered Account</p>
                                                <p className="text-[11px] text-[#64748B] mt-1 italic text-center">Personal contact details of the staff member.</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="professional" className="m-0 focus-visible:ring-0 h-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                            {userData.role === 'DOCTOR' ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-3 bg-[#F7FBFC] rounded-xl border border-[#F1F5F9]">
                                                        <span className="text-xs text-[#64748B] font-bold uppercase tracking-wide">Specialization</span>
                                                        <Badge className="bg-[#769FCD] text-white hover:bg-[#769FCD] shadow-sm">
                                                            {userData.specialization || 'General Practice'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-[#F7FBFC] rounded-xl border border-[#F1F5F9]">
                                                        <span className="text-xs text-[#64748B] font-bold uppercase tracking-wide">Work Experience</span>
                                                        <span className="font-bold text-sm text-[#1E293B]">{userData.experienceYears || 0} Years</span>
                                                    </div>
                                                    <div className="p-4 bg-[#D6E6F2] rounded-2xl border border-[#DBEAFE] text-center shadow-sm">
                                                        <div className="text-[9px] font-black text-[#769FCD] uppercase tracking-[0.2em] mb-2 opacity-70">OPD Consultation Hours</div>
                                                        <div className="text-lg font-mono font-black text-[#1E40AF]">
                                                            {userData.opdStartTime || '09:00'} — {userData.opdEndTime || '17:00'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (isReceptionist || userData.role === 'LAB') ? (
                                                <div className="space-y-4">
                                                    <div className={`flex justify-between items-center p-3 rounded-xl border ${isReceptionist ? 'bg-gray-50 border-teal-50/50' : 'bg-[#F7FBFC] border-[#F1F5F9]'
                                                        }`}>
                                                        <span className={`text-xs font-extrabold uppercase tracking-wide ${isReceptionist ? 'text-teal-700' : 'text-[#64748B]'}`}>Assigned Shift</span>
                                                        <Badge className={`${isReceptionist ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/10' : 'bg-[#10B981]'} text-white shadow-sm border-none`}>
                                                            {userData.shift || 'General'}
                                                        </Badge>
                                                    </div>
                                                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isReceptionist ? 'bg-teal-50/30 border-teal-100/50' : 'bg-[#ECFDF5] border-[#D1FAE5]'
                                                        }`}>
                                                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${isReceptionist ? 'text-teal-600 border border-teal-50' : 'text-[#10B981]'
                                                            }`}>
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-[11px] font-extrabold uppercase tracking-wider ${isReceptionist ? 'text-teal-800' : 'text-[#065F46]'}`}>Department Posting</h4>
                                                            <p className={`text-xs font-bold ${isReceptionist ? 'text-teal-600/80' : 'text-[#047857]'}`}>
                                                                Assigned to {userData.role === 'LAB' ? 'Diagnostic Unit' : 'Main Registration Desk'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}

                                            <div className={`flex flex-col items-center justify-center border-l border-dashed pl-8 ${isReceptionist ? 'border-teal-100/50' : 'border-[#B9D7EA]'
                                                }`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isReceptionist ? 'bg-teal-50 text-teal-600' : 'bg-[#F1F5F9] text-[#64748B]'
                                                    }`}>
                                                    <Shield size={28} opacity={0.3} />
                                                </div>
                                                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isReceptionist ? 'text-teal-600/70' : 'text-[#94A3B8]'}`}>Verified Role</p>
                                                <p className="text-[11px] text-[#64748B] mt-1 text-center italic">Current professional credentials and active scheduling.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>

                {/* Account Security - Only visible to owner */}
                {isOwnProfile && (
                    <Card className={`md:col-span-4 shadow-sm rounded-2xl bg-white flex flex-col ${isReceptionist ? 'border-teal-100' : 'border-[#B9D7EA]'
                        }`}>
                        <div className={`p-4 border-b flex items-center gap-2 rounded-t-2xl ${isReceptionist ? 'bg-teal-50/50 border-teal-100' : 'bg-[#F7FBFC] border-[#B9D7EA]'
                            }`}>
                            <Shield size={16} className={isReceptionist ? 'text-teal-600' : 'text-[#769FCD]'} />
                            <h2 className="font-extrabold text-sm text-[#1E293B]">Security</h2>
                        </div>
                        <CardContent className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isReceptionist ? 'bg-teal-50 text-teal-600' : 'bg-[#D6E6F2] text-[#769FCD]'
                                }`}>
                                <KeyRound size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-xs text-[#1E293B]">Password Manager</h3>
                                <p className="text-[10px] font-medium text-[#64748B] leading-relaxed">
                                    Update your password regularly.
                                </p>
                            </div>

                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className={`w-full text-white font-extrabold h-10 rounded-xl shadow-md transition-all active:scale-[0.98] text-xs border-none ${isReceptionist ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20' : 'bg-[#769FCD] hover:bg-[#2563EB]'
                                        }`}>
                                        Update Password
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                                    <div className={`p-6 border-b ${isReceptionist ? 'bg-teal-50 border-teal-100' : 'bg-[#F7FBFC] border-[#B9D7EA]'}`}>
                                        <DialogHeader>
                                            <DialogTitle className={`text-xl font-bold ${isReceptionist ? 'text-teal-900' : 'text-[#1E293B]'}`}>Update Password</DialogTitle>
                                            <DialogDescription className="text-xs font-medium text-[#64748B]">
                                                Choose a secure password to protect your account access.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </div>
                                    <div className="p-6">
                                        <form onSubmit={handlePasswordChange} className="space-y-5">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Current Password</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords(!showPasswords)}
                                                        className={`${isReceptionist ? 'text-teal-600 hover:bg-teal-50' : 'text-[#769FCD] hover:bg-[#D6E6F2]'} text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-md transition-colors`}
                                                    >
                                                        {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                                                        {showPasswords ? 'Hide' : 'Show'}
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReceptionist ? 'text-teal-400' : 'text-[#94A3B8]'}`} />
                                                    <Input
                                                        type={showPasswords ? 'text' : 'password'}
                                                        className={`pl-10 h-12 text-sm font-mono rounded-xl focus:ring-4 ${isReceptionist ? 'bg-gray-50 border-teal-100 focus:ring-teal-500/10' : 'bg-[#F7FBFC] border-[#B9D7EA] focus:ring-[#769FCD]/10'}`}
                                                        placeholder="Enter current password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">New Password</label>
                                                    <div className="relative">
                                                        <KeyRound size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReceptionist ? 'text-teal-400' : 'text-[#94A3B8]'}`} />
                                                        <Input
                                                            type={showPasswords ? 'text' : 'password'}
                                                            className={`pl-10 h-12 text-sm font-mono rounded-xl focus:ring-4 ${isReceptionist ? 'bg-gray-50 border-teal-100 focus:ring-teal-500/10' : 'bg-[#F7FBFC] border-[#B9D7EA] focus:ring-[#769FCD]/10'}`}
                                                            placeholder="••••••••"
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Confirm New Password</label>
                                                    <div className="relative">
                                                        <CheckCircle size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isReceptionist ? 'text-teal-400' : 'text-[#94A3B8]'}`} />
                                                        <Input
                                                            type={showPasswords ? 'text' : 'password'}
                                                            className={`pl-10 h-12 text-sm font-mono rounded-xl focus:ring-4 ${isReceptionist ? 'bg-gray-50 border-teal-100 focus:ring-teal-500/10' : 'bg-[#F7FBFC] border-[#B9D7EA] focus:ring-[#769FCD]/10'}`}
                                                            placeholder="••••••••"
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {passwordError && (
                                                <div className="p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-1">
                                                    <AlertCircle size={14} /> {passwordError}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={updatingPassword}
                                                className={`w-full text-white font-black h-12 rounded-xl mt-2 uppercase tracking-widest text-xs border-none shadow-lg transition-all active:scale-[0.98] ${isReceptionist ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20' : 'bg-[#769FCD] hover:bg-[#2563EB] shadow-[#769FCD]/20'}`}
                                            >
                                                {updatingPassword ? (
                                                    <>
                                                        <Loader size="sm" variant={isReceptionist ? 'teal' : 'blue'} className="mr-2" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Update Password'
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isOpen={toast.isOpen}
                onClose={hideToast}
            />
        </div>
    );
};

export default Profile;
