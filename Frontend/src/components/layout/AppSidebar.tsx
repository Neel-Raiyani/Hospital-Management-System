import * as React from "react"
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
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
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "User Management", icon: Users },
    { path: "/admin/settings", label: "System Settings", icon: Settings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-[#B9D7EA] shadow-sm bg-[#D6E6F2]">
            <SidebarHeader className="h-16 flex flex-row items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center border-b border-[#B9D7EA]/50">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-[#769FCD] text-white shadow-lg shadow-[#769FCD]/20 shrink-0">
                    <ShieldCheck className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-lg tracking-tight">Empyreal</span>
                    <span className="text-[10px] font-bold text-[#769FCD] uppercase tracking-widest">Admin System</span>
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
                                            className={isActive ? "bg-[#769FCD] text-white font-semibold shadow-md shadow-[#769FCD]/20" : "text-[#475569] hover:bg-[#B9D7EA]/30 hover:text-[#1E293B]"}
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
            <SidebarFooter className="p-4 border-t border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-3 group-data-[collapsible=icon]:justify-center">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-accent font-bold text-sidebar-accent-foreground shadow-sm shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-bold truncate">{user?.name || 'Admin User'}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase truncate">{user?.role || 'System Admin'}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="mt-2">
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Logout"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 transition-colors group-data-[collapsible=icon]:justify-center"
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
