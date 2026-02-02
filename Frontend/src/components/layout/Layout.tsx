import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Toaster position="top-right" />
            <Sidebar onLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col ml-64">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10 w-full backdrop-blur-md bg-white/80">
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                {user?.role}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 ring-2 ring-white">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
