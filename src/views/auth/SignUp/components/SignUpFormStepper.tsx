// src/views/auth/SignUp/components/SignUpFormStepper.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Stepper from '@/components/ui/Stepper/Stepper'
import NotificationModal, { EmailVerificationModal, ExistingEmailModal } from '@/components/shared/NotificationModal/NotificationModal'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { TblUsuario } from '@/lib/supabase'
import { apiVerifyDocIdentity } from '@/services/AuthService'
import { PiIdentificationCardBold, PiUserBold, PiLockBold, PiAddressBookBold, PiCheckCircleBold  } from 'react-icons/pi'

interface SignUpFormStepperProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

// Steps del proceso
const STEPS = [
    {
        id: 'verification',
        title: 'Verificación',
        description: 'Documento de identidad',
        icon: <PiIdentificationCardBold className="h-4 w-4" />
    },
    {
        id: 'account',
        title: 'Cuenta',
        description: 'Credenciales de acceso',
        icon: <PiUserBold className="h-4 w-4" />
    },
    {
        id: 'personal',
        title: 'Personal',
        description: 'Información personal',
        icon: <PiAddressBookBold className="h-4 w-4" />
    },
    {
        id: 'complete',
        title: 'Completado',
        description: 'Registro finalizado',
        icon: <PiLockBold className="h-4 w-4" />
    }
]

// Tipos para cada step
type DocumentVerificationSchema = {
    tipoDocIdentidad: string
    numDocIdentidad: string
}

type AccountCreationSchema = {
    userName: string
    apellido?: string
    email: string
    password: string
    confirmPassword: string
}

type PersonalInfoSchema = {
    pais: string
    direccion: string
    sexo: string
    telefono: string
}

// Schemas de validación
const documentSchema: ZodType<DocumentVerificationSchema> = z.object({
    tipoDocIdentidad: z.string({ required_error: 'Seleccione el tipo de documento' }),
    numDocIdentidad: z.string({ required_error: 'Ingrese su número de documento' })
        .min(8, { message: 'El documento debe tener al menos 8 caracteres' })
})

const accountSchema: ZodType<AccountCreationSchema> = z.object({
    userName: z.string().min(1, { message: 'El nombre es requerido' }),
    apellido: z.string().optional(),
    email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
})

const personalSchema: ZodType<PersonalInfoSchema> = z.object({
    pais: z.string().min(1, { message: 'El país es requerido' }),
    direccion: z.string().min(1, { message: 'La dirección es requerida' }),
    sexo: z.string().min(1, { message: 'Seleccione su sexo' }),
    telefono: z.string().min(9, { message: 'Ingrese un número de teléfono válido' })
})

// Opciones
const tiposDocumento = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carné de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
]

const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
]

const SignUpFormStepper = (props: SignUpFormStepperProps) => {
    const { disableSubmit = false, className, setMessage } = props
    const [currentStep, setCurrentStep] = useState(0)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [foundUsers, setFoundUsers] = useState<TblUsuario[]>([])
    const [selectedUser, setSelectedUser] = useState<TblUsuario | null>(null)
    const [isNewUser, setIsNewUser] = useState(false)
    
    // Estados para modales
    const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
        isOpen: false,
        title: '',
        message: ''
    })
    const [emailVerificationModal, setEmailVerificationModal] = useState<{ isOpen: boolean; email: string }>({
        isOpen: false,
        email: ''
    })
    const [existingEmailModal, setExistingEmailModal] = useState<{ isOpen: boolean; email: string }>({
        isOpen: false,
        email: ''
    })

    const { signUp } = useAuth()

    // Formularios para cada step
    const documentForm = useForm<DocumentVerificationSchema>({
        resolver: zodResolver(documentSchema),
        defaultValues: { tipoDocIdentidad: 'DNI' }
    })

    const accountForm = useForm<AccountCreationSchema>({
        resolver: zodResolver(accountSchema)
    })

    const personalForm = useForm<PersonalInfoSchema>({
        resolver: zodResolver(personalSchema),
        defaultValues: { pais: 'Perú', sexo: 'M' }
    })

    // Función para mostrar error modal
    const showError = (title: string, message: string) => {
        setErrorModal({ isOpen: true, title, message })
    }

    // Step 1: Verificación de documento
    const handleDocumentVerification = async (values: DocumentVerificationSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            const result = await apiVerifyDocIdentity(values)
            
            if (result.exists) {
                if (result.singleUser && result.user) {
                    setSelectedUser(result.user)
                    accountForm.setValue('userName', result.user.nombres || '')
                    accountForm.setValue('apellido', result.user.apellidos || '')
                    accountForm.setValue('email', result.user.correo)
                    setIsNewUser(false)
                } else if (result.users && result.users.length > 0) {
                    setFoundUsers(result.users)
                    // Por ahora tomamos el primero, se puede mejorar para mostrar lista
                    const firstUser = result.users[0]
                    setSelectedUser(firstUser)
                    accountForm.setValue('userName', firstUser.nombres || '')
                    accountForm.setValue('apellido', firstUser.apellidos || '')
                    accountForm.setValue('email', firstUser.correo)
                    setIsNewUser(false)
                }
            } else {
                setIsNewUser(true)
                setSelectedUser(null)
            }
            
            setCurrentStep(1)
        } catch (error) {
            showError('Error de Verificación', (error as Error).message || 'Error al verificar el documento')
        } finally {
            setSubmitting(false)
        }
    }

    // Step 2: Crear cuenta
    const handleAccountCreation = async (values: AccountCreationSchema) => {
        if (disableSubmit) return

        // Para usuarios existentes, proceder a step 3
        if (!isNewUser) {
            setCurrentStep(2)
            return
        }

        // Para nuevos usuarios, validar email y continuar
        // Aquí podrías hacer una verificación de email si es necesario
        setCurrentStep(2)
    }

    // Step 3: Información personal (final)
    const handlePersonalInfo = async (values: PersonalInfoSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            const documentValues = documentForm.getValues()
            const accountValues = accountForm.getValues()
            
            const result = await signUp({
                userName: accountValues.userName,
                email: accountValues.email,
                password: accountValues.password,
                userDetails: isNewUser ? {
                    tipoDocIdentidad: documentValues.tipoDocIdentidad,
                    numDocIdentidad: documentValues.numDocIdentidad,
                    apellido: accountValues.apellido || '',
                    pais: values.pais,
                    direccion: values.direccion,
                    sexo: values.sexo,
                    telefono: values.telefono,
                    fechaNacimiento: new Date()
                } : {
                    existingUserId: selectedUser?.id
                }
            })

            if (result?.status === 'failed') {
                if (result.message.toLowerCase().includes('email') || result.message.toLowerCase().includes('correo')) {
                    setExistingEmailModal({ isOpen: true, email: accountValues.email })
                } else {
                    showError('Error de Registro', result.message)
                }
            } else {
                // Registro exitoso
                setCurrentStep(3)
                setEmailVerificationModal({ isOpen: true, email: accountValues.email })
            }
        } catch (error) {
            const errorMessage = (error as Error).message || 'Error al registrar usuario'
            if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('correo')) {
                setExistingEmailModal({ isOpen: true, email: accountForm.getValues().email })
            } else {
                showError('Error de Registro', errorMessage)
            }
        } finally {
            setSubmitting(false)
        }
    }

    // Navegación entre steps
    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const goToSignIn = () => {
        window.location.href = '/sign-in'
    }

    return (
        <div className={className}>
            {/* Stepper */}
            <div className="mb-8">
                <Stepper 
                    steps={STEPS} 
                    currentStep={currentStep}
                    size="md" 
                />
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
                {/* Step 1: Verificación de documento */}
                {currentStep === 0 && (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Verificación de Documento
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Ingresa tu tipo y número de documento de identidad
                            </p>
                        </div>

                        <Form onSubmit={documentForm.handleSubmit(handleDocumentVerification)}>
                            <FormItem
                                label="Tipo de Documento"
                                invalid={Boolean(documentForm.formState.errors.tipoDocIdentidad)}
                                errorMessage={documentForm.formState.errors.tipoDocIdentidad?.message}
                            >
                                <Controller
                                    name="tipoDocIdentidad"
                                    control={documentForm.control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Seleccione tipo de documento"
                                            options={tiposDocumento}
                                            value={tiposDocumento.find(option => option.value === field.value)}
                                            onChange={option => field.onChange(option?.value)}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Número de Documento"
                                invalid={Boolean(documentForm.formState.errors.numDocIdentidad)}
                                errorMessage={documentForm.formState.errors.numDocIdentidad?.message}
                            >
                                <Controller
                                    name="numDocIdentidad"
                                    control={documentForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            placeholder="Ingrese su número de documento"
                                            autoComplete="off"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="mt-6"
                            >
                                {isSubmitting ? 'Verificando...' : 'Continuar'}
                            </Button>
                        </Form>
                    </motion.div>
                )}

                {/* Step 2: Información de cuenta */}
                {currentStep === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Información de Cuenta
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {isNewUser 
                                    ? 'Crea tu cuenta de usuario' 
                                    : 'Configuración de credenciales para tu cuenta existente'
                                }
                            </p>
                        </div>

                        {!isNewUser && selectedUser && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Se encontró una cuenta con tu documento. Configura tu contraseña para acceder.
                                </p>
                            </div>
                        )}

                        <Form onSubmit={accountForm.handleSubmit(handleAccountCreation)}>
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem
                                    label="Nombres"
                                    invalid={Boolean(accountForm.formState.errors.userName)}
                                    errorMessage={accountForm.formState.errors.userName?.message}
                                >
                                    <Controller
                                        name="userName"
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="Nombres"
                                                disabled={!isNewUser}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Apellidos"
                                    invalid={Boolean(accountForm.formState.errors.apellido)}
                                    errorMessage={accountForm.formState.errors.apellido?.message}
                                >
                                    <Controller
                                        name="apellido"
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type="text"
                                                placeholder="Apellidos"
                                                disabled={!isNewUser}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                            
                            <FormItem
                                label="Correo Electrónico"
                                invalid={Boolean(accountForm.formState.errors.email)}
                                errorMessage={accountForm.formState.errors.email?.message}
                            >
                                <Controller
                                    name="email"
                                    control={accountForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type="email"
                                            placeholder="correo@ejemplo.com"
                                            disabled={!isNewUser}
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem
                                    label="Contraseña"
                                    invalid={Boolean(accountForm.formState.errors.password)}
                                    errorMessage={accountForm.formState.errors.password?.message}
                                >
                                    <Controller
                                        name="password"
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type="password"
                                                placeholder="Contraseña"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Confirmar Contraseña"
                                    invalid={Boolean(accountForm.formState.errors.confirmPassword)}
                                    errorMessage={accountForm.formState.errors.confirmPassword?.message}
                                >
                                    <Controller
                                        name="confirmPassword"
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type="password"
                                                placeholder="Confirmar Contraseña"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="default"
                                    onClick={goBack}
                                    className="flex-1"
                                >
                                    Anterior
                                </Button>
                                
                                <Button
                                    variant="solid"
                                    type="submit"
                                    className="flex-1"
                                >
                                    Continuar
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )}

                {/* Step 3: Información personal */}
                {currentStep === 2 && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Información Personal
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Complete su información personal para finalizar el registro
                            </p>
                        </div>

                        <Form onSubmit={personalForm.handleSubmit(handlePersonalInfo)}>
                            <FormItem
                                label="País"
                                invalid={Boolean(personalForm.formState.errors.pais)}
                                errorMessage={personalForm.formState.errors.pais?.message}
                            >
                                <Controller
                                    name="pais"
                                    control={personalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            placeholder="País"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Dirección"
                                invalid={Boolean(personalForm.formState.errors.direccion)}
                                errorMessage={personalForm.formState.errors.direccion?.message}
                            >
                                <Controller
                                    name="direccion"
                                    control={personalForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type="text"
                                            placeholder="Dirección completa"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem
                                    label="Sexo"
                                    invalid={Boolean(personalForm.formState.errors.sexo)}
                                    errorMessage={personalForm.formState.errors.sexo?.message}
                                >
                                    <Controller
                                        name="sexo"
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Select
                                                placeholder="Seleccione"
                                                options={sexoOptions}
                                                value={sexoOptions.find(option => option.value === field.value)}
                                                onChange={option => field.onChange(option?.value)}
                                            />
                                        )}
                                    />
                                </FormItem>
                                
                                <FormItem
                                    label="Teléfono"
                                    invalid={Boolean(personalForm.formState.errors.telefono)}
                                    errorMessage={personalForm.formState.errors.telefono?.message}
                                >
                                    <Controller
                                        name="telefono"
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type="tel"
                                                placeholder="Número de teléfono"
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="default"
                                    onClick={goBack}
                                    className="flex-1"
                                >
                                    Anterior
                                </Button>
                                
                                <Button
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
                                    className="flex-1"
                                >
                                    {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )}

                {/* Step 4: Completado */}
                {currentStep === 3 && (
                    <motion.div
                        key="step-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <PiCheckCircleBold className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </motion.div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            ¡Registro Completado!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Tu cuenta ha sido creada exitosamente. Revisa tu correo electrónico para activar tu cuenta.
                        </p>
                        
                        <Button
                            variant="solid"
                            onClick={goToSignIn}
                            className="px-8"
                        >
                            Ir a Iniciar Sesión
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modales */}
            <NotificationModal
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
                title={errorModal.title}
                message={errorModal.message}
                variant="error"
            />

            <EmailVerificationModal
                isOpen={emailVerificationModal.isOpen}
                onClose={() => setEmailVerificationModal({ isOpen: false, email: '' })}
                email={emailVerificationModal.email}
            />

            <ExistingEmailModal
                isOpen={existingEmailModal.isOpen}
                onClose={() => setExistingEmailModal({ isOpen: false, email: '' })}
                email={existingEmailModal.email}
                onSignIn={goToSignIn}
            />
        </div>
    )
}

export default SignUpFormStepper