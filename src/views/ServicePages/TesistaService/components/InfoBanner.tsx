import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui';
import { FaInfoCircle, FaArrowRight, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface InfoBannerProps {
    title?: string;
    description: string;
    actionText?: string;
    actionUrl: string;
    className?: string;
    type?: 'info' | 'warning' | 'success' | 'error';
}

const InfoBanner: React.FC<InfoBannerProps> = ({
    title = 'Información importante',
    description,
    actionText = 'Empezar',
    actionUrl,
    className = '',
    type = 'info'
}) => {
    const navigate = useNavigate();

    const handleAction = () => {
        if (actionUrl) {
            navigate(actionUrl);
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    icon: 'text-yellow-500',
                    title: 'text-yellow-800 dark:text-yellow-300',
                    text: 'text-yellow-700 dark:text-yellow-300'
                };
            case 'success':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    icon: 'text-green-500',
                    title: 'text-green-800 dark:text-green-300',
                    text: 'text-green-700 dark:text-green-300'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-800',
                    icon: 'text-red-500',
                    title: 'text-red-800 dark:text-red-300',
                    text: 'text-red-700 dark:text-red-300'
                };
            default: // info
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    icon: 'text-blue-500',
                    title: 'text-blue-800 dark:text-blue-300',
                    text: 'text-blue-700 dark:text-blue-300'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-6 ${className}`}
        >
            <motion.div
                className={`${styles.bg} border ${styles.border} rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                           hover:shadow-md transition-shadow duration-300`}
                whileHover={{ scale: 1.01 }}
                layout
            >
                <div className="flex space-x-3 flex-1">
                    <motion.div
                        className={`${styles.icon} flex-shrink-0 mt-1`}
                        animate={{ 
                            rotate: [0, -5, 5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "easeInOut"
                        }}
                    >
                        <FaBell size={20} />
                    </motion.div>
                    <div className="flex-1">
                        <motion.h3
                            className={`font-semibold ${styles.title} mb-1`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {title}
                        </motion.h3>
                        <motion.p
                            className={`${styles.text} text-sm leading-relaxed`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {description}
                        </motion.p>
                    </div>
                </div>

                {/* Botón de acción */}
                {actionText && actionUrl && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={handleAction}
                            className="whitespace-nowrap bg-primary hover:bg-primary-deep text-white 
                                     dark:bg-primary dark:hover:bg-primary-deep 
                                     flex items-center gap-2 group"
                        >
                            <span>{actionText}</span>
                            <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                            >
                                <FaArrowRight size={14} />
                            </motion.div>
                        </Button>
                    </motion.div>
                )}

                {/* Indicador de progreso (decorativo) */}
                <motion.div
                    className="hidden sm:block w-1 h-12 bg-gradient-to-b from-primary to-primary-deep rounded-full opacity-20"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                />
            </motion.div>
        </motion.div>
    );
};

export default InfoBanner;