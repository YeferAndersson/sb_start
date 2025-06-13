// src/views/ServicePages/TesistaService/components/DownloadableDocument.tsx - Con animaciones motion
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui';
import { FaDownload, FaFileAlt } from 'react-icons/fa';

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
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        
        // Simular descarga (en un entorno real, aquí iría la lógica para descargar el documento)
        try {
            if (url !== "#") {
                window.open(url, '_blank');
            } else {
                // Simular tiempo de descarga
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            className="group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            layout
        >
            <motion.div
                className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl 
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300
                         hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-md"
                whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                }}
            >
                <div className="flex items-center space-x-3 flex-1">
                    <motion.div
                        className={`p-2 rounded-full ${iconBgClass} ${iconTextClass} group-hover:scale-110`}
                        whileHover={{ 
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.3 }
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {icon}
                    </motion.div>
                    <div className="flex-1">
                        <motion.h4 
                            className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {title}
                        </motion.h4>
                        <motion.p 
                            className="text-sm text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {description}
                        </motion.p>
                    </div>
                </div>
                
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        size="sm"
                        variant="default"
                        className="dark:bg-transparent hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-200"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        <motion.div
                            className="flex items-center space-x-2"
                            animate={isDownloading ? { opacity: [1, 0.5, 1] } : {}}
                            transition={{ repeat: isDownloading ? Infinity : 0, duration: 1 }}
                        >
                            {isDownloading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <FaFileAlt size={14} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ y: -1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FaDownload size={14} />
                                </motion.div>
                            )}
                            <span>{isDownloading ? 'Descargando...' : 'Descargar'}</span>
                        </motion.div>
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default DownloadableDocument;