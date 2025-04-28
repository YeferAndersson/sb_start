// src/views/pilar_pregrado/estudiantes/components/DownloadableDocument.tsx
import React from 'react';
import { Button } from '@/components/ui';

interface DownloadableDocumentProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBgClass: string;
    iconTextClass: string;
    url?: string;
}

const DownloadableDocument: React.FC<DownloadableDocumentProps> = ({ 
    icon, 
    title, 
    description, 
    iconBgClass, 
    iconTextClass,
    url = "#"
}) => {
    const handleDownload = () => {
        // En un entorno real, aquí iría la lógica para descargar el documento
        // Por ahora, simulamos que abrimos el enlace en una nueva ventana
        if (url !== "#") {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${iconBgClass} ${iconTextClass}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            <Button
                size="sm"
                variant="default"
                className="dark:bg-transparent"
                onClick={handleDownload}
            >
                Descargar
            </Button>
        </div>
    );
};

export default DownloadableDocument;