import React, { useState } from 'react';
import {
    X, CheckCircle, AlertCircle,
    ArrowRight, Loader2, Info
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { appointmentService } from '../../api/appointment.service';
import { useAuth } from '../../hooks/useAuth';

interface StatusUpdateModalProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
    appointment, isOpen, onClose, onSuccess
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmingStatus, setConfirmingStatus] = useState<AppointmentStatus | null>(null);

    if (!isOpen) return null;

    // Backend matching rules
    const ALLOWED_TRANSITIONS: Record<string, AppointmentStatus[]> = {
        WAITING: ['LAB_TESTS', 'COMPLETED', 'CANCELLED'],
        LAB_TESTS: ['REVIEW'],
        REVIEW: ['COMPLETED'],
    };

    const ROLE_PERMISSIONS: Record<string, AppointmentStatus[]> = {
        DOCTOR: ['LAB_TESTS', 'COMPLETED'],
        LAB: ['REVIEW'],
        RECEPTIONIST: ['CANCELLED'],
    };

    const userAllowedStatuses = user?.role ? ROLE_PERMISSIONS[user.role] || [] : [];
    const possibleTransitions = ALLOWED_TRANSITIONS[appointment.status] || [];

    // Final available statuses for this user and this appointment
    const availableStatuses = possibleTransitions.filter(status =>
        userAllowedStatuses.includes(status)
    );

    const handleUpdate = async (status: AppointmentStatus) => {
        try {
            setLoading(true);
            setError(null);
            await appointmentService.updateStatus(appointment.id, status);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const statusConfig: Record<AppointmentStatus, {
        label: string,
        color: string,
        icon: any,
        desc: string
    }> = {
        WAITING: { label: 'Waiting', color: 'yellow', icon: Info, desc: 'Patient is waiting for consultation' },
        LAB_TESTS: { label: 'Lab Tests', color: 'purple', icon: ArrowRight, desc: 'Send patient for laboratory tests' },
        REVIEW: { label: 'Review', color: 'blue', icon: CheckCircle, desc: 'Tests completed, pending doctor review' },
        COMPLETED: { label: 'Completed', color: 'green', icon: CheckCircle, desc: 'Consultation finished' },
        CANCELLED: { label: 'Cancelled', color: 'red', icon: X, desc: 'Cancel this appointment' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-gray-900">Update Status</h3>
                        <p className="text-xs text-gray-500 font-medium">#{appointment.tokenNumber} • {appointment.patient?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-shake">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {!confirmingStatus ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className={`w-2 h-10 rounded-full bg-${statusConfig[appointment.status].color}-500`} />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Current Status</p>
                                    <p className={`font-bold text-${statusConfig[appointment.status].color}-600`}>
                                        {statusConfig[appointment.status].label}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Move To</p>

                            <div className="grid gap-2">
                                {availableStatuses.length > 0 ? (
                                    availableStatuses.map(status => {
                                        const config = statusConfig[status];
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => setConfirmingStatus(status)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-${config.color}-200 hover:bg-${config.color}-50 transition-all group`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 bg-${config.color}-100 text-${config.color}-600 rounded-xl`}>
                                                        <config.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-gray-900">{config.label}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{config.desc}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium italic">No available transitions for your role</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="text-center space-y-3">
                                <div className={`w-16 h-16 bg-${statusConfig[confirmingStatus].color}-100 text-${statusConfig[confirmingStatus].color}-600 rounded-full flex items-center justify-center mx-auto`}>
                                    {React.createElement(statusConfig[confirmingStatus].icon, { className: 'w-8 h-8' })}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">Confirm Status Change</h4>
                                <p className="text-sm text-gray-500 px-4">
                                    Are you sure you want to move this appointment to
                                    <span className={`font-bold text-${statusConfig[confirmingStatus].color}-600`}> {statusConfig[confirmingStatus].label}</span>?
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmingStatus(null)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdate(confirmingStatus)}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3 bg-${statusConfig[confirmingStatus].color}-600 text-white font-bold rounded-2xl hover:bg-${statusConfig[confirmingStatus].color}-700 shadow-lg shadow-${statusConfig[confirmingStatus].color}-100 transition-all flex items-center justify-center gap-2`}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Change'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatusUpdateModal;
