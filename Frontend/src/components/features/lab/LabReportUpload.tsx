import React, { useState, useRef } from 'react';
import {
    X, Upload, FileText, CheckCircle,
    AlertCircle, Loader2, Trash2,
    FileUp
} from 'lucide-react';
import { labService } from '../../../api/lab.service';
import type { LabTest } from '../../../types/lab';

interface LabReportUploadProps {
    labTest: LabTest;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const LabReportUpload: React.FC<LabReportUploadProps> = ({
    labTest, isOpen, onClose, onSuccess
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const pdfs = files.filter(f => f.type === 'application/pdf');

            if (pdfs.length !== files.length) {
                setError('Only PDF files are allowed');
            } else {
                setError(null);
            }

            setSelectedFiles(prev => [...prev, ...pdfs]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one PDF file');
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setProgress(0);

            await labService.uploadReport(labTest.id, selectedFiles, (p) => {
                setProgress(p);
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload reports');
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Upload Lab Report</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                            {labTest.testType} • Patient: {labTest.patient?.name || labTest.patientId}
                        </p>
                    </div>
                    {!uploading && (
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-12 space-y-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-black text-gray-900">Upload Successful!</h4>
                            <p className="text-gray-500 font-medium px-8">
                                Reports have been saved and lab test status updated to completed.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Dropzone */}
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={`
                                    relative border-4 border-dashed rounded-4xl p-10 text-center transition-all cursor-pointer
                                    ${uploading ? 'opacity-50 pointer-events-none' : 'hover:bg-blue-50/50 hover:border-blue-200 border-gray-100'}
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf"
                                    multiple
                                    onChange={handleFileChange}
                                />
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <FileUp className="w-8 h-8" />
                                </div>
                                <p className="text-lg font-black text-gray-900">Click to select PDF reports</p>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Multiple files supported</p>
                            </div>

                            {/* File List */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Selected Files ({selectedFiles.length})</p>
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group animate-in slide-in-from-left duration-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="max-w-[200px] truncate">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            {!uploading && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm font-black">{error}</p>
                                </div>
                            )}

                            {uploading && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Uploading Reports...
                                        </p>
                                        <p className="text-lg font-black text-blue-600">{progress}%</p>
                                    </div>
                                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-300 shadow-lg shadow-blue-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex gap-4">
                        <button
                            disabled={uploading}
                            onClick={onClose}
                            className="flex-1 px-8 py-4 text-gray-600 font-black rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={uploading || selectedFiles.length === 0}
                            onClick={handleUpload}
                            className="flex-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            Start Upload
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabReportUpload;
