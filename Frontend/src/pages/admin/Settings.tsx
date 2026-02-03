import React, { useState } from 'react';
import {
    Save, Bell, Lock, Database, Loader2, CheckCircle,
    ShieldAlert, UserCheck, Cloud, Mail, AtSign, Globe2,
    Monitor, Zap, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const Settings: React.FC = () => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="px-8 pb-8 pt-2 max-w-[1200px] mx-auto space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">System Configuration</h1>
                    <p className="text-[#6B7280] mt-1">Fine-tune hospital infrastructure and security protocols</p>
                </div>
                <div className="flex items-center gap-4">
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 text-[#10B981] bg-[#ECFDF5] px-3 py-1.5 rounded-full text-xs font-bold border border-[#D1FAE5]"
                        >
                            <CheckCircle size={14} />
                            State Synced
                        </motion.div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-11 px-6 bg-[#769FCD] hover:bg-[#608FBF] rounded-xl shadow-lg border-none"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Apply Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="hospital" className="w-full space-y-8">
                <TabsList className="bg-[#D6E6F2] p-1.5 h-auto rounded-2xl border border-[#B9D7EA]">
                    <TabsTrigger value="hospital" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">
                        <Globe2 className="w-4 h-4 mr-2" /> Hospital Identity
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">
                        <ShieldAlert className="w-4 h-4 mr-2" /> Security & Access
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">
                        <Bell className="w-4 h-4 mr-2" /> Communications
                    </TabsTrigger>
                    <TabsTrigger value="infrastructure" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">
                        <Zap className="w-4 h-4 mr-2" /> API & Infrastructure
                    </TabsTrigger>
                </TabsList>

                {/* Hospital Identity */}
                <TabsContent value="hospital">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <h3 className="font-bold text-[#1E293B]">Hospital Info</h3>
                            <p className="text-sm text-[#64748B]">These details appear on clinical reports and patient documents.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Institution Name</label>
                                            <Input defaultValue="City General Hospital & Research Center" className="border-[#B9D7EA] h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Primary Language</label>
                                            <Input defaultValue="English (US)" className="border-[#B9D7EA] h-12 rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Clinical Tagline</label>
                                        <Input defaultValue="Advancing Healthcare, Together." className="border-[#B9D7EA] h-12 rounded-xl" />
                                    </div>
                                    <div className="pt-4 flex items-center gap-6 border-t border-[#B9D7EA]">
                                        <div className="w-16 h-16 bg-[#F7FBFC] rounded-2xl border-2 border-dashed border-[#CBD5E1] flex items-center justify-center text-[#94A3B8]">
                                            <Cloud size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#1E293B]">Official Seal / Logo</p>
                                            <p className="text-xs text-[#64748B] mt-1">Recommended: 400x400px, PNG or SVG</p>
                                            <Button variant="link" size="sm" className="px-0 mt-1 h-auto font-bold text-[#769FCD]">Upload new...</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <h3 className="font-bold text-[#1E293B]">Security Policy</h3>
                            <p className="text-sm text-[#64748B]">Configure authentication thresholds and clinical privacy settings.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl rounded-2xl">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl hover:bg-[#F7FBFC] transition-colors border border-transparent hover:border-[#B9D7EA]">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-xl bg-[#D6E6F2] text-[#769FCD] group-hover:scale-110 transition-transform">
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1E293B]">Multi-Factor Authentication (MFA)</p>
                                                <p className="text-sm text-[#64748B] mt-0.5">Force all practitioners to use verified secondary devices.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-[#769FCD] rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl hover:bg-[#F7FBFC] transition-colors border border-transparent hover:border-[#B9D7EA]">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-xl bg-[#FFF7ED] text-[#F59E0B] group-hover:scale-110 transition-transform">
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1E293B]">Automated Session Lock</p>
                                                <p className="text-sm text-[#64748B] mt-0.5">Log out practitioners after 30 minutes of idle time.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-[#E2E8F0] rounded-full relative">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[#B9D7EA]">
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-4">Password Requirements</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="rounded-lg py-1 px-3">Min. 12 Characters</Badge>
                                            <Badge variant="outline" className="rounded-lg py-1 px-3 border-[#B9D7EA]">Complexity Filter</Badge>
                                            <Badge variant="outline" className="rounded-lg py-1 px-3 border-[#B9D7EA]">No Reuse (prev 5)</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <h3 className="font-bold text-[#1E293B]">Outbound Comms</h3>
                            <p className="text-sm text-[#64748B]">Manage how the system interacts with staff and patients.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl rounded-2xl">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-[#769FCD]" /> SMTP Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Host Relay</label>
                                            <Input defaultValue="smtp.hospital.private" className="border-[#B9D7EA] h-12 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Auth Method</label>
                                            <Input defaultValue="SSL/TLS (Port 465)" className="border-[#B9D7EA] h-12 rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-[#F7FBFC] rounded-2xl border border-[#B9D7EA]">
                                        <AtSign size={18} className="text-[#94A3B8]" />
                                        <span className="text-sm font-bold text-[#475569]">Broadcasts will originate from: </span>
                                        <span className="text-sm font-mono text-[#769FCD]">noreply@hospital-msg.com</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Infrastructure */}
                <TabsContent value="infrastructure">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <h3 className="font-bold text-[#1E293B]">Engine Health</h3>
                            <p className="text-sm text-[#64748B]">Internal microservice routing and cloud maintenance.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] flex items-center justify-center text-[#10B981]">
                                                <Database size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1E293B]">Main Instance Pool</p>
                                                <p className="text-xs text-[#6B7280]">Region: us-east-1a (Active)</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-9 rounded-xl border-[#B9D7EA]"><RefreshCw size={14} className="mr-2" /> Redundancy Check</Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-[#F7FBFC] border border-[#B9D7EA]">
                                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Latency</p>
                                            <p className="text-xl font-bold text-[#1E293B] mt-1">~14ms</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-[#F7FBFC] border border-[#B9D7EA]">
                                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Uptime</p>
                                            <p className="text-xl font-bold text-[#10B981] mt-1">99.992%</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-[#F7FBFC] border border-[#B9D7EA]">
                                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Req/Sec</p>
                                            <p className="text-xl font-bold text-[#769FCD] mt-1">2.4k</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 bg-[#D6E6F2] border-t border-[#B9D7EA] flex justify-center">
                                    <p className="text-[10px] font-bold text-[#64748B] flex items-center gap-2">
                                        <Monitor size={12} /> SYSTEM CLUSTER V2.14.0-STABLE
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default Settings;
