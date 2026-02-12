import React, { useEffect, useState } from 'react';
import {
    Users, Stethoscope, FlaskConical, UserCog,
    Calendar, Activity, UserPlus, Download, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { adminService, type DashboardStats } from '../../api/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AddUserDialog } from '../../components/features/admin/AddUserDialog';
import { Loader } from '../../components/ui/Loader';

const COLORS = ['#4F46E5', '#818CF8', '#C7D2FE', '#EEF2FF'];

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleExport = () => {
        if (!stats) return;

        const csvContent = [
            ['Hospital Staff & Appointment Report', new Date().toLocaleString()],
            ['Total Users', stats.totalUsers],
            ['Doctors', stats.doctorCount],
            ['Lab Staff', stats.labStaffCount],
            ['Receptionists', stats.receptionistCount],
            ['Admins', stats.adminCount],
            [],
            ['Clinic Activity (7 Days Appointments)'],
            ...stats.appointmentsByDay.map(d => [d.name, d.appointments])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Hospital_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const distributionData = [
        { name: 'Doctors', value: stats?.doctorCount || 0 },
        { name: 'Lab Staff', value: stats?.labStaffCount || 0 },
        { name: 'Receptionists', value: stats?.receptionistCount || 0 },
    ].filter(item => item.value > 0);

    return (
        <div className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Analytics</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">Live System</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader size="lg" text="Initializing Dashboard..." variant="indigo" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <Activity className="w-8 h-8 text-red-500 mb-4" />
                    <p className="text-gray-600 font-medium">{error}</p>
                    <Button onClick={fetchStats} variant="outline" className="mt-4">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                    </Button>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Staff</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalUsers || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100 transition-colors group-hover:bg-indigo-100">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Doctors</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.doctorCount || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100 transition-colors group-hover:bg-emerald-100">
                                    <Stethoscope className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Lab Staff</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.labStaffCount || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100 transition-colors group-hover:bg-amber-100">
                                    <FlaskConical className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Receptionists</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.receptionistCount || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center border border-violet-100 transition-colors group-hover:bg-violet-100">
                                    <UserCog className="w-6 h-6 text-violet-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AddUserDialog onSuccess={fetchStats} trigger={
                            <button className="group bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl shadow-lg shadow-indigo-200/50 transition-all text-left w-full">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <UserPlus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Add New User</h3>
                                        <p className="text-xs text-indigo-100 mt-0.5">Register new staff member to the system</p>
                                    </div>
                                </div>
                            </button>
                        } />

                        <button
                            onClick={handleExport}
                            className="group bg-white hover:bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 transition-all text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Download className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Export Report</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Download hospital analytics in CSV format</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Area Chart */}
                        <div className="lg:col-span-2">
                            <Card className="border-none shadow-md bg-white h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl font-bold text-slate-900">Clinic Activity</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium capitalize">
                                        Shows daily appointment volume to monitor hospital load
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full h-[380px] mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats?.appointmentsByDay || []}>
                                                <defs>
                                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="appointments"
                                                    stroke="#4F46E5"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorApps)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pie Chart */}
                        <div>
                            <Card className="border-none shadow-md bg-white h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl font-bold text-slate-900">Staff Distribution</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium capitalize">
                                        Visualizes the human resource allocation across departments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="w-full h-[260px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distributionData}
                                                    dataKey="value"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                >
                                                    {distributionData.map((_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                            stroke="none"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {distributionData.map((item, index) => (
                                            <div key={item.name} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    />
                                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-gray-900 font-bold">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
