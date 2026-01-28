import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Activity, FileText } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold">156</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Active Doctors</p>
                    <p className="text-3xl font-bold">24</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Today</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Patients Today</p>
                    <p className="text-3xl font-bold">87</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <FileText className="w-8 h-8 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Pending Reports</p>
                    <p className="text-3xl font-bold">12</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/add-doctor')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add New Doctor
                        </button>
                        <button
                            onClick={() => navigate('/admin/add-receptionist')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Receptionist
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                            <Users className="w-5 h-5" />
                            Manage Doctors
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                            <FileText className="w-5 h-5" />
                            View All Reports
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">New doctor registered</p>
                                <p className="text-xs text-gray-500">2 minutes ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Patient record updated</p>
                                <p className="text-xs text-gray-500">15 minutes ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Lab report submitted</p>
                                <p className="text-xs text-gray-500">1 hour ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
