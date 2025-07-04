// src/components/modals/ProyectoConfirmacionModal.tsx
import { motion, AnimatePresence } from 'motion/react'
import { FaCheckCircle, FaTimes, FaRocket, FaCopy } from 'react-icons/fa'
import { useState } from 'react'

interface ProyectoConfirmacionModalProps {
    isOpen: boolean
    onClose: () => void
    codigoProyecto: string
    onContinuar?: () => void
}

const ProyectoConfirmacionModal = ({
    isOpen,
    onClose,
    codigoProyecto,
    onContinuar
}: ProyectoConfirmacionModalProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(codigoProyecto)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Error copying to clipboard:', error)
        }
    }

    const handleContinuar = () => {
        onContinuar?.()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-4">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FaTimes size={16} />
                            </button>

                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                                    className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                                >
                                    <FaCheckCircle className="text-green-600 dark:text-green-400" size={32} />
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                                >
                                    ¡Felicidades!
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    Tu proyecto de tesis ha sido iniciado exitosamente
                                </motion.p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                        <FaRocket className="text-blue-600 dark:text-blue-400" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                                            Código de Proyecto Generado
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-lg font-bold text-blue-800 dark:text-blue-200">
                                                {codigoProyecto}
                                            </span>
                                            <button
                                                onClick={handleCopyCode}
                                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                                                title="Copiar código"
                                            >
                                                <FaCopy size={14} />
                                            </button>
                                        </div>
                                        {copied && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-xs text-green-600 dark:text-green-400"
                                            >
                                                ¡Copiado al portapapeles!
                                            </motion.span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3 mb-6"
                            >
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    Próximos pasos:
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start space-x-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>Cargar los metadatos de tu proyecto</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>Definir la línea de investigación</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>Asignar asesor principal</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>Subir documentos requeridos</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex space-x-3"
                            >
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleContinuar}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Continuar
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ProyectoConfirmacionModal