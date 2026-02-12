import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    Plus, Search,
    Power, MoreHorizontal,
    Stethoscope, Phone, TestTube2, ChevronLeft, ChevronRight,
    ShieldCheck, Clock, Filter, LayoutGrid, List,
    Users, User as UserIcon
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import { authService } from '../../api/auth.service';
import { AddUserDialog } from '../../components/features/admin/AddUserDialog';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

// UI Components
import { formatDoctorName } from '../../utils/nameUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent
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
    // Doctor fields
    specialization?: string | null;
    qualification?: string | null;
    experienceYears?: number | null;
    opdStartTime?: string | null;
    opdEndTime?: string | null;
    checkupFee?: number | null;
    // Receptionist/Lab fields
    phone?: string | null;
    shift?: string | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const StaffManagement: React.FC = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'table' ? 5 : 8;

    // Action state
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
    const [userToToggle, setUserToToggle] = useState<StaffMember | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<StaffMember | null>(null);

    const fetchStaff = async (quiet = false) => {
        if (!quiet) setIsLoading(true);
        try {
            const users = await authService.getUsers();
            setStaff(users.map(u => ({
                id: String(u.id),
                name: u.name,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                specialization: u.specialization,
                qualification: u.qualification,
                experienceYears: u.experienceYears,
                opdStartTime: u.opdStartTime,
                opdEndTime: u.opdEndTime,
                checkupFee: u.checkupFee,
                phone: u.phone,
                shift: u.shift,
            })));
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            if (!quiet) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleToggleStatus = async () => {
        if (!userToToggle) return;

        const action = userToToggle.status === 'ACTIVE' ? 'suspend' : 'restore';
        setTogglingStatus(userToToggle.id);
        setIsConfirmOpen(false);

        try {
            await authService.updateUserStatus(userToToggle.id, userToToggle.status === 'INACTIVE');
            toast.success(`Access for ${userToToggle.name} ${userToToggle.status === 'ACTIVE' ? 'suspended' : 'restored'} successfully`);
            await fetchStaff(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action} access`);
        } finally {
            setTogglingStatus(null);
            setUserToToggle(null);
        }
    };

    const confirmToggle = (user: StaffMember) => {
        setUserToToggle(user);
        setIsConfirmOpen(true);
    };

    const handleEdit = (user: StaffMember) => {
        setUserToEdit(user);
        setIsEditOpen(true);
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' ? s.role !== 'ADMIN' : s.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' ? true : s.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Reset to first page when view mode or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, searchQuery, roleFilter, statusFilter]);

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getRoleConfig = (role: UserRole) => {
        const configs: Record<UserRole, { icon: any, color: string, bg: string }> = {
            ADMIN: { icon: ShieldCheck, color: '#334155', bg: '#F8FAFC' },
            DOCTOR: { icon: Stethoscope, color: '#4F46E5', bg: '#EEF2FF' },
            RECEPTIONIST: { icon: Phone, color: '#4B5563', bg: '#F9FAFB' },
            LAB: { icon: TestTube2, color: '#7C3AED', bg: '#F5F3FF' },
        };
        return configs[role];
    };

    // Premium Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 8, scale: 0.99 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 120,
                damping: 24,
                mass: 0.8
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.15 }
        }
    };

    const pageEasing = [0.4, 0, 0.2, 1] as const;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 font-['Inter',sans-serif] overflow-x-hidden overflow-y-clip"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">User Management</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Manage hospital staff accounts and access levels
                    </p>
                </div>

                <AddUserDialog
                    onSuccess={() => {
                        fetchStaff(true);
                        setUserToEdit(null);
                    }}
                    trigger={
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all active:scale-95 text-sm">
                            <Plus size={18} />
                            Add New Staff
                        </button>
                    }
                />

                {/* Edit Dialog - Hidden Trigger */}
                <AddUserDialog
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setUserToEdit(null);
                    }}
                    userToEdit={userToEdit as any}
                    onSuccess={() => {
                        fetchStaff(true);
                        setIsEditOpen(false);
                        setUserToEdit(null);
                    }}
                />
            </motion.div>

            {/* Filters and Search Bar */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <Search className="text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors duration-200" />
                        <div className="w-px h-4 bg-gray-300 group-focus-within:bg-indigo-200 transition-colors hidden sm:block" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-[38px] bg-gray-50/50 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all duration-200"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-50/50 px-3 h-[38px] rounded-lg border border-gray-400">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">Filter By</span>
                        <div className="w-px h-4 bg-gray-300" />
                        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                            <SelectTrigger className="border-none bg-transparent hover:bg-white/50 h-8 font-black text-gray-900 focus:ring-0 focus:ring-offset-0 transition-all px-2 min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-indigo-600" />
                                    <SelectValue placeholder="All Roles" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="border-gray-400 rounded-lg shadow-xl">
                                <SelectItem value="ALL" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">All Roles</SelectItem>
                                <SelectItem value="DOCTOR" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">Doctors</SelectItem>
                                <SelectItem value="RECEPTIONIST" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">Receptionists</SelectItem>
                                <SelectItem value="LAB" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">Lab Staff</SelectItem>
                                <SelectItem value="ADMIN" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">Administrators</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 px-3 h-[38px] rounded-lg border border-gray-400">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">Status</span>
                        <div className="w-px h-4 bg-gray-300" />
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="border-none bg-transparent hover:bg-white/50 h-8 font-black text-gray-900 focus:ring-0 focus:ring-offset-0 transition-all px-2 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        statusFilter === 'ALL' ? "bg-gray-400" : statusFilter === 'ACTIVE' ? "bg-indigo-500" : "bg-rose-500"
                                    )} />
                                    <SelectValue placeholder="All Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="border-gray-400 rounded-lg shadow-xl">
                                <SelectItem value="ALL" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-xs">All Status</SelectItem>
                                <SelectItem value="ACTIVE" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-xs">Active Only</SelectItem>
                                <SelectItem value="INACTIVE" className="font-bold py-2.5 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer text-xs">Inactive Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-10 px-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2.5 shadow-sm">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-indigo-800 uppercase tracking-widest">
                            {filteredStaff.length} Results
                        </span>
                    </div>

                    <div className="bg-gray-50/50 border border-gray-400 rounded-lg p-1 flex relative h-[38px] w-[80px] items-center">
                        <motion.div
                            initial={false}
                            animate={{ x: viewMode === 'table' ? 0 : 34 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute left-1 w-8 h-7 bg-white shadow-sm border border-gray-200 rounded-md z-0"
                        />
                        <button
                            className={cn(
                                "h-7 w-8 rounded-md z-10 flex items-center justify-center transition-colors duration-300",
                                viewMode === 'table' ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                            )}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={18} />
                        </button>
                        <button
                            className={cn(
                                "h-7 w-8 rounded-md z-10 flex items-center justify-center transition-colors duration-300",
                                viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                            )}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: staff.length, color: '#4F46E5', bg: 'bg-indigo-50 border-indigo-100' },
                    { label: 'Active', value: staff.filter(s => s.status === 'ACTIVE').length, color: '#6366F1', bg: 'bg-indigo-50/50 border-indigo-100' },
                    { label: 'Doctors', value: staff.filter(s => s.role === 'DOCTOR').length, color: '#818CF8', bg: 'bg-indigo-50/30 border-indigo-100' },
                    { label: 'Suspended', value: staff.filter(s => s.status === 'INACTIVE').length, color: '#F43F5E', bg: 'bg-rose-50 border-rose-100' },
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -2 }} className={cn("p-4 rounded-lg border shadow-sm transition-all hover:shadow-md", stat.bg)}>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</h3>
                    </motion.div>
                ))}
            </motion.div>

            {/* Content View with AnimatePresence */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-400 min-h-[500px] flex flex-col items-center justify-center overflow-hidden"
                    >
                        <Loader size="lg" variant="indigo" text="Loading Records..." />
                    </motion.div>
                ) : (
                    <motion.div
                        key={viewMode}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.4, ease: pageEasing }}
                        className="overflow-hidden"
                    >
                        {viewMode === 'table' ? (
                            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-400 min-h-[500px] flex flex-col">
                                {paginatedStaff.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center px-4 grow">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 border border-gray-200">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No staff found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Try adjusting your search or filters to find what you're looking for.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto grow">
                                        <table className="w-full text-center border-collapse">
                                            <thead>
                                                <tr className="bg-indigo-600 border-b border-gray-400">
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap border-r border-gray-200 text-left">
                                                        Employee
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                                            Department
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                                            Status
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Users className="w-4 h-4 text-indigo-600" />
                                                            Fee
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Clock className="w-4 h-4 text-indigo-600" />
                                                            Joined
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-wider whitespace-nowrap">Actions</th>
                                                </tr>
                                            </thead>
                                            <motion.tbody
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                {paginatedStaff.map((user) => {
                                                    const conf = getRoleConfig(user.role);
                                                    return (
                                                        <motion.tr
                                                            key={user.id}
                                                            variants={itemVariants}
                                                            className="hover:bg-indigo-50/20 transition-colors group border-b border-gray-200"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 text-left">
                                                                <div className="flex items-center gap-3">
                                                                    <div>
                                                                        <p className="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                                            {user.role === 'DOCTOR' ? formatDoctorName(user.name) : user.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="flex justify-center">
                                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border border-current" style={{ backgroundColor: conf.bg, color: conf.color }}>
                                                                        {user.role}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="flex justify-center">
                                                                    <span className={cn(
                                                                        "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block border",
                                                                        user.status === 'ACTIVE'
                                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                    )}>
                                                                        {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="text-sm font-black text-gray-900">
                                                                    {user.role === 'DOCTOR' ? `₹${user.checkupFee || 0}` : 'N/A'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="text-sm font-black text-gray-700">
                                                                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex justify-center">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                                                <MoreHorizontal className="w-4 h-4 text-gray-900" />
                                                                            </button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-[180px] p-1 border-gray-200 shadow-xl rounded-lg">
                                                                            <DropdownMenuItem
                                                                                className="rounded-md gap-2 cursor-pointer font-bold text-xs py-2 hover:bg-gray-50"
                                                                                onClick={() => handleEdit(user)}
                                                                            >
                                                                                <ShieldCheck size={14} className="text-indigo-600" /> Edit Profile
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className="rounded-md gap-2 cursor-pointer font-bold text-xs py-2 hover:bg-gray-50"
                                                                                onClick={() => navigate(`/admin/profile/${user.id}`)}
                                                                            >
                                                                                <UserIcon size={14} className="text-gray-400" /> View Profile
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                className={cn(
                                                                                    "rounded-md gap-2 cursor-pointer font-bold text-xs py-2",
                                                                                    user.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                                                )}
                                                                                onClick={() => confirmToggle(user)}
                                                                                disabled={togglingStatus === user.id}
                                                                            >
                                                                                {togglingStatus === user.id ? (
                                                                                    <Loader size="sm" variant="indigo" text="" />
                                                                                ) : (
                                                                                    <Power size={14} />
                                                                                )}
                                                                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </motion.tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {!isLoading && filteredStaff.length > 0 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-400 mt-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="text-sm text-gray-600 font-black">
                                            Showing <span className="font-black text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-black text-gray-900">{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</span> of <span className="font-black text-gray-900">{filteredStaff.length}</span> members
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <div className="flex items-center gap-1.5">
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-lg text-sm font-black transition-all shadow-sm border",
                                                            currentPage === i + 1
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-white border-gray-400 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                                >
                                    {paginatedStaff.length === 0 ? (
                                        <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-lg border border-gray-400 shadow-sm">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-200">
                                                <Users size={28} />
                                            </div>
                                            <p className="text-gray-900 font-bold text-lg">No staff members found</p>
                                        </div>
                                    ) : (
                                        paginatedStaff.map((user) => {
                                            const conf = getRoleConfig(user.role);
                                            return (
                                                <motion.div
                                                    key={user.id}
                                                    layout
                                                    variants={itemVariants}
                                                    whileHover={{ y: -4 }}
                                                    className="h-full"
                                                >
                                                    <div className="bg-white border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                                                        <div className="h-1.5 w-full" style={{ backgroundColor: conf.color }} />
                                                        <div className="p-4 flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                                    <UserIcon size={20} />
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                                                                            <MoreHorizontal className="w-4 h-4 text-gray-900" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-[160px] p-1 border-gray-200 shadow-xl rounded-lg">
                                                                        <DropdownMenuItem className="rounded-md font-bold text-xs py-2" onClick={() => handleEdit(user)}>
                                                                            Edit Profile
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="rounded-md font-bold text-xs py-2" onClick={() => navigate(`/admin/profile/${user.id}`)}>
                                                                            View Profile
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className={cn("rounded-md font-bold text-xs py-2", user.status === 'ACTIVE' ? "text-rose-600" : "text-emerald-600")}
                                                                            onClick={() => confirmToggle(user)}
                                                                        >
                                                                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>

                                                            <div className="space-y-1 grow">
                                                                <h3 className="font-black text-gray-900 text-sm line-clamp-1">
                                                                    {user.role === 'DOCTOR' ? formatDoctorName(user.name) : user.name}
                                                                </h3>
                                                                <p className="text-[10px] text-gray-500 font-bold line-clamp-1">{user.email}</p>
                                                                <p className="text-[10px] text-indigo-600 font-bold mt-1">
                                                                    Fee: {user.role === 'DOCTOR' ? `₹${user.checkupFee || 0}` : 'N/A'}
                                                                </p>
                                                            </div>

                                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-current" style={{ backgroundColor: conf.bg, color: conf.color }}>
                                                                    {user.role}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                                    user.status === 'ACTIVE'
                                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                                )}>
                                                                    {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </motion.div>

                                {/* Pagination for Grid */}
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border border-gray-400 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600 font-black">
                                        Showing <span className="font-black text-gray-900">{paginatedStaff.length}</span> of <span className="font-black text-gray-900">{filteredStaff.length}</span> members
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={cn(
                                                        "w-9 h-9 rounded-lg text-sm font-black transition-all shadow-sm border",
                                                        currentPage === i + 1
                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                            : 'bg-white border-gray-400 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                                                    )}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 bg-white border border-gray-400 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="max-w-[450px] rounded-lg p-0 border-none shadow-2xl bg-transparent [&>button]:hidden">
                    <div className="bg-white rounded-lg p-6 font-['Inter',sans-serif]">
                        <div className={cn(
                            "flex items-center gap-3 mb-6 p-4 rounded-xl border",
                            userToToggle?.status === 'ACTIVE'
                                ? "bg-rose-50/50 border-rose-100/50"
                                : "bg-indigo-50/50 border-indigo-100/50"
                        )}>
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border",
                                userToToggle?.status === 'ACTIVE'
                                    ? "bg-rose-100 text-rose-600 border-rose-200"
                                    : "bg-indigo-100 text-indigo-600 border-indigo-200"
                            )}>
                                <Power className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">
                                    {userToToggle?.status === 'ACTIVE' ? 'Deactivate Staff' : 'Restore Staff Access'}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">Status Change Confirmation</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed px-1">
                                {userToToggle?.status === 'ACTIVE'
                                    ? <>Are you sure you want to deactivate <span className="font-bold text-gray-900">{userToToggle?.name}</span>? This will temporarily disable their system login and access permissions.</>
                                    : <>You are about to restore system access for <span className="font-bold text-gray-900">{userToToggle?.name}</span>. They will be able to log in and perform their duties immediately.</>}
                            </p>

                            <div className="flex gap-3 pt-4">
                                <AlertDialogCancel className="flex-1 h-11 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all tracking-wide uppercase active:scale-[0.98]">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleToggleStatus();
                                    }}
                                    disabled={togglingStatus !== null}
                                    className={cn(
                                        "flex-1 h-11 px-4 text-white rounded-lg text-sm font-bold transition-all shadow-lg tracking-wide uppercase active:scale-[0.98]",
                                        userToToggle?.status === 'ACTIVE'
                                            ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                                    )}
                                >
                                    {togglingStatus !== null ? (
                                        <div className="flex items-center gap-2">
                                            <Loader size="sm" variant="indigo" text="" />
                                            Updating...
                                        </div>
                                    ) : (
                                        'Confirm'
                                    )}
                                </AlertDialogAction>
                            </div>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
};

export default StaffManagement;
