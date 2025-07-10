// src/components/shared/VerifyStudentModal/VerifyStudentModal.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Dialog } from '@/components/ui'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, Form } from '@/components/ui/Form'
import Spinner from '@/components/ui/Spinner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaUserGraduate, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import { useSessionUser } from '@/store/authStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface VerifyStudentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (studentData: any) => void
}

type VerifyStudentSchema = {
    studentCode: string
}

const validationSchema = z.object({
    studentCode: z.string()
        .min(6, { message: 'El código debe tener al menos 6 caracteres' })
        .max(10, { message: 'El código debe tener máximo 10 caracteres' })
        .regex(/^\d+$/, { message: 'El código debe contener solo números' })
})

const VerifyStudentModal = ({ isOpen, onClose, onSuccess }: VerifyStudentModalProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [studentData, setStudentData] = useState<any>(null)

    const userData = useSessionUser((state) => state.userData)
    const signedIn = useSessionUser((state) => state.session.signedIn)
    useEffect(() => {
        console.log("🔍 Debug completo del modal:")
        console.log("signedIn:", signedIn)
        console.log("userData completo:", userData)
        console.log("userData?.num_doc_identidad:", userData?.num_doc_identidad)
        console.log("Store COMPLETO:", useSessionUser.getState())
        console.log("localStorage sessionUser:", JSON.parse(localStorage.getItem('sessionUser') || '{}'))
    }, [userData, signedIn])
    const {
        handleSubmit,
        formState: { errors },
        control,
        reset
    } = useForm<VerifyStudentSchema>({
        resolver: zodResolver(validationSchema)
    })

    const handleClose = () => {
        reset()
        setError(null)
        setShowSuccess(false)
        setStudentData(null)
        onClose()
    }

    const onSubmit = async (values: VerifyStudentSchema) => {
        // 🔬 Debug ADICIONAL antes de la validación
        console.log("🔍 En onSubmit - userData:", userData)
        console.log("🔍 En onSubmit - type of userData:", typeof userData)
        console.log("🔍 En onSubmit - userData keys:", userData ? Object.keys(userData) : 'userData is null/undefined')
        setSubmitting(true)
        setError(null)

        try {
            // Llamar a la Edge Function
            console.log('🔍 Verificando código de estudiante:', values.studentCode)

            const { data, error: functionError } = await supabase.functions.invoke('student-info', {
                body: { studentCode: values.studentCode }
            })

            if (functionError) {
                throw new Error(`Error en la consulta: ${functionError.message}`)
            }

            if (!data.success) {
                throw new Error(data.error || 'Error al consultar información del estudiante')
            }

            const studentInfo = data.data

            // Validación 1: DNI coincidente
            if (studentInfo.numDocIdentidad !== userData?.num_doc_identidad) {
                throw new Error(
                    `El documento de identidad del código (${studentInfo.numDocIdentidad}) no coincide con tu documento registrado (${userData?.num_doc_identidad})`
                )
            }

            // Validación 2: Semestre actual >= (totalSemestre - 3)
            const minSemestre = studentInfo.totalSemestre - 3
            if (studentInfo.semestreActual < minSemestre) {
                throw new Error(
                    `Debes estar en el semestre ${minSemestre} o superior. Actualmente estás en el semestre ${studentInfo.semestreActual} de ${studentInfo.totalSemestre}.`
                )
            }

            if (userData?.id === undefined) {
                throw new Error("El ID del usuario no está definido");
            }

            // Validación 3: Verificar duplicados en tbl_tesistas
            const { data: existingTesista, error: checkError } = await supabase
                .from('tbl_tesistas')
                .select(`
                id, 
                codigo_estudiante,
                estructura_academica:id_estructura_academica(
                    id,
                    nombre
                )
            `)
                .eq('id_usuario', userData?.id)
                .eq('id_estructura_academica', studentInfo.idEstructuraAcademica)
                .eq('codigo_estudiante', values.studentCode)
                .eq('estado', 1)
                .single()

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error verificando duplicados:', checkError)
                throw new Error('Error al verificar duplicados en la base de datos')
            }

            if (existingTesista) {
                const estructuraNombre = existingTesista.estructura_academica?.nombre || studentInfo.dicEstructuraAcademica || 'Estructura académica desconocida'

                throw new Error(
                    `Ya tienes registrado el servicio de tesista para ${estructuraNombre} con este código de matrícula.`
                )
            }

            // Todo correcto - mostrar datos y continuar (ya viene con dicEstructuraAcademica)
            setStudentData(studentInfo)
            setShowSuccess(true)

            console.log('✅ Verificación exitosa:', studentInfo)

        } catch (error) {
            console.error('❌ Error en verificación:', error)
            setError((error as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirm = () => {
        if (studentData) {
            onSuccess(studentData)
            handleClose()
        }
    }
    const toastNotification = (
        <Notification title="¡Felicitaciones!" type='success'>
            ¡Servicio de tesista agregado exitosamente!
        </Notification>
    )

    function openNotification() {
        toast.push(toastNotification)
    }
    return (
        <Dialog isOpen={isOpen} onClose={handleClose} closable={false}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <FaUserGraduate size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Verificar Código de Matrícula
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Ingresa tu código de estudiante
                            </p>
                        </div>
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

                <AnimatePresence mode="wait">
                    {!showSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Form */}
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <FormItem
                                    label="Código de Estudiante"
                                    invalid={Boolean(errors.studentCode)}
                                    errorMessage={errors.studentCode?.message}
                                >
                                    <Controller
                                        name="studentCode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="Ej: 241415"
                                                autoComplete="off"
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                    >
                                        <div className="flex space-x-2">
                                            <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                                            <p className="text-red-700 dark:text-red-300 text-sm">
                                                {error}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex justify-end space-x-3 mt-6">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="default"
                                            onClick={handleClose}
                                            disabled={isSubmitting}
                                        >
                                            Cancelar
                                        </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="solid"
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="min-w-24"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center space-x-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    >
                                                        <Spinner size={16} />
                                                    </motion.div>
                                                    <span>Verificando...</span>
                                                </div>
                                            ) : (
                                                'Verificar'
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </Form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <FaCheck className="text-green-600 dark:text-green-400 text-xl" />
                            </motion.div>

                            {/* Student Info */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                ¡Verificación Exitosa!
                            </h3>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Estudiante:</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {studentData?.nombres} {studentData?.apellidos}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Carrera:</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {studentData?.dicEstructuraAcademica}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Semestre:</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {studentData?.semestreActual} de {studentData?.totalSemestre}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Código:</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                                            {studentData?.codigoEstudiante}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <div className="flex justify-end space-x-3">
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
                                        onClick={() => { handleConfirm(); openNotification(); }}
                                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                    >
                                        Agregar Servicio
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

export default VerifyStudentModal