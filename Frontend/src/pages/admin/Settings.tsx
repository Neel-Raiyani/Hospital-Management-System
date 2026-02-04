import React, { useState, useEffect } from 'react';
import {
    Save, Bell, Lock, Loader2, CheckCircle,
    Building2, Mail, ShieldCheck, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

interface SystemSettings {
    hospitalName: string;
    hospitalTagline: string;
    primaryLanguage: string;
    sessionTimeout: string;
    enableMFA: boolean;
    emailNotifications: boolean;
    systemAlerts: boolean;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings>({
        hospitalName: 'City General Hospital & Research Center',
        hospitalTagline: 'Advancing Healthcare, Together.',
        primaryLanguage: 'English (US)',
        sessionTimeout: '30',
        enableMFA: true,
        emailNotifications: true,
        systemAlerts: true,
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSystemSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        localStorage.setItem('adminSystemSettings', JSON.stringify(settings));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const SectionHeader = ({ icon: Icon, title, description, color }: any) => (
        <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-[${color}]`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-[#1E293B]">{title}</h3>
                <p className="text-sm text-[#64748B]">{description}</p>
            </div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="px-8 pb-8 pt-2 max-w-[1600px] mx-auto space-y-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">System Settings</h1>
                    <p className="text-[#6B7280] mt-1">Manage hospital information and system preferences</p>
                </div>
                <div className="flex items-center gap-4">
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 text-[#10B981] bg-[#ECFDF5] px-3 py-1.5 rounded-full text-xs font-bold border border-[#D1FAE5]"
                        >
                            <CheckCircle size={14} />
                            Settings Saved
                        </motion.div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-11 px-8 bg-[#769FCD] hover:bg-[#608FBF] rounded-xl shadow-lg border-none font-bold"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hospital Details */}
                <div className="space-y-6">
                    <SectionHeader
                        icon={Building2}
                        title="Hospital Profile"
                        description="Basic information about your institution."
                        color="#769FCD"
                    />
                    <Card className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Hospital Name</label>
                                <Input
                                    value={settings.hospitalName}
                                    onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                                    className="border-[#B9D7EA] h-12 rounded-xl bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Tagline</label>
                                <Input
                                    value={settings.hospitalTagline}
                                    onChange={(e) => setSettings({ ...settings, hospitalTagline: e.target.value })}
                                    className="border-[#B9D7EA] h-12 rounded-xl bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Primary Language</label>
                                <div className="relative">
                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                                    <Input
                                        value={settings.primaryLanguage}
                                        onChange={(e) => setSettings({ ...settings, primaryLanguage: e.target.value })}
                                        className="pl-11 border-[#B9D7EA] h-12 rounded-xl bg-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Preferences */}
                <div className="space-y-6">
                    <SectionHeader
                        icon={ShieldCheck}
                        title="Security & Access"
                        description="Manage authentication and session policies."
                        color="#769FCD"
                    />
                    <Card className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#B9D7EA]/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-blue-50 text-[#769FCD]">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1E293B]">Extra Login Security (MFA)</p>
                                        <p className="text-xs text-[#64748B]">Require a code for all staff logins</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, enableMFA: !settings.enableMFA })}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.enableMFA ? 'bg-[#769FCD]' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.enableMFA ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Session Timeout (minutes)</label>
                                <Input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                    className="border-[#B9D7EA] h-12 rounded-xl bg-white"
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="rounded-lg py-1 px-3 border-[#B9D7EA] text-[#769FCD]">Min. 12 Characters</Badge>
                                    <Badge variant="outline" className="rounded-lg py-1 px-3 border-[#B9D7EA] text-[#769FCD]">Account Locking</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications Section */}
                <div className="lg:col-span-2 space-y-6">
                    <SectionHeader
                        icon={Bell}
                        title="Notification Settings"
                        description="Control how system alerts and emails are handled."
                        color="#769FCD"
                    />
                    <Card className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#B9D7EA]/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-green-50 text-green-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1E293B]">Email Notifications</p>
                                        <p className="text-xs text-[#64748B]">Send daily activity summaries</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.emailNotifications ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#B9D7EA]/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1E293B]">Critical Alerts</p>
                                        <p className="text-xs text-[#64748B]">Push notifications for emergencies</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, systemAlerts: !settings.systemAlerts })}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.systemAlerts ? 'bg-orange-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.systemAlerts ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
