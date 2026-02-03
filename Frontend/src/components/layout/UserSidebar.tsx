import * as React from "react"
import {
    Hospital,
    LogOut,
    ChevronRight,
} from "lucide-react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { MENU_CONFIG } from "../../config/menuConfig"
import type { UserRole } from "../../config/menuConfig"

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

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const roleItems = user?.role ? MENU_CONFIG[user.role as UserRole] : MENU_CONFIG.DEFAULT

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border shadow-sm">
            <SidebarHeader className="h-16 flex flex-row items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center border-b border-sidebar-border/50">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                    <Hospital className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-lg tracking-tight">Empyreal</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Medical System</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="px-2">
                            {roleItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}
                                        >
                                            <Link to={item.path}>
                                                <item.icon className="size-5" />
                                                <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-bold truncate">{user?.name || 'User'}</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase truncate">{user?.role}</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="mt-2">
                        <SidebarMenuButton
                            onClick={handleLogout}
                            tooltip="Sign Out"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 transition-colors group-data-[collapsible=icon]:justify-center"
                        >
                            <LogOut className="size-5" />
                            <span className="font-bold group-data-[collapsible=icon]:hidden">Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
