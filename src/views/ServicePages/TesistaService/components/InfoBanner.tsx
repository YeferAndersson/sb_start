import React from 'react';
import { Button } from '@/components/ui';
import { FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface InfoBannerProps {
    title?: string;
    description: string;
    actionText?: string;
    actionUrl: string;
    className?: string;
}

const InfoBanner: React.FC<InfoBannerProps> = ({
    title = 'Información importante',
    description,
    actionText = 'Empezar',
    actionUrl,
    className = ''
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        navigate(actionUrl);
    };

    return (
        <div className={`mb-6 ${className}`}>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex space-x-3">
                    <FaInfoCircle className="text-primary flex-shrink-0 mt-1" size={20} />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {description}
                        </p>
                    </div>
                </div>
                <Button
                    variant="underline"
                    size="sm"
                    onClick={handleAction}
                    className="whitespace-nowrap dark:hover:opacity-90 flex items-center gap-2"
                >
                    {actionText}
                    <FaArrowRight size={14} />
                </Button>
            </div>
        </div>
    );
};

export default InfoBanner;