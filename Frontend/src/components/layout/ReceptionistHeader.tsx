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

interface ReceptionistHeaderProps {
    showSearch?: boolean
}

export function ReceptionistHeader({ showSearch = true }: ReceptionistHeaderProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-teal-100 bg-white/95 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1 text-teal-600 hover:bg-teal-50" />
                <Separator orientation="vertical" className="mr-2 h-6 bg-teal-100/50" />
                {showSearch && (
                    <div className="relative max-w-md w-64 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients, records..."
                            className="h-10 w-full rounded-lg bg-gray-50/80 pl-11 pr-4 text-[14.5px] font-medium transition-all focus:bg-white focus:ring-4 focus:ring-teal-500/10 outline-none border border-transparent focus:border-teal-400 placeholder:text-gray-400"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-5">
                <Button variant="ghost" size="icon" className="relative size-10 text-gray-500 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all">
                    <Bell className="size-5.5" />
                    <span className="absolute top-2.5 right-2.5 size-3 bg-red-500 rounded-full ring-2 ring-white" />
                </Button>

                <Separator orientation="vertical" className="h-8 bg-teal-100/50" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3.5 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-teal-50/80 transition-all border border-transparent hover:border-teal-100 group">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                                {user?.name?.charAt(0).toUpperCase() || 'R'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-[14.5px] font-extrabold leading-none mb-1 text-gray-950 tracking-tight">{user?.name || 'Receptionist'}</p>
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest opacity-90">{user?.role || 'RECEPTIONIST'}</p>
                            </div>
                            <ChevronDown className="size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg shadow-xl mt-1">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">Account Profile</DropdownMenuLabel>
                        <DropdownMenuItem
                            className="rounded-lg p-3 gap-3 cursor-pointer hover:bg-teal-50"
                            onClick={() => navigate('/receptionist/profile')}
                        >
                            <User size={16} />
                            <span>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg p-3 gap-3 cursor-pointer hover:bg-teal-50">
                            <HelpCircle size={16} />
                            <span>Help Center</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="mx-1 my-2" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-lg p-3 gap-3 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                        >
                            <LogOut size={16} />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
