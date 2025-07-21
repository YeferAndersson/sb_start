// src/components/shared/AddServiceModal/AddServiceModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import { FaUserGraduate, FaChalkboardTeacher, FaCog, FaTimes } from 'react-icons/fa'

interface AddServiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectService: (serviceType: string) => void
}

const AddServiceModal = ({ isOpen, onClose, onSelectService }: AddServiceModalProps) => {
    const [selectedService, setSelectedService] = useState<string | null>(null)

    const services = [
        {
            id: 'tesista',
            name: 'Tesista Pregrado',
            description: 'Acceso al sistema de gestión de tesis de pregrado',
            icon: <FaUserGraduate className="text-2xl" />,
            color: {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800'
            },
            available: true
        },
        {
            id: 'docente',
            name: 'Docente',
            description: 'Sistema de gestión para docentes y asesores',
            icon: <FaChalkboardTeacher className="text-2xl" />,
            color: {
                bg: 'bg-green-50 dark:bg-green-900/20',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800'
            },
            available: false
        },
        {
            id: 'coordinador',
            name: 'Coordinador',
            description: 'Panel de administración y coordinación académica',
            icon: <FaCog className="text-2xl" />,
            color: {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-200 dark:border-purple-800'
            },
            available: false
        }
    ]

    const handleServiceSelect = (serviceId: string) => {
        if (services.find(s => s.id === serviceId)?.available) {
            setSelectedService(serviceId)
        }
    }

    const handleContinue = () => {
        if (selectedService) {
            onSelectService(selectedService)
            setSelectedService(null)
        }
    }

    const handleClose = () => {
        setSelectedService(null)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} closable={false}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Agregar Nuevo Servicio
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            Selecciona el servicio que deseas agregar a tu cuenta
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                        <FaTimes size={16} />
                    </motion.button>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <AnimatePresence>
                        {services.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className={`
                                    relative cursor-pointer transition-all duration-200
                                    ${service.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                                `}
                                onClick={() => handleServiceSelect(service.id)}
                            >
                                <div
                                    className={`
                                        p-4 rounded-xl border-2 transition-all duration-200 h-full
                                        ${selectedService === service.id 
                                            ? `${service.color.border} ${service.color.bg} shadow-lg` 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }
                                        ${!service.available ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}
                                    `}
                                >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <motion.div
                                            className={`
                                                p-3 rounded-full transition-colors duration-200
                                                ${selectedService === service.id 
                                                    ? `${service.color.bg} ${service.color.text}` 
                                                    : service.available 
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                }
                                            `}
                                            whileHover={service.available ? { scale: 1.1 } : {}}
                                        >
                                            {service.icon}
                                        </motion.div>
                                        
                                        <div>
                                            <h3 className={`
                                                font-semibold text-sm mb-1
                                                ${selectedService === service.id 
                                                    ? service.color.text 
                                                    : service.available 
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-500 dark:text-gray-400'
                                                }
                                            `}>
                                                {service.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {service.description}
                                            </p>
                                        </div>

                                        {!service.available && (
                                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                                Próximamente
                                            </span>
                                        )}

                                        {selectedService === service.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`
                                                    absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center
                                                    ${service.color.bg} ${service.color.text}
                                                `}
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="default"
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="solid"
                            onClick={handleContinue}
                            disabled={!selectedService}
                            className="min-w-24"
                        >
                            Continuar
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </Dialog>
    )
}

export default AddServiceModal