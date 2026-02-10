import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus, Search, Loader2,
    Power, MoreHorizontal,
    Stethoscope, Phone, TestTube2, ChevronLeft, ChevronRight,
    ShieldCheck, Clock, Filter, LayoutGrid, List
} from 'lucide-react';
import { authService } from '../../api/auth.service';
import { AddUserDialog } from '../../components/features/admin/AddUserDialog';
import { cn } from '../../utils/cn';

// UI Components
import { Button } from '../../components/ui/Button';
import { formatDoctorName } from '../../utils/nameUtils';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
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
    const navigate = useNavigate();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'table' ? 5 : 8;

    // Action state
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
    const [userToToggle, setUserToToggle] = useState<StaffMember | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const users = await authService.getUsers();
            setStaff(users.map(u => ({
                id: String(u.id),
                name: u.name,
                email: u.email,
                role: u.role,
                status: u.status,
                createdAt: u.createdAt,
                checkupFee: u.checkupFee,
            })));
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setIsLoading(false);
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
        const matchesRole = roleFilter === 'ALL' ? s.role !== 'ADMIN' : s.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Reset to first page when view mode or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, searchQuery, roleFilter]);

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getRoleConfig = (role: UserRole) => {
        const configs: Record<UserRole, { icon: any, color: string, bg: string }> = {
            ADMIN: { icon: ShieldCheck, color: '#27374D', bg: '#DDE6ED' },
            DOCTOR: { icon: Stethoscope, color: '#769FCD', bg: '#F7FBFC' },
            RECEPTIONIST: { icon: Phone, color: '#0EA5E9', bg: '#F0F9FF' },
            LAB: { icon: TestTube2, color: '#818CF8', bg: '#EEF2FF' },
        };
        return configs[role];
    };

    return (
        <div className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">User Management</h1>
                    <p className="text-[#6B7280] text-sm mt-1">Manage hospital staff accounts</p>
                </div>

                <AddUserDialog
                    onSuccess={fetchStaff}
                    trigger={
                        <Button className="h-11 px-6 bg-[#769FCD] hover:bg-[#608FBF] shadow-md font-bold transition-all duration-300">
                            <Plus size={18} className="mr-2" />
                            Add New Staff
                        </Button>
                    }
                />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-11 h-12 bg-white border-[#B9D7EA] rounded-xl focus:ring-4 focus:ring-[#769FCD]/10 focus:border-[#769FCD] transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                        <SelectTrigger className="w-[180px] h-12 bg-white border-[#B9D7EA] rounded-xl font-medium">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-[#64748B]" />
                                <SelectValue placeholder="All Roles" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#B9D7EA] shadow-xl">
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="DOCTOR">Doctors</SelectItem>
                            <SelectItem value="RECEPTIONIST">Receptionists</SelectItem>
                            <SelectItem value="LAB">Lab Staff</SelectItem>
                            <SelectItem value="ADMIN">Administrators</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="bg-white border border-[#B9D7EA] rounded-2xl p-1 flex relative h-12 w-[100px] items-center">
                        <motion.div
                            initial={false}
                            animate={{ x: viewMode === 'table' ? 0 : 44 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute left-1 w-11 h-10 bg-[#D6E6F2] rounded-xl z-0"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-11 w-11 rounded-xl z-10 transition-colors duration-300",
                                viewMode === 'table' ? 'text-[#769FCD]' : 'text-[#64748B] hover:text-[#769FCD]'
                            )}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={20} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-11 w-11 rounded-xl z-10 transition-colors duration-300",
                                viewMode === 'grid' ? 'text-[#769FCD]' : 'text-[#64748B] hover:text-[#769FCD]'
                            )}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={20} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: staff.length, color: '#27374D', bg: '#D6E6F2' },
                    { label: 'Active', value: staff.filter(s => s.status === 'ACTIVE').length, color: '#27374D', bg: '#B9D7EA' },
                    { label: 'Doctors', value: staff.filter(s => s.role === 'DOCTOR').length, color: '#27374D', bg: '#D6E6F2' },
                    { label: 'Suspended', value: staff.filter(s => s.status === 'INACTIVE').length, color: '#27374D', bg: '#F7FBFC' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-black mt-2" style={{ color: stat.color }}>{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content View */}
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {viewMode === 'table' ? (
                    <Card className="border border-[#E2E8F0] shadow-lg overflow-hidden rounded-2xl bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-linear-to-r from-[#27374D] to-[#526D82] hover:from-[#27374D] hover:to-[#526D82]">
                                    <TableHead className="font-semibold text-white/90 h-14 pl-8 text-xs uppercase tracking-wider">Employee</TableHead>
                                    <TableHead className="font-semibold text-white/90 h-14 text-xs uppercase tracking-wider">Department</TableHead>
                                    <TableHead className="font-semibold text-white/90 h-14 text-xs uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="font-semibold text-white/90 h-14 text-xs uppercase tracking-wider">Fee (₹)</TableHead>
                                    <TableHead className="font-semibold text-white/90 h-14 text-xs uppercase tracking-wider">Joined</TableHead>
                                    <TableHead className="h-14 w-20"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center bg-[#FAFBFC]">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#769FCD] to-[#526D82] flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                                </div>
                                                <p className="text-[#64748B] font-medium">Loading staff records...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center bg-[#FAFBFC]">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center">
                                                    <Search size={28} className="text-[#94A3B8]" />
                                                </div>
                                                <div>
                                                    <p className="text-[#1E293B] font-bold text-lg">No staff members found</p>
                                                    <p className="text-[#64748B] text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStaff.map((user, index) => {
                                        const conf = getRoleConfig(user.role);
                                        const RoleIcon = conf.icon;
                                        return (
                                            <TableRow
                                                key={user.id}
                                                className={cn(
                                                    "group transition-all duration-200",
                                                    index % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]",
                                                    "hover:bg-[#F0F7FF] hover:shadow-sm"
                                                )}
                                            >
                                                <TableCell className="pl-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div
                                                                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md ring-2 ring-white"
                                                                style={{ backgroundColor: conf.color }}
                                                            >
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div
                                                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center shadow-sm border-2 border-white"
                                                                style={{ backgroundColor: conf.bg }}
                                                            >
                                                                <RoleIcon size={10} style={{ color: conf.color }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#1E293B] group-hover:text-[#27374D] transition-colors">
                                                                {user.role === 'DOCTOR' ? formatDoctorName(user.name) : user.name}
                                                            </p>
                                                            <p className="text-xs text-[#64748B] mt-0.5 font-medium">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            className="border-none px-3 py-1.5 font-semibold text-[11px] tracking-wide rounded-lg shadow-sm"
                                                            style={{ backgroundColor: conf.bg, color: conf.color }}
                                                        >
                                                            <RoleIcon size={12} className="mr-1.5" />
                                                            {user.role}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                                                        user.status === 'ACTIVE'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    )}>
                                                        <span className={cn(
                                                            "w-2 h-2 rounded-full animate-pulse",
                                                            user.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-400"
                                                        )} />
                                                        {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {user.role === 'DOCTOR' ? `₹${(user as any).checkupFee || 0}` : '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-[#64748B]">
                                                        <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                                                            <Clock size={14} className="text-[#94A3B8]" />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-lg hover:bg-[#27374D]/10 transition-colors"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4 text-[#64748B]" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px] p-1.5 rounded-xl shadow-xl border border-[#E2E8F0]">
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 cursor-pointer font-medium px-3 py-2.5 text-[13px] hover:bg-[#F1F5F9]"
                                                                onClick={() => navigate(`/admin/profile/${user.id}`)}
                                                            >
                                                                <ShieldCheck size={15} className="text-[#64748B]" /> View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-lg gap-2 cursor-pointer font-medium px-3 py-2.5 text-[13px]",
                                                                    user.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                                )}
                                                                onClick={() => confirmToggle(user)}
                                                                disabled={togglingStatus === user.id}
                                                            >
                                                                {togglingStatus === user.id ? (
                                                                    <Loader2 size={15} className="animate-spin" />
                                                                ) : (
                                                                    <Power size={15} />
                                                                )}
                                                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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

                        {/* Professional Pagination */}
                        <div className="bg-linear-to-r from-[#F8FAFC] to-[#F1F5F9] px-8 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
                            <p className="text-sm text-[#64748B]">
                                Showing <span className="font-semibold text-[#27374D]">{paginatedStaff.length}</span> of <span className="font-semibold text-[#27374D]">{filteredStaff.length}</span> staff members
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg px-3 text-sm font-medium border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div className="flex items-center gap-1 bg-white rounded-lg border border-[#E2E8F0] p-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={cn(
                                                "w-8 h-8 rounded-md text-sm font-medium transition-all",
                                                currentPage === i + 1
                                                    ? 'bg-[#27374D] text-white shadow-md'
                                                    : 'text-[#64748B] hover:bg-[#F1F5F9]'
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg px-3 text-sm font-medium border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <Card key={i} className="border border-[#E2E8F0] shadow-md h-52 animate-pulse bg-linear-to-br from-white to-[#F8FAFC] rounded-2xl" />
                                ))
                            ) : paginatedStaff.length === 0 ? (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-md">
                                    <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center">
                                        <Search size={28} className="text-[#94A3B8]" />
                                    </div>
                                    <p className="text-[#1E293B] font-bold text-lg">No staff members found</p>
                                </div>
                            ) : (
                                paginatedStaff.map((user) => {
                                    const conf = getRoleConfig(user.role);
                                    const RoleIcon = conf.icon;
                                    return (
                                        <motion.div
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full"
                                        >
                                            <Card className="border border-[#E2E8F0] shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full flex flex-col">
                                                {/* Colored Header Bar */}
                                                <div
                                                    className="h-2 w-full"
                                                    style={{ backgroundColor: conf.color }}
                                                />
                                                <CardContent className="p-5 flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="relative">
                                                            <div
                                                                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ring-4 ring-white"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${conf.color} 0%, ${conf.color}dd 100%)`
                                                                }}
                                                            >
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div
                                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-md border-2 border-white"
                                                                style={{ backgroundColor: conf.bg }}
                                                            >
                                                                <RoleIcon size={12} style={{ color: conf.color }} />
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-[#F1F5F9]">
                                                                    <MoreHorizontal className="w-4 h-4 text-[#94A3B8]" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-[160px] p-1.5 rounded-xl shadow-xl border border-[#E2E8F0]">
                                                                <DropdownMenuItem className="rounded-lg gap-2 px-3 py-2 text-[13px]" onClick={() => navigate(`/admin/profile/${user.id}`)}>
                                                                    <ShieldCheck size={14} /> Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className={cn("rounded-lg gap-2 px-3 py-2 text-[13px]", user.status === 'ACTIVE' ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50")}
                                                                    onClick={() => confirmToggle(user)}
                                                                >
                                                                    <Power size={14} /> {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="space-y-1 grow">
                                                        <h3 className="font-bold text-[#1E293B] text-base line-clamp-1 group-hover:text-[#27374D] transition-colors">
                                                            {user.role === 'DOCTOR' ? formatDoctorName(user.name) : user.name}
                                                        </h3>
                                                        <p className="text-xs text-[#94A3B8] line-clamp-1 font-medium">{user.email}</p>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                                                        <Badge
                                                            className="border-none px-2.5 py-1 font-semibold text-[10px] tracking-wide rounded-md shadow-sm"
                                                            style={{ backgroundColor: conf.bg, color: conf.color }}
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                        <div className={cn(
                                                            "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold",
                                                            user.status === 'ACTIVE'
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            <span className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                user.status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                                            )} />
                                                            {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </div>
                                                    {user.role === 'DOCTOR' && (
                                                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-teal-700 bg-teal-50/50 p-2 rounded-lg">
                                                            <span>Checkup Fee</span>
                                                            <span>₹{(user as any).checkupFee || 0}</span>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>

                        {/* Professional Pagination for Grid */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border border-[#E2E8F0] rounded-xl shadow-md">
                            <p className="text-sm text-[#64748B]">
                                Showing <span className="font-semibold text-[#27374D]">{paginatedStaff.length}</span> of <span className="font-semibold text-[#27374D]">{filteredStaff.length}</span> staff members
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg px-3 text-sm font-medium border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div className="flex items-center gap-1 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={cn(
                                                "w-8 h-8 rounded-md text-sm font-medium transition-all",
                                                currentPage === i + 1
                                                    ? 'bg-[#27374D] text-white shadow-md'
                                                    : 'text-[#64748B] hover:bg-white'
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg px-3 text-sm font-medium border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="max-w-[400px] rounded-2xl border-none shadow-2xl p-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-[#1E293B]">
                            {userToToggle?.status === 'ACTIVE' ? 'Deactivate User?' : 'Activate User?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#64748B] mt-2">
                            {userToToggle?.status === 'ACTIVE'
                                ? `This will disable ${userToToggle?.name}'s login access. You can enable it again later.`
                                : `This will enable ${userToToggle?.name}'s login access to the system.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-11 px-6 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleToggleStatus();
                            }}
                            disabled={togglingStatus !== null}
                            className={cn(
                                "h-11 px-6 rounded-xl font-bold shadow-lg min-w-[120px]",
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
        </div>
    );
};

export default StaffManagement;
