import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    isOpen: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isOpen, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-800',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-800',
            icon: <AlertCircle className="w-5 h-5 text-red-500" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-500" />
        }
    };

    const currentStyle = styles[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className={`${currentStyle.bg} ${currentStyle.border} border shadow-xl shadow-gray-200/50 rounded-2xl p-4 flex items-center gap-3 min-w-[320px] max-w-[450px]`}>
                        <div className="flex-shrink-0">
                            {currentStyle.icon}
                        </div>
                        <p className={`flex-grow font-medium text-sm ${currentStyle.text}`}>
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const useToast = () => {
    const [toast, setToast] = useState<{ message: string; type: ToastType; isOpen: boolean }>({
        message: '',
        type: 'info',
        isOpen: false
    });

    const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type, isOpen: true });
    }, []);

    const hideToast = React.useCallback(() => {
        setToast(prev => ({ ...prev, isOpen: false }));
    }, []);

    return { toast, showToast, hideToast };
};
