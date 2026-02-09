import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
    variant?: 'teal' | 'blue';
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    text,
    variant = 'teal'
}) => {
    const colorMap = {
        teal: {
            primary: 'border-t-teal-600',
            secondary: 'border-b-teal-500/40',
            tertiary: 'border-l-teal-400/30',
            dot: 'bg-teal-600',
            shadow: 'rgba(13,148,136,0.6)',
            underlayer: 'teal-500/30'
        },
        blue: {
            primary: 'border-t-[#769FCD]',
            secondary: 'border-b-[#769FCD]/40',
            tertiary: 'border-l-[#D6E6F2]/30',
            dot: 'bg-[#769FCD]',
            shadow: 'rgba(118,159,205,0.6)',
            underlayer: '[#769FCD]/30'
        }
    };

    const colors = colorMap[variant];

    const sizeMap = {
        sm: { box: 'w-6 h-6', border: 'border-2', dot: 'w-1 h-1' },
        md: { box: 'w-12 h-12', border: 'border-[2.5px]', dot: 'w-1.5 h-1.5' },
        lg: { box: 'w-20 h-20', border: 'border-[3px]', dot: 'w-2.5 h-2.5' },
        xl: { box: 'w-28 h-28', border: 'border-4', dot: 'w-4 h-4' }
    };

    const config = sizeMap[size];

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`relative ${config.box}`}>
                {/* Background Ring */}
                <div className={`absolute inset-0 ${config.border} rounded-full border-gray-100/80`} />

                {/* Primary Spining Arc */}
                <div className={`absolute inset-0 ${config.border} rounded-full border-transparent ${colors.primary} animate-[spin_0.8s_linear_infinite]`} />

                {/* Secondary Counter-Spinning Arc */}
                <div className={`absolute inset-2 ${config.border} rounded-full border-transparent ${colors.secondary} animate-[spin_1.2s_linear_infinite_reverse]`} />

                {/* Tertiary Small Accent Arc */}
                <div className={`absolute inset-4 border-[1.5px] rounded-full border-transparent ${colors.tertiary} animate-[spin_2s_linear_infinite]`} />

                {/* Center Glow Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`${config.dot} ${colors.dot} rounded-full shadow-[0_0_12px_${colors.shadow}] animate-pulse`} />
                </div>
            </div>
            {text && (
                <div className="mt-5 flex flex-col items-center">
                    <p className={`font-black text-gray-500 uppercase tracking-[0.25em] ${size === 'sm' ? 'text-[8px]' : 'text-[11px]'}`}>
                        {text}
                    </p>
                    <div className={`h-0.5 w-8 bg-gradient-to-r from-transparent via-${colors.underlayer} to-transparent mt-1.5`} />
                </div>
            )}
        </div>
    );
};

export default Loader;
