import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserPlus, Clock } from 'lucide-react';

const ReceptionistDashboard: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Receptionist Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Queue</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">OPD Queue</p>
                    <p className="text-3xl font-bold">15</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Today</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Appointments Today</p>
                    <p className="text-3xl font-bold">42</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <UserPlus className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">New</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">New Registrations</p>
                    <p className="text-3xl font-bold">8</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Waiting</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Avg Wait Time</p>
                    <p className="text-3xl font-bold">12m</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">OPD Queue</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Manage Queue</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                1
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">John Doe</p>
                                <p className="text-sm text-gray-500">Token: OPD-001 • Dr. Smith</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">In Progress</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                                2
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Alice Smith</p>
                                <p className="text-sm text-gray-500">Token: OPD-002 • Dr. Johnson</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Waiting</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                                3
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Bob Wilson</p>
                                <p className="text-sm text-gray-500">Token: OPD-003 • Dr. Smith</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Waiting</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                            <UserPlus className="w-5 h-5" />
                            Register New Patient
                        </button>
                        <button
                            onClick={() => navigate('/receptionist/book')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <Calendar className="w-5 h-5" />
                            Schedule Appointment
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                            <Users className="w-5 h-5" />
                            View All Patients
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-gray-900 mb-2">Today's Summary</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Check-ins</p>
                                <p className="text-lg font-bold text-blue-600">34</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Check-outs</p>
                                <p className="text-lg font-bold text-green-600">28</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
