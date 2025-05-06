import React, { ReactNode } from 'react';

interface StatsCardProps {
    icon: ReactNode;
    title: string;
    value: string | number;
    actionText?: string;
    onAction?: () => void;
    iconBgColor?: string;
    iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    title,
    value,
    actionText,
    onAction,
    iconBgColor = 'bg-blue-100',
    iconColor = 'text-blue-600'
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
                    {icon}
                </div>
                {actionText && onAction && (
                    <button
                        onClick={onAction}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {actionText}
                    </button>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
};

export default StatsCard;
