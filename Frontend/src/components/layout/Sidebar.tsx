import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hospital, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import { MENU_CONFIG } from '../../config/menuConfig.ts';
import type { UserRole } from '../../config/menuConfig.ts';

interface SidebarProps {
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const location = useLocation();

    const roleItems = user?.role ? MENU_CONFIG[user.role as UserRole] : MENU_CONFIG.DEFAULT;

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full shadow-sm">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-50 mb-2">
                <Hospital className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Empyreal
                </span>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 space-y-1 py-4">
                {roleItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-left group"
                >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
