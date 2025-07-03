// src/components/shared/SuccessNotificationModal/SuccessNotificationModal.tsx
import { motion } from 'motion/react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import { FaCheck, FaUserGraduate, FaArrowRight } from 'react-icons/fa'

interface SuccessNotificationModalProps {
    isOpen: boolean
    onClose: () => void
    onGoToService: () => void
    title: string
    message: string
    serviceInfo: {
        careerName: string
        studentCode: string
        isFirstCareer: boolean
    }
}

const SuccessNotificationModal = ({ 
    isOpen, 
    onClose, 
    onGoToService, 
    title, 
    message, 
    serviceInfo 
}: SuccessNotificationModalProps) => {
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose} closable={false}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, type: "spring" }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-center"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                </motion.div>

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                >
                    {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 dark:text-gray-400 mb-6"
                >
                    {message}
                </motion.p>

                {/* Service Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
                >
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                            <FaUserGraduate size={16} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                                Servicio Tesista Agregado
                            </h3>
                            {serviceInfo.isFirstCareer && (
                                <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                    Primera carrera
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 dark:text-blue-400">Carrera:</span>
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                {serviceInfo.careerName}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-600 dark:text-blue-400">Código:</span>
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                {serviceInfo.studentCode}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex space-x-3"
                >
                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                    >
                        <Button
                            variant="default"
                            onClick={onClose}
                            className="w-full"
                        >
                            Cerrar
                        </Button>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                    >
                        <Button
                            variant="solid"
                            onClick={onGoToService}
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 flex items-center justify-center space-x-2"
                        >
                            <span>Ir al Panel</span>
                            <FaArrowRight size={12} />
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Confetti Effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                        }}
                        className="w-full h-full bg-green-400 rounded-full"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute -top-1 -right-3 w-3 h-3 bg-blue-400 rounded-full"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.7, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2.5,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                        className="w-full h-full bg-blue-400 rounded-full"
                    />
                </motion.div>
            </motion.div>
        </Dialog>
    )
}

export default SuccessNotificationModal