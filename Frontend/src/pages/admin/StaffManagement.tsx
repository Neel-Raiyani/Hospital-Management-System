import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Loader2,
    Power, MoreHorizontal,
    Stethoscope, Phone, GraduationCap, ChevronLeft, ChevronRight,
    ShieldCheck, Clock, Filter, LayoutGrid, List
} from 'lucide-react';
import { authService } from '../../api/auth.service';
import { AddUserDialog } from '../../components/admin/AddUserDialog';
import { cn } from '../../lib/utils';

// UI Components
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Card, CardContent } from '../../components/ui/Card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger
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
    const itemsPerPage = 8;

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
            ADMIN: { icon: ShieldCheck, color: '#1E293B', bg: '#D6E6F2' },
            DOCTOR: { icon: Stethoscope, color: '#769FCD', bg: '#F7FBFC' },
            RECEPTIONIST: { icon: Phone, color: '#769FCD', bg: '#D6E6F2' },
            LAB: { icon: GraduationCap, color: '#475569', bg: '#B9D7EA' },
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

                    <div className="bg-white border border-[#B9D7EA] rounded-xl p-1 flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-10 w-10 rounded-lg ${viewMode === 'table' ? 'bg-[#D6E6F2] text-[#769FCD]' : 'text-[#64748B]'}`}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-10 w-10 rounded-lg ${viewMode === 'grid' ? 'bg-[#D6E6F2] text-[#769FCD]' : 'text-[#64748B]'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: staff.length, color: '#769FCD', bg: '#D6E6F2' },
                    { label: 'Active', value: staff.filter(s => s.status === 'ACTIVE').length, color: '#769FCD', bg: '#B9D7EA' },
                    { label: 'Doctors', value: staff.filter(s => s.role === 'DOCTOR').length, color: '#769FCD', bg: '#D6E6F2' },
                    { label: 'Suspended', value: staff.filter(s => s.status === 'INACTIVE').length, color: '#B9D7EA', bg: '#F7FBFC' },
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
            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#F7FBFC]">
                        <TableRow>
                            <TableHead className="font-bold text-[#475569] h-14 pl-8">Name & Contact</TableHead>
                            <TableHead className="font-bold text-[#475569] h-14">Role</TableHead>
                            <TableHead className="font-bold text-[#475569] h-14">Status</TableHead>
                            <TableHead className="font-bold text-[#475569] h-14">Registered</TableHead>
                            <TableHead className="h-14 w-20"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#769FCD]" />
                                        <p className="text-[#64748B] font-medium">Loading user data...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedStaff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-[#F7FBFC] rounded-2xl flex items-center justify-center text-[#94A3B8]">
                                            <Search size={32} />
                                        </div>
                                        <div>
                                            <p className="text-[#1E293B] font-bold">No users found</p>
                                            <p className="text-[#64748B] text-sm mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedStaff.map((user) => {
                                const conf = getRoleConfig(user.role);
                                return (
                                    <TableRow key={user.id} className="group hover:bg-[#F7FBFC] transition-colors">
                                        <TableCell className="pl-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: conf.color }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1E293B] group-hover:text-[#769FCD] transition-colors">{user.name}</p>
                                                    <p className="text-xs text-[#64748B] mt-0.5">{user.email}</p>
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
                                                    <Button variant="ghost" size="icon" className="hover:bg-[#D6E6F2] rounded-xl h-10 w-10">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-xl shadow-xl border-[#B9D7EA]">
                                                    <DropdownMenuLabel className="text-[10px] font-bold text-[#94A3B8] uppercase px-3 py-2">Options</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-lg gap-2 cursor-pointer font-medium p-3 hover:bg-[#D6E6F2]"
                                                        onClick={() => navigate(`/admin/profile/${user.id}`)}
                                                    >
                                                        <ShieldCheck size={16} className="text-[#64748B]" /> View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className={`rounded-lg gap-2 cursor-pointer font-medium p-3 ${user.status === 'ACTIVE' ? 'text-[#EF4444] hover:bg-red-50' : 'text-[#10B981] hover:bg-green-50'}`}
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
                <div className="bg-[#F7FBFC] px-8 py-5 flex items-center justify-between border-t border-[#B9D7EA]">
                    <p className="text-sm text-[#64748B] font-medium">
                        Displaying <span className="text-[#1E293B] font-bold">{Math.min(filteredStaff.length, itemsPerPage)}</span> results out of <span className="text-[#1E293B] font-bold">{filteredStaff.length}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-xl px-4 font-bold border-[#B9D7EA] shadow-sm flex items-center gap-2"
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
                                        ? 'bg-[#769FCD] text-white shadow-lg shadow-[#769FCD]/30'
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
                            className="h-10 rounded-xl px-4 font-bold border-[#B9D7EA] shadow-sm flex items-center gap-2"
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
