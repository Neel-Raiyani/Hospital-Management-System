import React, { useState, useEffect } from 'react';
import {
    X, Save, AlertCircle, Plus,
    Trash2, Pill, ClipboardList,
    FileText, Loader2, Download
} from 'lucide-react';
import type { Appointment } from '../../../types/appointment';
import type { Medicine } from '../../../types/prescription';
import { prescriptionService } from '../../../api/prescription.service';
import type { Prescription } from '../../../types/prescription';

interface PrescriptionFormProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
    appointment, isOpen, onClose, onSuccess
}) => {
    const [existingPrescription, setExistingPrescription] = useState<Prescription | null>(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([
        { name: '', dose: '', duration: '' }
    ]);
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchExisting = async () => {
            if (isOpen && appointment.id) {
                try {
                    setLoading(true);
                    const rx = await prescriptionService.getPrescriptionByAppointment(appointment.id);
                    if (rx) {
                        setExistingPrescription(rx);
                        setDiagnosis(rx.diagnosis || '');
                        setInstructions(rx.instructions || '');
                        if (Array.isArray(rx.medicines)) {
                            setMedicines(rx.medicines as Medicine[]);
                        }
                        setPrescriptionId(rx.id);
                    }
                } catch (err) {
                    console.log('No existing prescription found');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchExisting();
    }, [isOpen, appointment.id]);

    if (!isOpen) return null;

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dose: '', duration: '' }]);
    };

    const handleRemoveMedicine = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const hasEmptyMedicines = medicines.some(m => !m.name.trim() || !m.dose.trim() || !m.duration.trim());
        if (hasEmptyMedicines) {
            setError('Please fill in all medicine details or remove empty rows');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let result;
            if (existingPrescription) {
                result = await prescriptionService.updatePrescription(existingPrescription.id, {
                    diagnosis,
                    medicines,
                    instructions
                });
            } else {
                result = await prescriptionService.createPrescription({
                    appointmentId: appointment.id,
                    diagnosis,
                    medicines,
                    instructions
                });
            }

            if (result && result.id) {
                setPrescriptionId(result.id);
                onSuccess();
                // Auto-close after successful update
                if (existingPrescription) {
                    setTimeout(() => onClose(), 500);
                }
            } else {
                throw new Error('Failed to get saved prescription details');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (prescriptionId) {
            try {
                await prescriptionService.downloadPrescription(prescriptionId);
            } catch (err) {
                console.error('Failed to download prescription:', err);
                setError('Failed to download PDF. Please try again.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                {existingPrescription ? 'Update Prescription' : 'Prescription'}
                            </h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                #{appointment.tokenNumber} • {appointment.patient?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-8 space-y-8">
                        {/* Diagnosis */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                <FileText className="w-4 h-4 text-blue-500" />
                                Diagnosis (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Enter diagnosis..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-300 focus:bg-white transition-all outline-none text-gray-700 font-medium"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                            />
                        </div>

                        {/* Medicines Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <Pill className="w-4 h-4 text-orange-500" />
                                    Medicines
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddMedicine}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-xs font-black transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Medicine
                                </button>
                            </div>

                            <div className="space-y-3">
                                {medicines.map((med, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 animate-in slide-in-from-left-2 duration-200"
                                    >
                                        <div className="md:col-span-5">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none text-sm font-medium"
                                                value={med.name}
                                                onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Dose (e.g. 1-0-1)"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none text-sm font-medium"
                                                value={med.dose}
                                                onChange={(e) => handleMedicineChange(index, 'dose', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                placeholder="Duration (e.g. 5 days)"
                                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 outline-none text-sm font-medium"
                                                value={med.duration}
                                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedicine(index)}
                                                disabled={medicines.length === 1}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                <ClipboardList className="w-4 h-4 text-purple-500" />
                                Instructions & Diet
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Any specific instructions for the patient..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-300 focus:bg-white transition-all outline-none text-gray-700 resize-none font-medium"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mx-8 mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-black">{error}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        {prescriptionId ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-black">
                                <Save className="w-3 h-3" />
                                {existingPrescription ? 'Changes saved successfully' : 'Prescription saved successfully'}
                            </span>
                        ) : (
                            'Status update remains manual after saving'
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all font-mono uppercase tracking-widest text-xs"
                        >
                            {prescriptionId ? 'Close' : 'Cancel'}
                        </button>

                        {prescriptionId && (
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="px-10 py-4 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-100 shadow-lg shadow-blue-50 transition-all flex items-center gap-2 active:scale-95 font-mono uppercase tracking-widest text-xs"
                            >
                                <Download className="w-5 h-5" />
                                Download PDF
                            </button>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 font-mono uppercase tracking-widest text-xs"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {existingPrescription || (prescriptionId && !existingPrescription) ? 'Update RX' : 'Save Prescription'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionForm;
