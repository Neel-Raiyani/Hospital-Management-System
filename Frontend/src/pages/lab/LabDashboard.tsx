import React, { useState, useEffect } from 'react';
import {
    TestTube, FileCheck, Clock, TrendingUp,
    Upload, Loader2, Calendar, User,
    FileText, RefreshCw, ChevronRight, CheckCircle
} from 'lucide-react';
import { labService } from '../../api/lab.service';
import type { LabTest } from '../../types/lab';
import LabReportUpload from '../../components/lab/LabReportUpload';

const LabDashboard: React.FC = () => {
    const [pendingTests, setPendingTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

    const fetchPendingTests = async () => {
        try {
            setLoading(true);
            const data = await labService.getPendingTests();
            setPendingTests(data);
        } catch (error) {
            console.error('Failed to fetch pending tests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTests();
    }, []);

    const stats = [
        { label: 'Pending Tests', value: pendingTests.length, icon: TestTube, color: 'blue' },
        { label: 'Completed Today', value: 42, icon: FileCheck, color: 'green' },
        { label: 'Urgent Tests', value: 5, icon: Clock, color: 'orange' },
        { label: 'This Week', value: 287, icon: TrendingUp, color: 'purple' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lab Dashboard</h1>
                    <p className="text-gray-500 font-medium">Manage diagnostic requests and reports</p>
                </div>
                <button
                    onClick={fetchPendingTests}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                        <div className="relative">
                            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tests Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Pending Lab Tests</h2>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                            {pendingTests.length} Total
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Requests...</p>
                            </div>
                        ) : pendingTests.length === 0 ? (
                            <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center space-y-4">
                                <FileText className="w-12 h-12 text-gray-200" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No pending tests</p>
                            </div>
                        ) : (
                            pendingTests.map((test) => (
                                <div
                                    key={test.id}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <TestTube className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 leading-tight">{test.testType}</h3>
                                                <div className="flex flex-wrap gap-4 mt-2">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                        <User className="w-3.5 h-3.5" />
                                                        ID: {test.patientId}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(test.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTest(test)}
                                            className="px-6 py-4 bg-gray-50 text-gray-900 font-black rounded-2xl hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Upload className="w-5 h-5 transition-transform group-hover/btn:-translate-y-1" />
                                            Upload Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity / Quick Stats Side Panel */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight px-2">Quick Actions</h2>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                        <h4 className="text-2xl font-black leading-tight relative">Ready for<br />Samples?</h4>
                        <p className="text-blue-100 font-bold text-sm mt-4 relative opacity-80">
                            Check for urgent requests in the pending list to maintain laboratory efficiency.
                        </p>
                        <button className="mt-8 w-full py-4 bg-white text-blue-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 group/s">
                            View All Tests
                            <ChevronRight className="w-5 h-5 transition-transform group-hover/s:translate-x-1" />
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Guidelines</h3>
                        <div className="space-y-4">
                            {[
                                'Reports must be in PDF format',
                                'Maximum file size 10MB per file',
                                'Ensure patient ID matches correctly',
                                'Status updates automatically on upload'
                            ].map((guide, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{guide}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedTest && (
                <LabReportUpload
                    labTest={selectedTest}
                    isOpen={!!selectedTest}
                    onClose={() => setSelectedTest(null)}
                    onSuccess={fetchPendingTests}
                />
            )}
        </div>
    );
};

export default LabDashboard;
