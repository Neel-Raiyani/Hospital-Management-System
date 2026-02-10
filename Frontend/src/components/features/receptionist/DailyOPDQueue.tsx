import React from 'react';
import { Clock, User, Stethoscope, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Loader } from '../../ui/Loader';
import { formatDoctorName } from '../../../utils/nameUtils';
import type { Appointment, AppointmentStatus } from '../../../types/appointment';

interface DailyOPDQueueProps {
    appointments: Appointment[];
    loading?: boolean;
}

const DailyOPDQueue: React.FC<DailyOPDQueueProps> = ({ appointments, loading }) => {
    const getStatusConfig = (status: AppointmentStatus) => {
        switch (status) {
            case 'WAITING':
                return {
                    color: 'bg-amber-50 text-amber-700 border-amber-300',
                    label: 'WAITING',
                    icon: Clock,
                    dotColor: 'bg-amber-500'
                };
            case 'LAB_TESTS':
                return {
                    color: 'bg-purple-50 text-purple-700 border-purple-300',
                    label: 'LAB TEST',
                    icon: Activity,
                    dotColor: 'bg-purple-500'
                };
            case 'REVIEW':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-300',
                    label: 'REVIEW',
                    icon: Stethoscope,
                    dotColor: 'bg-blue-500'
                };
            case 'COMPLETED':
                return {
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                    label: 'COMPLETED',
                    icon: CheckCircle,
                    dotColor: 'bg-emerald-500'
                };
            case 'CANCELLED':
                return {
                    color: 'bg-red-50 text-red-700 border-red-300',
                    label: 'CANCELLED',
                    icon: XCircle,
                    dotColor: 'bg-red-500'
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-700 border-gray-300',
                    label: status,
                    icon: User,
                    dotColor: 'bg-gray-500'
                };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Daily OPD Queue</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Real-time patient queue status</p>
                </div>
                <div className="p-12">
                    <Loader size="md" text="Loading queue..." variant="teal" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Daily OPD Queue</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Real-time patient queue status</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-600">Total</p>
                        <p className="text-xl font-semibold text-teal-600">{appointments.length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Token</span>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Patient Name</span>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Assigned Doctor</span>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Appointment Time</span>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Clock className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">No appointments in queue</p>
                                        <p className="text-xs text-gray-400 mt-1">Queue is currently empty</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appointment, index) => {
                                const statusConfig = getStatusConfig(appointment.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr
                                        key={appointment.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Token Number */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm ${index === 0
                                                        ? 'bg-teal-600 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    #{appointment.tokenNumber}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Patient Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-semibold text-sm">
                                                    {appointment.patient?.name?.charAt(0).toUpperCase() || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {appointment.patient?.name || 'Unknown Patient'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {appointment.patient?.patientId || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Assigned Doctor */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formatDoctorName(appointment.doctor?.name)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {appointment.doctor?.specialization || 'General'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Appointment Time */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                                                <Badge
                                                    className={`${statusConfig.color} border px-2.5 py-0.5 font-medium text-xs`}
                                                >
                                                    <StatusIcon className="w-3 h-3 inline mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Stats */}
            {appointments.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {['WAITING', 'LAB_TESTS', 'REVIEW', 'COMPLETED'].map((status) => {
                                const count = appointments.filter(a => a.status === status).length;
                                const config = getStatusConfig(status as AppointmentStatus);
                                return count > 0 ? (
                                    <div key={status} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                                        <span className="text-xs font-medium text-gray-600">
                                            {config.label}: <span className="text-gray-900 font-semibold">{count}</span>
                                        </span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                        <p className="text-xs text-gray-500">
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyOPDQueue;
