import React from 'react';
import { FiZap, FiCpu, FiTarget, FiEye, FiActivity, FiLayers } from 'react-icons/fi';

interface ModeVisualIndicatorProps {
    mode: 'none' | 'generic' | 'prism';
    variant?: 'badge' | 'banner' | 'icon' | 'accent';
    showDescription?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const MODE_CONFIG = {
    none: {
        color: 'gray',
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-800',
        borderClass: 'border-gray-300',
        accentClass: 'bg-gray-500',
        icon: FiZap,
        label: 'Basic',
        description: 'Simple similarity matching',
        gradient: 'from-gray-400 to-gray-600'
    },
    generic: {
        color: 'blue',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800',
        borderClass: 'border-blue-300',
        accentClass: 'bg-blue-500',
        icon: FiCpu,
        label: 'AI Analysis',
        description: 'Balanced AI-powered analysis',
        gradient: 'from-blue-400 to-blue-600'
    },
    prism: {
        color: 'indigo',
        bgClass: 'bg-indigo-100',
        textClass: 'text-indigo-800',
        borderClass: 'border-indigo-300',
        accentClass: 'bg-indigo-500',
        icon: FiTarget,
        label: 'PRISM',
        description: 'Comprehensive PRISM framework',
        gradient: 'from-indigo-400 to-purple-600'
    }
};

const SIZE_CONFIG = {
    sm: {
        iconSize: 14,
        textSize: 'text-xs',
        padding: 'px-2 py-1',
        spacing: 'gap-1'
    },
    md: {
        iconSize: 16,
        textSize: 'text-sm',
        padding: 'px-3 py-2',
        spacing: 'gap-2'
    },
    lg: {
        iconSize: 20,
        textSize: 'text-base',
        padding: 'px-4 py-3',
        spacing: 'gap-3'
    }
};

export const ModeVisualIndicator: React.FC<ModeVisualIndicatorProps> = ({
    mode,
    variant = 'badge',
    showDescription = false,
    size = 'md'
}) => {
    const config = MODE_CONFIG[mode];
    const sizeConfig = SIZE_CONFIG[size];
    const IconComponent = config.icon;

    switch (variant) {
        case 'badge':
            return (
                <div className={`inline-flex items-center ${sizeConfig.spacing} ${sizeConfig.padding} rounded-full ${config.bgClass} ${config.textClass} font-medium ${sizeConfig.textSize}`}>
                    <IconComponent size={sizeConfig.iconSize} />
                    <span>{config.label}</span>
                    {showDescription && (
                        <span className="opacity-75">• {config.description}</span>
                    )}
                </div>
            );

        case 'banner':
            return (
                <div className={`flex items-center ${sizeConfig.spacing} p-4 rounded-lg border-2 ${config.borderClass} ${config.bgClass}`}>
                    <div className={`p-2 rounded-full ${config.accentClass} text-white`}>
                        <IconComponent size={sizeConfig.iconSize} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${config.textClass} ${sizeConfig.textSize}`}>
                            {config.label} Mode Active
                        </h3>
                        {showDescription && (
                            <p className={`${sizeConfig.textSize} ${config.textClass} opacity-75 mt-1`}>
                                {config.description}
                            </p>
                        )}
                    </div>
                </div>
            );

        case 'icon':
            return (
                <div className={`inline-flex items-center justify-center p-2 rounded-lg ${config.bgClass}`}>
                    <IconComponent size={sizeConfig.iconSize} color={config.accentClass.replace('bg-', '#')} />
                </div>
            );

        case 'accent':
            return (
                <div className={`w-1 h-full bg-gradient-to-b ${config.gradient} rounded-full`} />
            );

        default:
            return null;
    }
};

// Mode-specific visual themes for larger components
export const getModeTheme = (mode: 'none' | 'generic' | 'prism') => {
    const config = MODE_CONFIG[mode];
    return {
        primary: config.accentClass,
        background: config.bgClass,
        text: config.textClass,
        border: config.borderClass,
        gradient: config.gradient,
        icon: config.icon
    };
};

// Visual feedback animations based on mode
export const ModeTransition: React.FC<{ 
    mode: 'none' | 'generic' | 'prism'; 
    children: React.ReactNode;
    className?: string;
}> = ({ mode, children, className = '' }) => {
    const config = MODE_CONFIG[mode];
    
    return (
        <div 
            className={`transition-all duration-500 ease-in-out ${className}`}
            style={{
                borderLeftColor: config.accentClass.includes('gray') ? '#6B7280' : 
                                config.accentClass.includes('blue') ? '#3B82F6' : '#6366F1'
            }}
        >
            {children}
        </div>
    );
};

// Mode-specific loading states
export const ModeLoadingSpinner: React.FC<{ mode: 'none' | 'generic' | 'prism' }> = ({ mode }) => {
    const config = MODE_CONFIG[mode];
    
    return (
        <div className="flex items-center gap-3">
            <div className={`animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-2`}
                 style={{ borderTopColor: config.accentClass.includes('gray') ? '#6B7280' : 
                                         config.accentClass.includes('blue') ? '#3B82F6' : '#6366F1' }}>
            </div>
            <span className={`${config.textClass} text-sm font-medium`}>
                {mode === 'none' ? 'Basic analysis...' :
                 mode === 'generic' ? 'AI processing...' :
                 'PRISM evaluation...'}
            </span>
        </div>
    );
};

// Mode-specific success/error states
export const ModeStatusIndicator: React.FC<{ 
    mode: 'none' | 'generic' | 'prism';
    status: 'success' | 'warning' | 'error';
    message: string;
}> = ({ mode, status, message }) => {
    const config = MODE_CONFIG[mode];
    
    const statusConfig = {
        success: { icon: FiTarget, bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
        warning: { icon: FiActivity, bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
        error: { icon: FiLayers, bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
    };
    
    const StatusIcon = statusConfig[status].icon;
    
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusConfig[status].bg} ${statusConfig[status].border}`}>
            <StatusIcon size={16} color={statusConfig[status].text.includes('green') ? '#15803d' : 
                                         statusConfig[status].text.includes('yellow') ? '#a16207' : '#dc2626'} />
            <div>
                <span className={`font-medium ${statusConfig[status].text}`}>
                    {config.label} Mode {status === 'success' ? 'Complete' : status === 'warning' ? 'Warning' : 'Error'}
                </span>
                <p className={`text-sm ${statusConfig[status].text} opacity-75`}>{message}</p>
            </div>
        </div>
    );
}; 