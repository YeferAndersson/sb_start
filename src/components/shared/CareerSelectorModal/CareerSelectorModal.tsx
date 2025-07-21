// src/components/shared/CareerSelectorModal/CareerSelectorModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import { FaUserGraduate, FaTimes, FaCheck } from 'react-icons/fa'

interface CareerOption {
    id: number
    tesistaId: number
    codigo_estudiante: string
    carrera: {
        id: number
        nombre: string
        facultad?: {
            nombre: string
            abreviatura: string
        }
    }
}

interface CareerSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    careers: CareerOption[]
    onSelectCareer: (careerData: CareerOption) => void
}

const CareerSelectorModal = ({ isOpen, onClose, careers, onSelectCareer }: CareerSelectorModalProps) => {
    const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null)

    const handleClose = () => {
        setSelectedCareer(null)
        onClose()
    }

    const handleCareerSelect = (career: CareerOption) => {
        setSelectedCareer(career)
    }

    const handleConfirm = () => {
        if (selectedCareer) {
            onSelectCareer(selectedCareer)
            handleClose()
        }
    }

    const getCareerDisplayInfo = (career: CareerOption) => {
        const facultadInfo = career.carrera.facultad
            ? `${career.carrera.facultad.abreviatura} - ${career.carrera.facultad.nombre}`
            : 'Facultad no especificada'

        return {
            carreraNombre: career.carrera.nombre,
            facultadInfo,
            codigo: career.codigo_estudiante,
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} closable={false} width={520}>
            {/* Contenido sin motion.div duplicado */}
            <div className='p-6'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-3'>
                        <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400'>
                            <FaUserGraduate size={20} />
                        </div>
                        <div>
                            <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Seleccionar Carrera</h2>
                            <p className='text-gray-600 dark:text-gray-400 text-sm'>
                                Tienes múltiples carreras, selecciona una para continuar
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200'>
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Careers List */}
                <div className='space-y-3 mb-6 max-h-80 overflow-y-auto overflow-x-hidden pr-1'>
                    <AnimatePresence>
                        {careers.map((career, index) => {
                            const displayInfo = getCareerDisplayInfo(career)
                            const isSelected = selectedCareer?.id === career.id

                            return (
                                <motion.div
                                    key={`${career.carrera.id}-${career.codigo_estudiante}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`
                                relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 transform-gpu
                                hover:shadow-md hover:-translate-y-0.5
                                ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                                }
                            `}
                                    onClick={() => handleCareerSelect(career)}>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1 min-w-0 pr-8'>
                                            <div className='flex items-start space-x-3'>
                                                <div
                                                    className={`
                                                flex-shrink-0 p-2 rounded-lg transition-all duration-200
                                                ${
                                                    isSelected
                                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                }
                                            `}>
                                                    <FaUserGraduate size={16} />
                                                </div>

                                                <div className='flex-1 min-w-0'>
                                                    <h3
                                                        className={`
                                                    font-semibold text-sm mb-1 leading-tight truncate
                                                    ${
                                                        isSelected
                                                            ? 'text-blue-900 dark:text-blue-100'
                                                            : 'text-gray-900 dark:text-white'
                                                    }
                                                `}>
                                                        {displayInfo.carreraNombre}
                                                    </h3>

                                                    <p
                                                        className={`
                                                    text-xs mb-2 leading-relaxed line-clamp-2
                                                    ${
                                                        isSelected
                                                            ? 'text-blue-700 dark:text-blue-300'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }
                                                `}>
                                                        {displayInfo.facultadInfo}
                                                    </p>

                                                    <div className='flex items-center'>
                                                        <span
                                                            className={`
                                                        text-xs font-medium px-2 py-1 rounded-full truncate
                                                        ${
                                                            isSelected
                                                                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }
                                                    `}>
                                                            Código: {displayInfo.codigo}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', duration: 0.3 }}
                                                className='absolute top-3 right-3 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center'>
                                                <FaCheck size={12} />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Info Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                    <p className='text-blue-700 dark:text-blue-300 text-xs leading-relaxed'>
                        💡 <strong>Tip:</strong> Podrás cambiar de carrera en cualquier momento desde el panel de
                        tesista. La carrera seleccionada determinará el contexto de tus trámites de tesis.
                    </p>
                </motion.div>

                {/* Footer */}
                <div className='flex justify-end space-x-3'>
                    <Button
                        variant='default'
                        onClick={handleClose}
                        className='transition-all duration-200 hover:shadow-md'>
                        Cancelar
                    </Button>

                    <Button
                        variant='solid'
                        onClick={handleConfirm}
                        disabled={!selectedCareer}
                        className='min-w-24 transition-all duration-200 hover:shadow-md'>
                        Continuar
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default CareerSelectorModal
