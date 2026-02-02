import React, { useState, useEffect } from 'react';
import {
    UserPlus, Search, Loader2,
    CheckCircle, Copy, Power, MoreHorizontal,
    Stethoscope, Phone, GraduationCap, KeyRound, ChevronLeft, ChevronRight,
    ArrowUpRight, Mail, UserIcon, ShieldCheck, Clock, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, type CreateUserRequest, type CreateUserResponse } from '../../api/auth.service';
import { cn } from '../../lib/utils';

// UI Components
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '../../components/ui/Dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '../../components/ui/AlertDialog';

// ============================================================================
// TYPES
// ============================================================================
type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'LAB';
type UserStatus = 'ACTIVE' | 'INACTIVE';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const StaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialization: '',
        qualification: '',
        experienceYears: 0,
        opdStartTime: '09:00',
        opdEndTime: '17:00',
        phone: '',
        shift: 'MORNING' as 'MORNING' | 'EVENING' | 'NIGHT',
    });
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
    const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

    // Action state
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
    const [userToToggle, setUserToToggle] = useState<StaffMember | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const users = await authService.getUsers();
            setStaff(users.map(u => ({
                id: String(u.id),
                name: u.name,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
            })));
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            specialization: '',
            qualification: '',
            experienceYears: 0,
            opdStartTime: '09:00',
            opdEndTime: '17:00',
            phone: '',
            shift: 'MORNING',
        });
        setSelectedRole('DOCTOR');
        setCreatedCredentials(null);
        setCopiedField(null);
    };

    const isFormDirty = () => {
        return formData.name !== '' || formData.email !== '' || formData.phone !== '' || formData.specialization !== '';
    };

    const handleModalOpenChange = (open: boolean) => {
        if (!open) {
            if (isFormDirty() && !createdCredentials) {
                setIsDiscardConfirmOpen(true);
            } else {
                resetForm();
                setIsModalOpen(false);
            }
        } else {
            setIsModalOpen(true);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const request: CreateUserRequest = {
                name: formData.name,
                email: formData.email,
                role: selectedRole,
                doctorData: selectedRole === 'DOCTOR' ? {
                    specialization: formData.specialization,
                    qualification: formData.qualification,
                    experienceYears: formData.experienceYears,
                    opdStartTime: formData.opdStartTime,
                    opdEndTime: formData.opdEndTime,
                } : undefined,
                receptionistData: selectedRole === 'RECEPTIONIST' ? {
                    phone: formData.phone,
                    shift: formData.shift,
                } : undefined,
                labStaffData: selectedRole === 'LAB' ? {
                    phone: formData.phone,
                    shift: formData.shift,
                } : undefined,
            };

            const response: CreateUserResponse = await authService.createUser(request);
            setCreatedCredentials(response.Credentials);
            await fetchStaff();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async (field: 'email' | 'password', value: string) => {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleToggleStatus = async () => {
        if (!userToToggle) return;

        const action = userToToggle.status === 'ACTIVE' ? 'suspend' : 'restore';
        setTogglingStatus(userToToggle.id);
        setIsConfirmOpen(false);

        try {
            await authService.updateUserStatus(userToToggle.id, userToToggle.status === 'INACTIVE');
            await fetchStaff();
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to ${action} access`);
        } finally {
            setTogglingStatus(null);
            setUserToToggle(null);
        }
    };

    const confirmToggle = (user: StaffMember) => {
        setUserToToggle(user);
        setIsConfirmOpen(true);
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getRoleConfig = (role: UserRole) => {
        const configs: Record<UserRole, { icon: any, color: string, bg: string }> = {
            ADMIN: { icon: ShieldCheck, color: '#DE350B', bg: '#FFEBE6' },
            DOCTOR: { icon: Stethoscope, color: '#0052CC', bg: '#DEEBFF' },
            RECEPTIONIST: { icon: Phone, color: '#00875A', bg: '#E3FCEF' },
            LAB: { icon: GraduationCap, color: '#403294', bg: '#EAE6FF' },
        };
        return configs[role];
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">User Management</h1>
                    <p className="text-[#6B7280] text-sm mt-1">Manage hospital staff accounts</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="h-11 px-6 bg-[#3B82F6] hover:bg-[#2563EB] shadow-md">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] overflow-hidden p-0 rounded-2xl">
                        <DialogHeader className="p-6 bg-[#F9FBFF] border-b border-[#E1E7FF]">
                            <DialogTitle className="text-xl text-[#091E42]">Add New User</DialogTitle>
                            <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
                        </DialogHeader>

                        {createdCredentials ? (
                            <div className="p-8">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center rounded-2xl bg-[#F0FAF5] border border-[#D1F2E1] p-8"
                                >
                                    <div className="w-16 h-16 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#065F46]">User Created</h3>
                                    <p className="text-[#10B981] font-medium mt-1">Copy these details for the user</p>

                                    <div className="mt-8 space-y-4 text-left">
                                        <div className="bg-white p-4 rounded-xl border border-[#D1F2E1] shadow-sm">
                                            <p className="text-[10px] font-bold text-[#065F46] uppercase tracking-[0.1em] mb-2">Email</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-sm text-[#374151]">{createdCredentials.email}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleCopy('email', createdCredentials.email)}
                                                    className={copiedField === 'email' ? 'text-[#10B981]' : ''}
                                                >
                                                    {copiedField === 'email' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-[#D1F2E1] shadow-sm">
                                            <p className="text-[10px] font-bold text-[#065F46] uppercase tracking-[0.1em] mb-2">Password</p>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-sm font-bold text-[#3B82F6]">{createdCredentials.password}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleCopy('password', createdCredentials.password)}
                                                    className={copiedField === 'password' ? 'text-[#10B981]' : ''}
                                                >
                                                    {copiedField === 'password' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-8 h-12 rounded-xl bg-[#065F46] hover:bg-[#044D31]"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </motion.div>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-[#4C5B7A] uppercase tracking-wider">Role</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['DOCTOR', 'RECEPTIONIST', 'LAB'] as UserRole[]).map((role) => {
                                            const active = selectedRole === role;
                                            const conf = getRoleConfig(role);
                                            return (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setSelectedRole(role)}
                                                    className={`
                                                        flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all
                                                        ${active ? 'border-[#3B82F6] bg-[#EFF6FF]' : 'border-[#F3F4F6] bg-white hover:border-[#D1D5DB]'}
                                                    `}
                                                >
                                                    <conf.icon size={18} style={{ color: active ? '#3B82F6' : '#9CA3AF' }} />
                                                    <span className={`text-[10px] font-bold uppercase ${active ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`}>{role}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F3F4F6]">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#4C5B7A]">Display Name</label>
                                        <Input
                                            placeholder="e.g. Dr. Alex Smith"
                                            className="h-10"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[#4C5B7A]">Work Email</label>
                                        <Input
                                            type="email"
                                            placeholder="alex@hospital.com"
                                            className="h-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {selectedRole === 'DOCTOR' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="space-y-4 pt-4 border-t border-[#F3F4F6]"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-[#4C5B7A]">Specialization</label>
                                                    <Input
                                                        placeholder="e.g. Cardiac Surgery"
                                                        className="h-10"
                                                        value={formData.specialization}
                                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-[#4C5B7A]">Qualification</label>
                                                    <Input
                                                        placeholder="e.g. MBBS, MD"
                                                        className="h-10"
                                                        value={formData.qualification}
                                                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-[#4C5B7A]">Exp (Yrs)</label>
                                                    <Input
                                                        type="number"
                                                        className="h-10"
                                                        value={formData.experienceYears}
                                                        onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-[#4C5B7A]">OPD Start</label>
                                                    <Input
                                                        type="time"
                                                        className="h-10 px-2"
                                                        value={formData.opdStartTime}
                                                        onChange={(e) => setFormData({ ...formData, opdStartTime: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-[#4C5B7A]">OPD End</label>
                                                    <Input
                                                        type="time"
                                                        className="h-10 px-2"
                                                        value={formData.opdEndTime}
                                                        onChange={(e) => setFormData({ ...formData, opdEndTime: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(selectedRole === 'RECEPTIONIST' || selectedRole === 'LAB') && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F3F4F6]"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[#4C5B7A]">Mobile Contact</label>
                                                <Input
                                                    placeholder="9100000000"
                                                    className="h-10"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[#4C5B7A]">Assigned Shift</label>
                                                <Select value={formData.shift} onValueChange={(val: any) => setFormData({ ...formData, shift: val })}>
                                                    <SelectTrigger className="h-10 bg-white shadow-none border-[#E2E8F0]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MORNING">Morning (08:00 - 14:00)</SelectItem>
                                                        <SelectItem value="EVENING">Evening (14:00 - 20:00)</SelectItem>
                                                        <SelectItem value="NIGHT">Night (20:00 - 08:00)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="bg-[#FFF9EA] border border-[#FBEFCE] rounded-xl p-3 flex items-start gap-3">
                                    <KeyRound size={16} className="text-[#F59E0B] mt-0.5" />
                                    <div className="text-[11px] leading-relaxed text-[#92400E]">
                                        <strong>Auto-Security:</strong> A temporary password will be generated. The user must change it on first login.
                                    </div>
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/20 font-bold"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create User</span>}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter Bar */}
            <Card className="border-none shadow-sm bg-[#F8FAFC]">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                        <Input
                            placeholder="Find by name or entry email..."
                            className="pl-10 h-11 border-none bg-white shadow-sm ring-offset-[#F8FAFC]"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchStaff}
                        disabled={loading}
                        className="h-11 w-11 bg-white border-none shadow-sm hover:bg-[#F1F5F9] shrink-0"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-[#64748B]", loading && "animate-spin")} />
                    </Button>
                    <Select value={roleFilter} onValueChange={(val: any) => { setRoleFilter(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full md:w-[200px] h-11 bg-white border-none shadow-sm ring-offset-[#F8FAFC]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="DOCTOR">Doctors</SelectItem>
                            <SelectItem value="RECEPTIONIST">Receptionists</SelectItem>
                            <SelectItem value="LAB">Lab Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Staff Table */}
            <Card className="overflow-hidden border-none shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-[#F9FAFB]">
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6] mx-auto mb-4" />
                                    <p className="text-[#64748B] font-medium">Loading users...</p>
                                </TableCell>
                            </TableRow>
                        ) : paginatedStaff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-[#94A3B8]" />
                                    </div>
                                    <p className="text-[#64748B] font-medium">No users found</p>
                                    <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your filters or search terms</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedStaff.map((user) => {
                                const conf = getRoleConfig(user.role);
                                return (
                                    <TableRow key={user.id} className="group transition-all">
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md relative"
                                                    style={{ backgroundColor: conf.color }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                        <conf.icon size={10} style={{ color: conf.color }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors flex items-center gap-1.5">
                                                        {user.name}
                                                        {user.role === 'ADMIN' && <ShieldCheck size={14} className="text-[#3B82F6]" />}
                                                    </p>
                                                    <p className="text-xs font-medium text-[#64748B] flex items-center gap-1 mt-0.5">
                                                        <Mail size={12} />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className="border-none px-3 py-1 font-bold text-[10px] tracking-wider rounded-lg"
                                                style={{ backgroundColor: conf.bg, color: conf.color }}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`} />
                                                <span className={`text-[13px] font-semibold ${user.status === 'ACTIVE' ? 'text-[#059669]' : 'text-[#64748B]'}`}>
                                                    {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-[#64748B]">
                                                <Clock size={14} />
                                                <span className="text-sm font-medium">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-[#F1F5F9] rounded-xl h-10 w-10">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-xl shadow-xl border-[#E2E8F0]">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-[#94A3B8] uppercase px-3 py-2">Options</DropdownMenuLabel>
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium p-3">
                                                        <UserIcon size={16} className="text-[#64748B]" /> View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className={`rounded-lg gap-2 cursor-pointer font-medium p-3 ${user.status === 'ACTIVE' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}
                                                        onClick={() => confirmToggle(user)}
                                                        disabled={togglingStatus === user.id}
                                                    >
                                                        {togglingStatus === user.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Power size={16} />
                                                        )}
                                                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[#F1F5F9]" />
                                                    <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium p-3 text-[#64748B]">
                                                        <ArrowUpRight size={16} /> View History
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="bg-[#F9FAFB] px-8 py-5 flex items-center justify-between border-t border-[#F1F5F9]">
                    <p className="text-sm text-[#64748B] font-medium">
                        Displaying <span className="text-[#1E293B] font-bold">{Math.min(filteredStaff.length, itemsPerPage)}</span> results out of <span className="text-[#1E293B] font-bold">{filteredStaff.length}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl px-4 font-bold border-[#E2E8F0] shadow-sm flex items-center gap-2"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
                                        : 'text-[#64748B] hover:bg-[#E2E8F0]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl px-4 font-bold border-[#E2E8F0] shadow-sm flex items-center gap-2"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {userToToggle?.status === 'ACTIVE' ? 'Deactivate User?' : 'Activate User?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {userToToggle?.status === 'ACTIVE'
                                ? `This will disable ${userToToggle?.name}'s login access. You can enable it again later.`
                                : `This will enable ${userToToggle?.name}'s login access to the system.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold border-[#E2E8F0]">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleStatus();
                            }}
                            disabled={togglingStatus !== null}
                            className={cn(
                                "rounded-xl font-bold shadow-lg min-w-[120px]",
                                userToToggle?.status === 'ACTIVE' ? "bg-[#EF4444] hover:bg-[#DC2626]" : "bg-[#10B981] hover:bg-[#059669]"
                            )}
                        >
                            {togglingStatus !== null ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                userToToggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Discard Changes Confirm */}
            <AlertDialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
                <AlertDialogContent className="max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved information in the registration form. Closing will lose all entered data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold border-[#E2E8F0]">Keep Editing</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(false);
                                setIsDiscardConfirmOpen(false);
                            }}
                            className="rounded-xl font-bold shadow-lg bg-[#EF4444] hover:bg-[#DC2626]"
                        >
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default StaffManagement;
