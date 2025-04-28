// src/views/pilar_pregrado/estudiantes/components/InfoCard.tsx
import React from 'react';

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBgClass?: string;
    iconTextClass?: string;
    onClick?: () => void;
    className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
    icon,
    title,
    description,
    iconBgClass = 'bg-gray-100 dark:bg-gray-700',
    iconTextClass = 'text-primary dark:text-primary',
    onClick = () => { },
    className = ''
}) => {
    return (
        <div
            className={`p-5 rounded-xl transition-all duration-300 h-full
        cursor-pointer hover:shadow-lg border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 hover:scale-105 ${className}`}
            onClick={onClick}
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${iconBgClass} ${iconTextClass}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;