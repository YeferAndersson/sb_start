// src/views/Pilar/Pregrado/Estudiantes/Etapa1/Completar.tsx
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Container from '@/components/shared/Container'
import { FaTools, FaArrowLeft } from 'react-icons/fa'

const Completar = () => {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Container>
                <div className="max-w-2xl mx-auto text-center py-16">
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <FaTools className="text-yellow-600 dark:text-yellow-400" size={40} />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Etapa 1: Completar Proyecto
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            Esta sección está en desarrollo
                        </p>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Próximamente disponible:
                            </h3>
                            <ul className="text-left text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Carga de metadatos del proyecto</li>
                                <li>• Selección de línea de investigación</li>
                                <li>• Asignación de asesor principal</li>
                                <li>• Upload de documentos requeridos</li>
                            </ul>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/servicio/tesista')}
                            className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <FaArrowLeft size={16} />
                            <span>Volver al Panel Principal</span>
                        </motion.button>
                    </motion.div>
                </div>
            </Container>
        </motion.div>
    )
}

export default Completar