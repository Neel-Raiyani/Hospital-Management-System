import React, { useState, useEffect } from 'react';
import {
    Stethoscope, Clock,
    ArrowRight, Search,
    Shield, AlertCircle,
    Users
} from 'lucide-react';
import { doctorService, type Doctor } from '../../api/doctor.service';
import { formatDoctorName } from '../../utils/nameUtils';
import { Loader } from '../../components/ui/Loader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDirectory: React.FC = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setIsLoading(true);
                const data = await doctorService.getDoctors();
                const activeDoctors = data.filter(d => d.isActive);
                setDoctors(activeDoctors);
                setFilteredDoctors(activeDoctors);
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        const filtered = doctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDoctors(filtered);
    }, [searchQuery, doctors]);

    const isAvailable = (startTime: string, endTime: string) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = startTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;

        const [endH, endM] = endTime.split(':').map(Number);
        const endMinutes = endH * 60 + endM;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };

    const availableDoctorsCount = doctors.filter(d => isAvailable(d.opdStartTime, d.opdEndTime)).length;
    const specializationsCount = new Set(doctors.map(d => d.specialization)).size;

    return (
        <div className="px-4 pb-4 pt-2 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Doctors</h1>
                    <p className="text-[#6B7280] text-xs mt-1 flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Network of specialist healthcare providers
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-2">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-[1.5]">
                        {[
                            { label: 'Total Doctors', value: isLoading ? '...' : doctors.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'On-Duty Now', value: isLoading ? '...' : availableDoctorsCount, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Specialties', value: isLoading ? '...' : specializationsCount, icon: Shield, color: 'text-teal-600', bg: 'bg-teal-50' },
                            { label: 'On Break', value: isLoading ? '...' : (doctors.length - availableDoctorsCount), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' }
                        ].map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white shadow-sm">
                                <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                    <stat.icon size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
                                    <p className="text-sm font-bold text-[#111827] leading-tight">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctors Grid */}
            {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                    <Loader size="md" text="Loading Directory..." variant="teal" />
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                        {filteredDoctors.map((doctor, index) => {
                            const onDuty = isAvailable(doctor.opdStartTime, doctor.opdEndTime);
                            const initials = doctor.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                            return (
                                <motion.div
                                    key={doctor.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                    <Card className={`group border transition-all duration-300 bg-white overflow-hidden rounded-lg ${onDuty
                                        ? 'border-teal-100 shadow-sm hover:shadow-md bg-teal-50/10'
                                        : 'border-gray-200 bg-gray-50/80 shadow-inner'
                                        }`}>
                                        <CardContent className="p-4 flex flex-col h-full">
                                            {/* Top Row: Avatar & Name & Fee */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm transition-colors ${onDuty
                                                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                                                            : 'bg-gray-200 text-gray-700 border-gray-300'
                                                            }`}>
                                                            {initials}
                                                        </div>
                                                        {onDuty && (
                                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-bold text-base leading-tight transition-colors ${onDuty ? 'text-[#111827] group-hover:text-teal-600' : 'text-gray-700'
                                                            }`}>
                                                            {formatDoctorName(doctor.name)}
                                                        </h3>
                                                        <p className={`text-[11px] font-medium ${onDuty ? 'text-teal-600' : 'text-gray-500'}`}>
                                                            {doctor.specialization}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-base font-bold ${onDuty ? 'text-[#111827]' : 'text-gray-700'}`}>₹{doctor.checkupFee || 0}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">per visit</p>
                                                </div>
                                            </div>

                                            {/* Consultation Time Row */}
                                            <div className={`flex items-center gap-2 py-2.5 px-3 rounded-lg mb-4 transition-colors ${onDuty ? 'bg-teal-50/50 border border-teal-100/50' : 'bg-gray-200/50 border border-gray-300/30'
                                                }`}>
                                                <Clock className={`w-4 h-4 ${onDuty ? 'text-teal-500' : 'text-gray-600'}`} />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5">Consultation Hours</span>
                                                    <span className={`text-xs font-bold ${onDuty ? 'text-[#111827]' : 'text-gray-700'}`}>
                                                        {doctor.opdStartTime} - {doctor.opdEndTime}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer Row */}
                                            <div className="flex items-center justify-between min-h-[32px]">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${onDuty
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-gray-300 text-gray-700 border-gray-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${onDuty ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                                                    {onDuty ? 'AVAILABLE' : 'NOT AVAILABLE'}
                                                </div>

                                                {onDuty ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate('/receptionist/book-appointment', { state: { doctorId: doctor.id } })}
                                                        className="h-8 text-teal-600 hover:text-white hover:bg-teal-600 font-bold text-[11px] px-3 rounded-lg transition-all border border-teal-100 hover:border-teal-600 group/btn shadow-sm"
                                                    >
                                                        Book Appointment
                                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Button>
                                                ) : (
                                                    <div className="h-8" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}

            {filteredDoctors.length === 0 && (
                <div className="py-24 bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">No doctors found</h3>
                    <p className="text-[#6B7280] text-sm mt-1 max-w-xs mx-auto">
                        We couldn't find any specialist matching your search.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setSearchQuery('')}
                        className="mt-6 rounded-lg font-bold border-gray-200 hover:bg-gray-50"
                    >
                        Clear search
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DoctorDirectory;
