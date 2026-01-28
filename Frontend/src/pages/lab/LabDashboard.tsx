import React from 'react';
import { TestTube, FileCheck, Clock, TrendingUp } from 'lucide-react';

const LabDashboard: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Lab Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <TestTube className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Pending Tests</p>
                    <p className="text-3xl font-bold">18</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <FileCheck className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Today</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Completed Today</p>
                    <p className="text-3xl font-bold">42</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Urgent</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Urgent Tests</p>
                    <p className="text-3xl font-bold">5</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Week</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">This Week</p>
                    <p className="text-3xl font-bold">287</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Pending Lab Tests</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <TestTube className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Blood Test - Complete</p>
                                <p className="text-sm text-gray-500">Patient: John Doe</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Urgent</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <TestTube className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">X-Ray Chest</p>
                                <p className="text-sm text-gray-500">Patient: Alice Smith</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Normal</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <TestTube className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Urine Analysis</p>
                                <p className="text-sm text-gray-500">Patient: Bob Johnson</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Normal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Recent Results</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-green-900">Blood Test Completed</p>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Completed</span>
                            </div>
                            <p className="text-sm text-gray-600">Patient: Sarah Williams</p>
                            <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-green-900">ECG Test Completed</p>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Completed</span>
                            </div>
                            <p className="text-sm text-gray-600">Patient: Mike Brown</p>
                            <p className="text-xs text-gray-500 mt-1">25 minutes ago</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-green-900">CT Scan Completed</p>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Completed</span>
                            </div>
                            <p className="text-sm text-gray-600">Patient: Emma Davis</p>
                            <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabDashboard;
