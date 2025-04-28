// src/views/pilar_pregrado/estudiantes/components/ProcessStage.tsx
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown, FaLightbulb, FaClipboardCheck } from 'react-icons/fa';
import { Button } from '@/components/ui';

interface ProcessStageProps {
    step: number;
    title: string;
    description: string;
    tips?: string[];
    isActive?: boolean;
    isCompleted?: boolean;
}

const ProcessStage: React.FC<ProcessStageProps> = ({
    step,
    title,
    description,
    tips = [],
    isActive = false,
    isCompleted = false
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`mb-4 rounded-xl border ${isActive
            ? 'border-primary dark:border-primary'
            : isCompleted
                ? 'border-success dark:border-success'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
            <div
                className={`px-5 py-4 flex justify-between items-center cursor-pointer ${isActive
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : isCompleted
                        ? 'bg-success/10 dark:bg-success/10'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                            ? 'bg-success text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                        {isCompleted ? (
                            <FaClipboardCheck className="text-sm" />
                        ) : (
                            <span>{step}</span>
                        )}
                    </div>
                    <div>
                        <h4 className={`font-semibold ${isActive ? 'text-primary dark:text-primary' : 'text-gray-900 dark:text-white'}`}>
                            {title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                </div>
                {expanded ? <FaChevronUp className="text-gray-500 dark:text-gray-400" /> : <FaChevronDown className="text-gray-500 dark:text-gray-400" />}
            </div>

            {expanded && (
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    {tips.length > 0 && (
                        <div className="mb-4">
                            <h5 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                                <FaLightbulb className="mr-2 text-yellow-500" /> Consejos útiles
                            </h5>
                            <ul className="list-disc pl-6 space-y-2">
                                {tips.map((tip, index) => (
                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button variant="plain" size="sm">
                            Más información
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessStage;
