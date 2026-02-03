import React, { useEffect, useState } from 'react';
import {
    Users, Stethoscope, FlaskConical, UserCog,
    Calendar, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { adminService, type DashboardStats } from '../../api/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AddUserDialog } from '../../components/admin/AddUserDialog';

const COLORS = ['#769FCD', '#B9D7EA', '#D6E6F2', '#A1C3D1'];

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="mb-4"
                >
                    <Activity className="w-12 h-12 text-[#769FCD]" />
                </motion.div>
                <p className="text-[#6B7280] font-medium animate-pulse">Initializing Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
                <p className="text-gray-500 max-w-md">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-6">
                    Retry Loading
                </Button>
            </div>
        );
    }

    const distributionData = [
        { name: 'Doctors', value: stats?.doctorCount || 0 },
        { name: 'Lab Staff', value: stats?.labStaffCount || 0 },
        { name: 'Receptionists', value: stats?.receptionistCount || 0 },
    ].filter(item => item.value > 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Hospital Analytics</h1>
                    <p className="text-[#6B7280] mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-2">
                    <Button variant="outline" className="hidden sm:flex" onClick={handleExport}>Export Report</Button>
                    <AddUserDialog onSuccess={fetchStats} />
                </motion.div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#769FCD', trend: '+12%' },
                    { label: 'Doctors', value: stats?.doctorCount || 0, icon: Stethoscope, color: '#B9D7EA', trend: '+5%' },
                    { label: 'Lab Staff', value: stats?.labStaffCount || 0, icon: FlaskConical, color: '#769FCD', trend: 'stable' },
                    { label: 'Receptionists', value: stats?.receptionistCount || 0, icon: UserCog, color: '#B9D7EA', trend: '-2%' },
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <Badge variant={stat.trend.startsWith('+') ? 'success' : stat.trend === 'stable' ? 'secondary' : 'destructive'} className="rounded-full">
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-[#111827] mt-1">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Clinic Activity</CardTitle>
                            <CardDescription>Daily appointments over the last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent className="pr-8">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.appointmentsByDay || []}>
                                        <defs>
                                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#769FCD" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#769FCD" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #D6E6F2', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#1E293B', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            name="Daily Appointments"
                                            type="monotone"
                                            dataKey="appointments"
                                            stroke="#769FCD"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorApps)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Staff Distribution (Formerly role allocation) */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Staff Distribution</CardTitle>
                            <CardDescription>Role allocation across the hospital</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-0 pb-8">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distributionData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 px-6 w-full">
                                {distributionData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm font-medium text-[#374151]">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
