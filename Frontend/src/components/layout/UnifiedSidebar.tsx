import * as React from "react"
import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
    Activity,
    Stethoscope,
    ChevronRight,
    ChevronLeft,
    TestTube,
    ClipboardList,
    ShieldCheck,
    Landmark,
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import type { LucideIcon } from "lucide-react"

// ─── Role Theme Configuration ───────────────────────────────────────────────

interface RoleTheme {
    primary: string          // Main brand color
    primaryHover: string     // Darker shade for hover/active
    primaryMuted: string     // Very subtle background tint
    primaryText: string      // Text color matching the brand
    label: string            // Role label shown under logo
    icon: LucideIcon         // Logo icon
}

const ROLE_THEMES: Record<string, RoleTheme> = {
    RECEPTIONIST: {
        primary: "#0D9488",
        primaryHover: "#0F766E",
        primaryMuted: "#F0FDFA",
        primaryText: "#0F766E",
        label: "Reception",
        icon: Activity,
    },
    DOCTOR: {
        primary: "#2563EB",
        primaryHover: "#1D4ED8",
        primaryMuted: "#EFF6FF",
        primaryText: "#1D4ED8",
        label: "Doctor Panel",
        icon: Stethoscope,
    },
    LAB: {
        primary: "#7C3AED",
        primaryHover: "#6D28D9",
        primaryMuted: "#F5F3FF",
        primaryText: "#6D28D9",
        label: "Laboratory",
        icon: TestTube,
    },
    ADMIN: {
        primary: "#4F46E5",
        primaryHover: "#4338CA",
        primaryMuted: "#818CF8",
        primaryText: "#F9FAFB",
        label: "Admin Panel",
        icon: ShieldCheck,
    },
}

// ─── Nav Item Configuration ─────────────────────────────────────────────────

interface NavItem {
    path: string
    label: string
    icon: LucideIcon
}

const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
    RECEPTIONIST: [
        { path: "/receptionist/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/receptionist/appointments", label: "Appointments", icon: Calendar },
        { path: "/receptionist/patients", label: "Patients", icon: Users },
        { path: "/receptionist/doctors", label: "Doctors", icon: Stethoscope },
        { path: "/receptionist/book-appointment", label: "Book Appointment", icon: Calendar },
    ],
    DOCTOR: [
        { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/appointments", label: "Appointments", icon: Calendar },
        { path: "/patients", label: "Patients", icon: Users },
    ],
    LAB: [
        { path: "/lab/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/appointments", label: "Appointments", icon: Calendar },
        { path: "/lab/reports", label: "Lab Reports", icon: TestTube },
    ],
    ADMIN: [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/revenue", label: "Financial Insights", icon: Landmark },
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/settings", label: "System Settings", icon: ClipboardList },
    ],
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface UnifiedSidebarProps {
    role?: string
    navItems?: NavItem[]
    onCollapsedChange?: (collapsed: boolean) => void
}

export function UnifiedSidebar({ role = "RECEPTIONIST", navItems, onCollapsedChange }: UnifiedSidebarProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [collapsed, setCollapsed] = React.useState(false)

    const toggleCollapsed = () => {
        const next = !collapsed
        setCollapsed(next)
        onCollapsedChange?.(next)
    }

    const theme = ROLE_THEMES[role] || ROLE_THEMES.RECEPTIONIST
    const items = navItems || ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.RECEPTIONIST
    const LogoIcon = theme.icon

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const sidebarWidth = collapsed ? 72 : 224

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarWidth }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r select-none ${role === 'ADMIN' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-slate-300'}`}
            style={{ width: sidebarWidth }}
        >
            {/* ── Collapse Toggle (Vertically Centered) ────────────────── */}
            <button
                onClick={toggleCollapsed}
                className={`absolute top-1/2 -right-3 z-50 flex items-center justify-center size-6 rounded-full border shadow-sm transition-all duration-200 group ${role === 'ADMIN' ? 'bg-[#1F2937] border-[#374151] text-gray-400 hover:bg-[#374151] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                style={{ transform: 'translateY(-50%)' }}
            >
                <motion.div
                    animate={{ rotate: collapsed ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronLeft size={14} strokeWidth={3} />
                </motion.div>
            </button>
            {/* ── Header / Logo ─────────────────────────────────────────── */}
            <div className={`flex items-center h-16 px-4 border-b shrink-0 overflow-hidden ${role === 'ADMIN' ? 'border-[#1F2937]/50' : 'border-slate-200'}`}>
                <div
                    className="flex items-center justify-center size-9 rounded-lg shrink-0"
                    style={{ backgroundColor: role === 'ADMIN' ? '#4F46E5' : theme.primary }}
                >
                    <LogoIcon className={`size-5 ${role === 'ADMIN' ? 'text-white' : 'text-white'}`} strokeWidth={2.2} />
                </div>

                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 min-w-0 overflow-hidden"
                        >
                            <p className={`text-[15px] font-bold tracking-tight leading-none whitespace-nowrap ${role === 'ADMIN' ? 'text-white' : 'text-slate-800'}`}>
                                Empyreal
                            </p>
                            <p
                                className={`text-[10px] font-semibold uppercase tracking-[0.12em] mt-1 whitespace-nowrap ${role === 'ADMIN' ? 'text-indigo-400' : 'text-slate-500'}`}
                            >
                                {theme.label}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Navigation ────────────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5">
                <ul className="flex flex-col gap-0.5">
                    {items.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="relative flex items-center rounded-lg transition-colors duration-150 group"
                                    style={{
                                        height: 42,
                                        padding: collapsed ? "0 0 0 0" : "0 12px",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        backgroundColor: isActive ? (role === 'ADMIN' ? '#4F46E5' : theme.primary) : "transparent",
                                        color: isActive ? (role === 'ADMIN' ? '#ffffff' : '#ffffff') : (role === 'ADMIN' ? '#94A3B8' : '#64748B'),
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = role === 'ADMIN' ? '#1F2937' : "#F1F5F9"
                                            e.currentTarget.style.color = role === 'ADMIN' ? '#ffffff' : "#0F172A"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = "transparent"
                                            e.currentTarget.style.color = role === 'ADMIN' ? '#94A3B8' : "#64748B"
                                        }
                                    }}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-indicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                                            style={{
                                                height: 24,
                                                backgroundColor: role === 'ADMIN' ? '#818CF8' : "#000000",
                                                left: 0,
                                            }}
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}

                                    <Icon
                                        className="shrink-0"
                                        size={20}
                                        strokeWidth={isActive ? 2.2 : 1.8}
                                        style={{ marginLeft: collapsed ? 0 : 0 }}
                                    />

                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={`ml-3 text-[13.5px] font-medium whitespace-nowrap overflow-hidden ${role === 'ADMIN' ? (isActive ? 'text-white' : 'text-gray-400') : ''}`}
                                                style={{ fontWeight: isActive ? 600 : 500 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Chevron for active item */}
                                    {isActive && !collapsed && (
                                        <ChevronRight className="ml-auto size-4 opacity-70" />
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <div className={`border-t px-2.5 py-3 shrink-0 ${role === 'ADMIN' ? 'border-[#1F2937]' : 'border-slate-300'}`}>
                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center rounded-lg transition-colors duration-150 ${role === 'ADMIN' ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-400' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                    style={{
                        height: 40,
                        padding: collapsed ? 0 : "0 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                >
                    <LogOut size={18} strokeWidth={2} />
                    {!collapsed && (
                        <span className="ml-3 text-[13.5px] font-semibold">Sign Out</span>
                    )}
                </button>
            </div>
        </motion.aside>
    )
}

// ─── Content Wrapper ────────────────────────────────────────────────────────
// Use this to offset the main content area so it doesn't hide behind the sidebar

interface SidebarContentWrapperProps {
    children: React.ReactNode
    collapsed?: boolean
}

export function SidebarContentWrapper({ children, collapsed = false }: SidebarContentWrapperProps) {
    return (
        <motion.div
            initial={false}
            animate={{ marginLeft: collapsed ? 72 : 256 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-screen"
        >
            {children}
        </motion.div>
    )
}
