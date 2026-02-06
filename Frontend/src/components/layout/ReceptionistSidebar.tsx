import * as React from "react"
import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
    Activity,
    ChevronRight,
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarRail,
} from "@/components/ui/Sidebar"

const navItems = [
    { path: "/receptionist/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/receptionist/appointments", label: "Appointments", icon: Calendar },
    { path: "/receptionist/patients", label: "Patients", icon: Users },
    { path: "/receptionist/book-appointment", label: "Book Appointment", icon: Calendar },
]

export function ReceptionistSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-teal-200 shadow-sm bg-gradient-to-b from-teal-50 to-white">
            <SidebarHeader className="h-16 flex flex-row items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center border-b border-teal-200/50">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 shrink-0">
                    <Activity className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-lg tracking-tight text-gray-900">Empyreal</span>
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">HMS Receptionist</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.label}
                                            className={isActive ? "bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/20 hover:bg-teal-700" : "text-gray-700 hover:bg-teal-50 hover:text-teal-900"}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-5" />
                                                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                                {isActive && <ChevronRight className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-teal-200/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold shadow-sm shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'R'}
                            </div>
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-bold truncate text-gray-900">{user?.name || 'Receptionist'}</span>
                                <span className="text-[10px] text-teal-600 font-medium uppercase truncate">{user?.role || 'Receptionist'}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="mt-2">
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Logout"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 transition-colors group-data-[collapsible=icon]:justify-center"
                        >
                            <LogOut className="size-5" />
                            <span className="font-bold group-data-[collapsible=icon]:hidden">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
