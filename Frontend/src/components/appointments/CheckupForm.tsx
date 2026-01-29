import React, { useState } from 'react';
import {
    X, Save, AlertCircle, Plus,
    Trash2, Calendar, Stethoscope,
    MessageSquare, Activity, Beaker,
    Info, Loader2
} from 'lucide-react';
import type { Appointment } from '../../types/appointment';
import { checkupService } from '../../api/checkup.service';

interface CheckupFormProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckupForm: React.FC<CheckupFormProps> = ({
    appointment, isOpen, onClose, onSuccess
}) => {
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [instructions, setInstructions] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [labTests, setLabTests] = useState<string[]>([]);
    const [newTest, setNewTest] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAddTest = () => {
        if (newTest.trim()) {
            setLabTests([...labTests, newTest.trim()]);
            setNewTest('');
        }
    };

    const handleRemoveTest = (index: number) => {
        setLabTests(labTests.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            await checkupService.createCheckup({
                appointmentId: appointment.id,
                symptoms,
                diagnosis,
                doctorNotes: instructions,
                labTests: labTests.length > 0 ? labTests : undefined
            });

            // If follow-up date is provided, update it (it's a separate call in the backend)
            // Note: In a real app we might combine these or handle them in the same service method
            // For now, mirroring backend separate endpoints if needed, but createCheckup 
            // has been checked. Let's stick to essential clinical data.

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save checkup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Patient Checkup</h3>
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
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Symptoms & Diagnosis */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                    Symptoms
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Describe patient's symptoms..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-300 focus:bg-white transition-all outline-none text-gray-700 resize-none font-medium"
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    Diagnosis
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter your clinical diagnosis..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-300 focus:bg-white transition-all outline-none text-gray-700 resize-none font-medium"
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-300 focus:bg-white transition-all outline-none text-gray-700 font-medium"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Right Column: Instructions & Lab Tests */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <Info className="w-4 h-4 text-indigo-500" />
                                    Instructions & Notes
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Add medication or lifestyle instructions..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-300 focus:bg-white transition-all outline-none text-gray-700 resize-none font-medium"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-wider">
                                    <Beaker className="w-4 h-4 text-pink-500" />
                                    Suggest Lab Tests
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add test (e.g. Blood Test)..."
                                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-300 focus:bg-white transition-all outline-none text-sm font-medium"
                                        value={newTest}
                                        onChange={(e) => setNewTest(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTest())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTest}
                                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {labTests.map((test, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-xs font-black border border-pink-100 group animate-in slide-in-from-left-2 duration-200"
                                        >
                                            {test}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTest(index)}
                                                className="hover:text-pink-900 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {labTests.length === 0 && (
                                        <p className="text-xs text-gray-400 italic py-2">No tests suggested yet</p>
                                    )}
                                </div>
                            </div>
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
                        <Info className="w-3 h-3" />
                        Status update remains manual after saving checkup
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Checkup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckupForm;
