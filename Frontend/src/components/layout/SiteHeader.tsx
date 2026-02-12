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

    const isAdmin = user?.role === 'ADMIN'
    const primaryColor = isAdmin ? '#4F46E5' : '#0D9488'
    const headerBg = isAdmin ? 'bg-white/95' : 'bg-white/95'

    return (
        <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b ${isAdmin ? 'border-gray-100' : 'border-slate-200'} ${headerBg} px-6 backdrop-blur-sm shadow-sm shadow-gray-100/50`}>
            <div className="flex items-center gap-4">
                {showSearch && (
                    <div className="relative max-w-md w-64 md:w-80 group">
                        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[${primaryColor}] transition-colors`} />
                        <input
                            type="text"
                            placeholder="System-wide Search..."
                            className={`h-9 w-full rounded-lg bg-slate-50 pl-10 pr-4 text-[13.5px] font-medium transition-all focus:bg-white focus:ring-2 outline-none border border-slate-200 placeholder:text-slate-400`}
                            style={{
                                // Dynamic ring color since Tailwind doesn't support arbitrary values in template literals well without JIT
                                borderColor: 'var(--border-color)',
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative size-9 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors">
                    <Bell className="size-[18px]" />
                    <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-2 ring-white" />
                </Button>

                <Separator orientation="vertical" className="h-6 bg-slate-200" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 pl-1.5 pr-1.5 py-1 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                            <div
                                className="flex size-8 items-center justify-center rounded-lg text-white text-xs font-bold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-[13px] font-semibold leading-none mb-0.5 text-slate-800 tracking-tight">{user?.name || 'User'}</p>
                                <p
                                    className="text-[10px] font-medium uppercase tracking-wider"
                                    style={{ color: primaryColor }}
                                >
                                    {user?.role || 'USER'}
                                </p>
                            </div>
                            <ChevronDown className="size-3.5 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-lg shadow-lg mt-1">
                        <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase">Account</DropdownMenuLabel>
                        <DropdownMenuItem
                            className="rounded-md px-3 py-2 gap-2.5 cursor-pointer hover:bg-slate-50 text-[13px]"
                            onClick={() => navigate(isAdmin ? '/admin/profile' : '/profile')}
                        >
                            <User size={14} />
                            <span>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-md px-3 py-2 gap-2.5 cursor-pointer hover:bg-slate-50 text-[13px]">
                            <HelpCircle size={14} />
                            <span>Help Center</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="mx-1 my-1" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-md px-3 py-2 gap-2.5 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-[13px]"
                        >
                            <LogOut size={14} />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
