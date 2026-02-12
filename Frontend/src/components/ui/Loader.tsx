import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
    variant?: 'teal' | 'blue' | 'indigo';
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    text = "Loading...",
    variant = 'indigo'
}) => {
    // Professional Clinical Palette
    const colors = {
        indigo: { primary: '#4F46E5', track: '#EEF2FF', shadow: 'rgba(79, 70, 229, 0.1)' },
        teal: { primary: '#0D9488', track: '#F0FDFA', shadow: 'rgba(13, 148, 136, 0.1)' },
        blue: { primary: '#2563EB', track: '#EFF6FF', shadow: 'rgba(37, 99, 235, 0.1)' }
    };

    const theme = colors[variant as keyof typeof colors] || colors.indigo;

    const sizeMap = {
        sm: { dim: 24, iconSize: 16, font: 'text-[10px]' },
        md: { dim: 48, iconSize: 32, font: 'text-[12px]' },
        lg: { dim: 64, iconSize: 44, font: 'text-[14px]' },
    };

    const { dim, iconSize, font } = sizeMap[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-5 ${className}`}>
            <div className="relative group" style={{ width: dim, height: dim }}>
                {/* Background Shadow Pulse */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ backgroundColor: theme.primary }}
                />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-indigo-600"
                        style={{ color: theme.primary }}
                    >
                        <svg
                            width={iconSize}
                            height={iconSize}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {/* Static Track Background */}
                            <path
                                d="M22 12h-4l-3 9L9 3l-3 9H2"
                                className="opacity-20"
                            />
                            {/* Animated Heartbeat Path */}
                            <motion.path
                                d="M22 12h-4l-3 9L9 3l-3 9H2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1],
                                    opacity: [0, 1, 0],
                                    pathOffset: [0, 0, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    times: [0, 0.5, 1]
                                }}
                            />
                        </svg>
                    </motion.div>
                </div>
            </div>

            {text && (
                <div className="flex flex-col items-center gap-1.5">
                    <span className={`${font} font-bold text-gray-400 uppercase tracking-[0.3em]`}>
                        {text}
                    </span>
                    <motion.div
                        animate={{ width: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-[1.5px] rounded-full opacity-40"
                        style={{ backgroundColor: theme.primary }}
                    />
                </div>
            )}
        </div>
    );
};

export default Loader;
