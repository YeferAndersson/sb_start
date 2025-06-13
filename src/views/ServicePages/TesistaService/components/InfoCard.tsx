// src/views/ServicePages/TesistaService/components/InfoCard.tsx - Con animaciones motion
import React from 'react';
import { motion } from 'motion/react';

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
        <motion.div
            className={`group ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
            <motion.div
                className={`p-5 rounded-xl transition-all duration-300 h-full
                cursor-pointer border border-gray-200 dark:border-gray-700 
                bg-white dark:bg-gray-800 
                hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30
                group-hover:shadow-xl group-hover:shadow-primary/10`}
                onClick={onClick}
                whileHover={{ 
                    y: -4,
                    transition: { duration: 0.2, ease: "easeOut" }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-start space-x-4">
                    <motion.div
                        className={`p-3 rounded-full ${iconBgClass} ${iconTextClass} group-hover:scale-110`}
                        whileHover={{ 
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.4 }
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {icon}
                    </motion.div>
                    <div className="flex-1">
                        <motion.h3 
                            className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {title}
                        </motion.h3>
                        <motion.p 
                            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {description}
                        </motion.p>
                        
                        {/* Indicador de interacción */}
                        <motion.div
                            className="mt-3 flex items-center text-primary dark:text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span>Explorar</span>
                            <motion.svg
                                className="w-4 h-4 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </motion.svg>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InfoCard;