import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                </p>

                {user && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-1">Your current role:</p>
                        <p className="text-lg font-semibold text-gray-900">{user.role}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleGoBack}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go Back
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
