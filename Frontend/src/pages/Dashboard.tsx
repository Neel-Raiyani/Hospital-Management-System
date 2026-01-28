import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'ADMIN':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'DOCTOR':
                    navigate('/doctor/dashboard', { replace: true });
                    break;
                case 'LAB':
                    navigate('/lab/dashboard', { replace: true });
                    break;
                case 'RECEPTIONIST':
                    navigate('/receptionist/dashboard', { replace: true });
                    break;
            }
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default Dashboard;
