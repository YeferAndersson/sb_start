// src/components/modals/ValidarCompaneroModal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Spinner from '@/components/ui/Spinner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaUsers, FaTimes, FaCheck, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa'
import { validarCompanero, type ValidarCompaneroData, type CompaneroValidado } from '@/services/TramiteService'

interface ValidarCompaneroModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (companeroData: CompaneroValidado) => void
    idEstructuraAcademica: number
}

type ValidarCompaneroSchema = {
    codigoMatricula: string
    dniCompanero: string
}

const validationSchema = z.object({
    codigoMatricula: z
        .string()
        .min(6, { message: 'El código debe tener al menos 6 caracteres' })
        .max(10, { message: 'El código debe tener máximo 10 caracteres' })
        .regex(/^\d+$/, { message: 'El código debe contener solo números' }),
    dniCompanero: z
        .string()
        .min(8, { message: 'El DNI debe tener al menos 8 caracteres' })
        .max(12, { message: 'El DNI debe tener máximo 12 caracteres' })
        .regex(/^\d+$/, { message: 'El DNI debe contener solo números' }),
})

const ValidarCompaneroModal = ({ isOpen, onClose, onSuccess, idEstructuraAcademica }: ValidarCompaneroModalProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [companeroData, setCompaneroData] = useState<CompaneroValidado | null>(null)

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<ValidarCompaneroSchema>({
        resolver: zodResolver(validationSchema),
    })

    const handleClose = () => {
        reset()
        setError(null)
        setShowSuccess(false)
        setCompaneroData(null)
        onClose()
    }

    const onSubmit = async (values: ValidarCompaneroSchema) => {
        setSubmitting(true)
        setError(null)

        try {
            console.log('🔍 Validando compañero:', values)

            const validarData: ValidarCompaneroData = {
                codigoMatricula: values.codigoMatricula,
                dniCompanero: values.dniCompanero,
                idEstructuraAcademica,
            }

            const companeroValidado = await validarCompanero(validarData)

            setCompaneroData(companeroValidado)
            setShowSuccess(true)

            console.log('✅ Compañero validado exitosamente:', companeroValidado)
        } catch (error) {
            console.error('❌ Error validando compañero:', error)
            setError((error as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirm = () => {
        if (companeroData) {
            onSuccess(companeroData)
            // ❌ NO llamar handleClose() aquí - dejar que el padre maneje el cierre
            // El padre cerrará el modal cuando actualice su estado
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} closable={false}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className='relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-3'>
                        <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400'>
                            <FaUsers size={20} />
                        </div>
                        <div>
                            <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Agregar Compañero</h2>
                            <p className='text-gray-600 dark:text-gray-400 text-sm'>
                                Valida los datos de tu compañero de tesis
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClose}
                        className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'>
                        <FaTimes size={16} />
                    </motion.button>
                </div>

                <AnimatePresence mode='wait'>
                    {!showSuccess ? (
                        <motion.div key='form' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Form */}
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <div className='space-y-4'>
                                    <FormItem
                                        label='Código de Matrícula del Compañero'
                                        invalid={Boolean(errors.codigoMatricula)}
                                        errorMessage={errors.codigoMatricula?.message}>
                                        <Controller
                                            name='codigoMatricula'
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type='text'
                                                    placeholder='Ej: 241415'
                                                    autoComplete='off'
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label='DNI del Compañero'
                                        invalid={Boolean(errors.dniCompanero)}
                                        errorMessage={errors.dniCompanero?.message}>
                                        <Controller
                                            name='dniCompanero'
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type='text'
                                                    placeholder='Ej: 12345678'
                                                    autoComplete='off'
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>

                                {/* Info Note */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                                    <div className='flex space-x-2'>
                                        <FaUserPlus className='text-blue-500 flex-shrink-0 mt-0.5' size={14} />
                                        <div className='text-blue-700 dark:text-blue-300 text-sm'>
                                            <p className='font-medium mb-1'>Requisitos del compañero:</p>
                                            <ul className='text-xs space-y-0.5'>
                                                <li>• Debe estar registrado en el sistema</li>
                                                <li>• Debe estar en la misma carrera que tú</li>
                                                <li>• No debe tener otro proyecto activo</li>
                                                <li>• Debe cumplir con el semestre mínimo</li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                                        <div className='flex space-x-2'>
                                            <FaExclamationTriangle
                                                className='text-red-500 flex-shrink-0 mt-0.5'
                                                size={14}
                                            />
                                            <p className='text-red-700 dark:text-red-300 text-sm'>{error}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className='flex justify-end space-x-3 mt-6'>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant='default' onClick={handleClose} disabled={isSubmitting}>
                                            Cancelar
                                        </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant='solid'
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='min-w-24'>
                                            {isSubmitting ? (
                                                <div className='flex items-center space-x-2'>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                        <Spinner size={16} />
                                                    </motion.div>
                                                    <span>Validando...</span>
                                                </div>
                                            ) : (
                                                'Validar'
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </Form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key='success'
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='text-center'>
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                                className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <FaCheck className='text-green-600 dark:text-green-400 text-xl' />
                            </motion.div>

                            {/* Companion Info */}
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                                ¡Compañero Validado!
                            </h3>

                            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left'>
                                <div className='space-y-2'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600 dark:text-gray-400 text-sm'>Compañero:</span>
                                        <span className='font-medium text-gray-900 dark:text-white text-sm'>
                                            {companeroData?.nombres} {companeroData?.apellidos}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600 dark:text-gray-400 text-sm'>Código:</span>
                                        <span className='font-medium text-gray-900 dark:text-white text-sm'>
                                            {companeroData?.codigoEstudiante}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-600 dark:text-gray-400 text-sm'>Estado:</span>
                                        <span className='font-medium text-green-600 dark:text-green-400 text-sm'>
                                            {companeroData?.yaEsTesista ? 'Ya registrado' : 'Será registrado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <div className='flex justify-end space-x-3'>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant='default' onClick={handleClose}>
                                        Cancelar
                                    </Button>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        variant='solid'
                                        onClick={handleConfirm}
                                        className='bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'>
                                        Agregar Compañero
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Dialog>
    )
}

export default ValidarCompaneroModal
