import { Bell, Search, User, LogOut, HelpCircle, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

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
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-teal-200/50 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {showSearch && (
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patients, appointments..."
                            className="h-9 w-64 rounded-lg bg-teal-50/50 pl-9 pr-4 text-sm transition-all focus:bg-teal-50 focus:ring-2 focus:ring-teal-500/20 outline-none border border-teal-100 focus:border-teal-400"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg">
                    <Bell className="size-5" />
                    <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-teal-50 transition-colors group">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold shadow-md shadow-teal-600/20">
                                {user?.name?.charAt(0).toUpperCase() || 'R'}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold leading-none mb-1 text-gray-900">{user?.name || 'Receptionist'}</p>
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{user?.role || 'RECEPTIONIST'}</p>
                            </div>
                            <ChevronDown className="size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl mt-1">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-gray-600 uppercase">Account Profile</DropdownMenuLabel>
                        <DropdownMenuItem
                            className="rounded-lg p-3 gap-3 cursor-pointer hover:bg-teal-50"
                            onClick={() => navigate('/profile')}
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
