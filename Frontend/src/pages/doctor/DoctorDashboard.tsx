import React from 'react';
import { Calendar, Users, FileText, Clock } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Today</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Appointments Today</p>
                    <p className="text-3xl font-bold">12</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                    <p className="text-3xl font-bold">284</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Pending Prescriptions</p>
                    <p className="text-3xl font-bold">8</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">OPD</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">OPD Hours</p>
                    <p className="text-xl font-bold">9:00 AM - 5:00 PM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Today's Appointments</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                JD
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">John Doe</p>
                                <p className="text-sm text-gray-500">Regular Checkup</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">10:00 AM</p>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Confirmed</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                AS
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Alice Smith</p>
                                <p className="text-sm text-gray-500">Follow-up</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">11:30 AM</p>
                                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Waiting</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">OPD Schedule</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-blue-900">Current Schedule</p>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-600">Start Time</p>
                                    <p className="font-medium">9:00 AM</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">End Time</p>
                                    <p className="font-medium">5:00 PM</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Update OPD Timings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
