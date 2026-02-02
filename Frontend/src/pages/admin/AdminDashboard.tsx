import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Stethoscope, FlaskConical, UserCog,
    TrendingUp, Clock, UserPlus, ArrowRight,
    Loader2, AlertCircle, CheckCircle2, Heart, Activity, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { adminService, type DashboardStats } from '../../api/admin.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// Mock data for charts
const activityData = [
    { name: 'Mon', visits: 400, appointments: 240 },
    { name: 'Tue', visits: 300, appointments: 139 },
    { name: 'Wed', visits: 200, appointments: 980 },
    { name: 'Thu', visits: 278, appointments: 390 },
    { name: 'Fri', visits: 189, appointments: 480 },
    { name: 'Sat', visits: 239, appointments: 380 },
    { name: 'Sun', visits: 349, appointments: 430 },
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="mb-4"
                >
                    <Activity className="w-12 h-12 text-[#3B82F6]" />
                </motion.div>
                <p className="text-[#6B7280] font-medium animate-pulse">Initializing Dashboard...</p>
            </div>
        );
    }

    const distributionData = [
        { name: 'Doctors', value: stats?.doctorCount || 0 },
        { name: 'Lab Staff', value: stats?.labStaffCount || 0 },
        { name: 'Receptionists', value: stats?.receptionistCount || 0 },
        { name: 'Admins', value: stats?.adminCount || 0 },
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
            className="p-8 max-w-[1600px] mx-auto space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Hospital Analytics</h1>
                    <p className="text-[#6B7280] mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Monday, 02 February 2026
                    </p>
                </motion.div>
                <motion.div variants={itemVariants} className="flex gap-2">
                    <Button variant="outline" className="hidden sm:flex">Export Report</Button>
                    <Button onClick={() => navigate('/admin/users')}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                    </Button>
                </motion.div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#3B82F6', trend: '+12%' },
                    { label: 'Doctors', value: stats?.doctorCount || 0, icon: Stethoscope, color: '#10B981', trend: '+5%' },
                    { label: 'Lab Staff', value: stats?.labStaffCount || 0, icon: FlaskConical, color: '#8B5CF6', trend: 'stable' },
                    { label: 'Receptionists', value: stats?.receptionistCount || 0, icon: UserCog, color: '#F59E0B', trend: '-2%' },
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
                            <CardTitle>System Activity</CardTitle>
                            <CardDescription>Daily visits and appointments across all services</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] pr-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                                    <Area type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Staff Distribution */}
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

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Status */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#3B82F6]" />
                                Service Connectivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Auth Service', time: '12ms' },
                                { name: 'Patient Management', time: '24ms' },
                                { name: 'Lab Inventory', time: '18ms' },
                                { name: 'Appointment Sync', time: '15ms' },
                            ].map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                        <span className="text-sm font-semibold text-[#374151]">{service.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-medium text-[#6B7280]">{service.time}</span>
                                        <Badge variant="success" className="bg-[#D1FAE5] text-[#065F46] border-none">Active</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Management Shortcuts</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-1 text-left border-[#DBEAFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
                                onClick={() => navigate('/admin/users')}
                            >
                                <div className="p-2 rounded-lg bg-white text-[#3B82F6] border border-[#BFDBFE]">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <div className="mt-2">
                                    <p className="font-bold text-[#1E40AF]">User Access</p>
                                    <p className="text-xs text-[#3B82F6]">Provision new staff</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-1 text-left border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors"
                                onClick={() => navigate('/admin/settings')}
                            >
                                <div className="p-2 rounded-lg bg-white text-[#F59E0B] border border-[#FDE68A]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="mt-2">
                                    <p className="font-bold text-[#92400E]">System Config</p>
                                    <p className="text-xs text-[#F59E0B]">Global settings</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-1 text-left border-[#D1FAE5] bg-[#ECFDF5] hover:bg-[#D1FAE5] transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-white text-[#10B981] border border-[#A7F3D0]">
                                    <Heart className="w-4 h-4" />
                                </div>
                                <div className="mt-2">
                                    <p className="font-bold text-[#065F46]">Clinic Flow</p>
                                    <p className="text-xs text-[#10B981]">Manage OPD slots</p>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto p-4 flex flex-col items-start gap-1 text-left border-[#DDD6FE] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-white text-[#8B5CF6] border border-[#DDD6FE]">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="mt-2">
                                    <p className="font-bold text-[#5B21B6]">Audit Logs</p>
                                    <p className="text-xs text-[#8B5CF6]">Security history</p>
                                </div>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
