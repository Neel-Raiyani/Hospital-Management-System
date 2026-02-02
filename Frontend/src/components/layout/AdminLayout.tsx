import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Settings, LogOut,
    ChevronLeft, Bell, Search, User,
    ShieldCheck, Activity, HelpCircle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../../components/ui/DropdownMenu';
import { Button } from '../../components/ui/Button';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/settings', label: 'System Settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="bg-white border-r border-[#E2E8F0] flex flex-col relative z-20"
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <ShieldCheck className="text-white w-5 h-5" />
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-bold text-lg text-[#1E293B] whitespace-nowrap"
                                >
                                    Empyreal <span className="text-[#3B82F6]">Admin</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                    isActive
                                        ? "bg-[#EFF6FF] text-[#3B82F6]"
                                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#3B82F6]" : "text-[#94A3B8]")} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-semibold text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {isActive && !isSidebarOpen && (
                                    <div className="absolute left-0 w-1 h-6 bg-[#3B82F6] rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-[#F1F5F9]">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                    >
                        <motion.div
                            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.div>
                        {isSidebarOpen && <span className="font-semibold text-sm">Collapse Menu</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Global Search..."
                                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3B82F6]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative text-[#64748B] hover:bg-[#F8FAFC] rounded-xl">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
                        </Button>

                        <div className="h-8 w-px bg-[#E2E8F0] mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-[#F8FAFC] transition-colors group">
                                    <div className="w-9 h-9 bg-gradient-to-tr from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
                                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-bold text-[#1E293B] leading-none mb-0.5">{user?.name || 'Admin User'}</p>
                                        <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">{user?.role || 'SYSTEM ADMIN'}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-[#94A3B8] transition-transform group-data-[state=open]:rotate-180" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl mt-1">
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-[#94A3B8] uppercase">Account Profile</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl p-3 gap-3 cursor-pointer">
                                    <User size={16} /> My Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl p-3 gap-3 cursor-pointer">
                                    <Activity size={16} /> Security Logs
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl p-3 gap-3 cursor-pointer">
                                    <HelpCircle size={16} /> Help Center
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="mx-1 my-2" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-xl p-3 gap-3 cursor-pointer text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626] font-semibold"
                                >
                                    <LogOut size={16} /> Log Out System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[#F8FAFC]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
