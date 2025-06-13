// src/views/ServicePages/TesistaService/components/ProcessStage.tsx - Con animaciones motion
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaChevronUp, FaChevronDown, FaLightbulb, FaClipboardCheck, FaInfoCircle } from 'react-icons/fa';
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

    const getStatusColors = () => {
        if (isActive) {
            return {
                border: 'border-primary dark:border-primary',
                bg: 'bg-gray-100 dark:bg-gray-700',
                text: 'text-primary dark:text-primary',
                circle: 'bg-primary text-white'
            };
        } else if (isCompleted) {
            return {
                border: 'border-success dark:border-success',
                bg: 'bg-success/10 dark:bg-success/10',
                text: 'text-success dark:text-success',
                circle: 'bg-success text-white'
            };
        } else {
            return {
                border: 'border-gray-200 dark:border-gray-700',
                bg: 'bg-white dark:bg-gray-800',
                text: 'text-gray-900 dark:text-white',
                circle: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            };
        }
    };

    const colors = getStatusColors();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="group"
            layout
        >
            <motion.div
                className={`mb-4 rounded-xl border-2 ${colors.border} overflow-hidden
                           hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300`}
                whileHover={{ scale: 1.01 }}
            >
                <motion.div
                    className={`px-5 py-4 flex justify-between items-center cursor-pointer ${colors.bg}`}
                    onClick={() => setExpanded(!expanded)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="flex items-center space-x-3">
                        <motion.div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${colors.circle}`}
                            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                        >
                            {isCompleted ? (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", duration: 0.6 }}
                                >
                                    <FaClipboardCheck className="text-sm" />
                                </motion.div>
                            ) : (
                                <motion.span
                                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                                >
                                    {step}
                                </motion.span>
                            )}
                        </motion.div>
                        <div>
                            <motion.h4
                                className={`font-semibold ${colors.text}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {title}
                            </motion.h4>
                            <motion.p
                                className="text-sm text-gray-600 dark:text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {description}
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-500 dark:text-gray-400"
                    >
                        <FaChevronDown />
                    </motion.div>
                </motion.div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                exit={{ y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="px-5 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
                            >
                                {/* Estado actual */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-4"
                                >
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        isCompleted 
                                            ? 'bg-success/20 text-success dark:bg-success/20 dark:text-success' 
                                            : isActive 
                                                ? 'bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary'
                                                : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                    }`}>
                                        <motion.div
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={{
                                                backgroundColor: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--gray-400)'
                                            }}
                                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                                        />
                                        {isCompleted ? 'Completado' : isActive ? 'En proceso' : 'Pendiente'}
                                    </div>
                                </motion.div>

                                {/* Información adicional */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                                >
                                    <div className="flex space-x-2">
                                        <FaInfoCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={14} />
                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                            <p className="font-medium mb-1">Información de la etapa:</p>
                                            <p>
                                                {isCompleted 
                                                    ? 'Esta etapa ha sido completada exitosamente.' 
                                                    : isActive 
                                                        ? 'Esta es tu etapa actual en el proceso de tesis.'
                                                        : 'Esta etapa se habilitará una vez que completes las etapas anteriores.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Consejos útiles */}
                                {tips.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-4"
                                    >
                                        <h5 className="font-semibold mb-2 flex items-center text-gray-800 dark:text-gray-200">
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <FaLightbulb className="mr-2 text-yellow-500" />
                                            </motion.div>
                                            Consejos útiles
                                        </h5>
                                        <ul className="list-disc pl-6 space-y-2">
                                            {tips.map((tip, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + index * 0.1 }}
                                                    className="text-gray-700 dark:text-gray-300 text-sm"
                                                >
                                                    {tip}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                {/* Botones de acción */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex justify-end space-x-2"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="plain" size="sm">
                                            Más información
                                        </Button>
                                    </motion.div>
                                    
                                    {isActive && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button variant="solid" size="sm">
                                                Continuar
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default ProcessStage;