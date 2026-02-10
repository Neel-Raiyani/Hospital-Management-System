import { Bell, Search, User, LogOut, HelpCircle, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from '../../context/AuthContext';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Button } from "@/components/ui/Button"
import { SidebarTrigger } from "@/components/ui/Sidebar"
import { Separator } from "@/components/ui/Separator"

interface SiteHeaderProps {
    showSearch?: boolean
}

export function SiteHeader({ showSearch = true }: SiteHeaderProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#B9D7EA]/50 bg-[#F7FBFC]/95 px-4 backdrop-blur supports-backdrop-filter:bg-[#F7FBFC]/60">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {showSearch && (
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="System-wide Search..."
                            className="h-9 w-64 rounded-xl bg-[#D6E6F2]/50 pl-9 pr-4 text-sm transition-all focus:bg-[#D6E6F2] focus:ring-2 focus:ring-[#769FCD]/20 outline-none border-none"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-muted rounded-xl">
                    <Bell className="size-5" />
                    <span className="absolute top-2 right-2 size-2.5 bg-destructive rounded-full ring-2 ring-background" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-muted transition-colors group">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#769FCD] text-white font-bold shadow-md shadow-[#769FCD]/20">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold leading-none mb-1">{user?.name || 'Admin User'}</p>
                                <p className="text-[10px] font-bold text-[#769FCD] uppercase tracking-wider">{user?.role || 'SYSTEM ADMIN'}</p>
                            </div>
                            <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl mt-1">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase">Account Profile</DropdownMenuLabel>
                        <DropdownMenuItem
                            className="rounded-xl p-3 gap-3 cursor-pointer"
                            onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/profile' : '/profile')}
                        >
                            <User size={16} /> My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl p-3 gap-3 cursor-pointer">
                            <HelpCircle size={16} /> Help Center
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="mx-1 my-2" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-xl p-3 gap-3 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                        >
                            <LogOut size={16} /> Log Out System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
