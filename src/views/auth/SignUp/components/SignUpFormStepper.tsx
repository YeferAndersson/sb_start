// src/views/auth/SignUp/components/SignUpFormStepper.tsx - CORREGIDO v2
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Stepper from '@/components/ui/Stepper/Stepper'
import NotificationModal, {
    EmailVerificationModal,
    ExistingEmailModal,
} from '@/components/shared/NotificationModal/NotificationModal'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { TblUsuario } from '@/lib/supabase'
import { apiVerifyDocIdentity, apiCheckEmailExists } from '@/services/AuthService'
import { PiIdentificationCardBold, PiUserBold, PiLockBold, PiAddressBookBold, PiCheckCircleBold } from 'react-icons/pi'

import React from 'react'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import Avatar from '@/components/ui/Avatar'
// import Select from '@/components/ui/Select'
import { countryList } from '@/constants/countries.constant'

// Definir el tipo CountryOption
type CountryOption = {
    label: string
    dialCode: string
    value: string
}

// Destructurar Control de components
const { Control, Option } = components

// Componente personalizado para opciones - Con type assertion
const CustomSelectOption = (props: OptionProps<CountryOption> & { variant: 'country' | 'phone' }) => {
    const OptionComponent = Option as any
    return (
        <OptionComponent {...props}>
            <div className='flex items-center gap-2'>
                <Avatar shape='circle' size={20} src={`/img/countries/${props.data.value}.png`} />
                {props.variant === 'country' && <span>{props.data.label}</span>}
                {props.variant === 'phone' && <span>{props.data.dialCode}</span>}
            </div>
        </OptionComponent>
    )
}

// Componente personalizado para control - Con type assertion
const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const ControlComponent = Control as any
    const selected = props.getValue()[0]
    return (
        <ControlComponent {...props}>
            {selected && (
                <Avatar
                    className='ltr:ml-4 rtl:mr-4'
                    shape='circle'
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </ControlComponent>
    )
}

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
        icon: <PiIdentificationCardBold className='h-4 w-4' />,
    },
    {
        id: 'account',
        title: 'Cuenta',
        description: 'Credenciales de acceso',
        icon: <PiUserBold className='h-4 w-4' />,
    },
    {
        id: 'personal',
        title: 'Personal',
        description: 'Información personal',
        icon: <PiAddressBookBold className='h-4 w-4' />,
    },
    {
        id: 'complete',
        title: 'Completado',
        description: 'Registro finalizado',
        icon: <PiCheckCircleBold className='h-4 w-4' />,
    },
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
    dialCode: string
}

// Schemas de validación
const documentSchema = z
    .object({
        tipoDocIdentidad: z.string({ required_error: 'Seleccione el tipo de documento' }),
        numDocIdentidad: z
            .string({ required_error: 'Ingrese su número de documento' })
            .min(1, { message: 'El número de documento es requerido' }),
    })
    .superRefine((data, ctx) => {
        const { tipoDocIdentidad, numDocIdentidad } = data
        const validator = getDocumentValidation(tipoDocIdentidad)
        const result = validator(numDocIdentidad)

        if (result !== true) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result as string,
                path: ['numDocIdentidad'],
            })
        }
    })

const accountSchema: ZodType<AccountCreationSchema> = z
    .object({
        userName: z.string().min(1, { message: 'El nombre es requerido' }),
        apellido: z.string().optional(),
        email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
        password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
        confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

const personalSchema: ZodType<PersonalInfoSchema> = z.object({
    pais: z
        .string()
        .min(1, { message: 'El país es requerido' })
        .max(3, { message: 'El país debe tener máximo 3 caracteres (ej: PER)' }),
    direccion: z.string().min(1, { message: 'La dirección es requerida' }),
    sexo: z.string().min(1, { message: 'Seleccione su sexo' }),
    telefono: z.string().min(9, { message: 'Ingrese un número de teléfono válido' }),
    dialCode: z.string().min(1, { message: 'Seleccione código de país' }),
})

// Opciones
const tiposDocumento = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carné de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
]

const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
]

// FUNCIONES DE LIMPIEZA Y VALIDACIÓN DE FORMULARIO

// Función para limpiar espacios en blanco
const cleanSpaces = (value: string): string => {
    return value ? value.replace(/\s+/g, '') : ''
}

// Funciones de validación para cada tipo de documento
const validateDNI = (value: string): string | boolean => {
    const cleanValue = cleanSpaces(value)

    if (!cleanValue) return 'El DNI es requerido'
    if (!/^\d{8}$/.test(cleanValue)) {
        return 'El DNI debe tener exactamente 8 dígitos numéricos'
    }
    return true
}

const validateCarnetExtranjeria = (value: string): string | boolean => {
    const cleanValue = cleanSpaces(value)

    if (!cleanValue) return 'El Carnet de Extranjería es requerido'
    if (!/^\d{9}$/.test(cleanValue)) {
        return 'El Carnet de Extranjería debe tener exactamente 9 dígitos numéricos'
    }
    if (!cleanValue.startsWith('00')) {
        return "El Carnet de Extranjería debe comenzar con '00'"
    }
    return true
}

const validatePasaporte = (value: string): string | boolean => {
    const cleanValue = cleanSpaces(value)

    if (!cleanValue) return 'El Pasaporte es requerido'
    if (!/^[A-Za-z0-9]{9}$/.test(cleanValue)) {
        return 'El Pasaporte debe tener exactamente 9 caracteres alfanuméricos'
    }
    return true
}

// Función para obtener la validación según el tipo de documento
const getDocumentValidation = (tipoDoc: string) => {
    switch (tipoDoc) {
        case 'DNI':
            return validateDNI
        case 'CE':
            return validateCarnetExtranjeria
        case 'PASAPORTE':
            return validatePasaporte
        default:
            return (value: string) => (cleanSpaces(value) ? true : 'El número de documento es requerido')
    }
}

// Función para obtener el placeholder según el tipo de documento
const getPlaceholder = (tipoDoc: string): string => {
    switch (tipoDoc) {
        case 'DNI':
            return 'Ej: 12345678'
        case 'CE':
            return 'Ej: 001234567'
        case 'PASAPORTE':
            return 'Ej: 123456789 o ABC123456'
        default:
            return 'Ingrese su número de documento'
    }
}

// Función para formatear el input según el tipo de documento
const formatInput = (value: string, tipoDoc: string): string => {
    const cleanValue = cleanSpaces(value)

    switch (tipoDoc) {
        case 'DNI':
            // Solo números, máximo 8
            return cleanValue.replace(/\D/g, '').slice(0, 8)
        case 'CE':
            // Solo números, máximo 9
            return cleanValue.replace(/\D/g, '').slice(0, 9)
        case 'PASAPORTE':
            // Alfanumérico, máximo 9
            return cleanValue
                .replace(/[^A-Za-z0-9]/g, '')
                .slice(0, 9)
                .toUpperCase()
        default:
            return cleanValue
    }
}

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
        message: '',
    })
    const [emailVerificationModal, setEmailVerificationModal] = useState<{ isOpen: boolean; email: string }>({
        isOpen: false,
        email: '',
    })
    const [existingEmailModal, setExistingEmailModal] = useState<{ isOpen: boolean; email: string }>({
        isOpen: false,
        email: '',
    })
    const [alreadyRegisteredModal, setAlreadyRegisteredModal] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: '',
    })

    const { signUp } = useAuth()
    const dialCodeList = useMemo(() => {
        const newCountryList: Array<CountryOption> = JSON.parse(JSON.stringify(countryList))
        return newCountryList.map(country => {
            country.label = country.dialCode
            return country
        })
    }, [])
    // Formularios para cada step
    const documentForm = useForm<DocumentVerificationSchema>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            tipoDocIdentidad: 'DNI',
            numDocIdentidad: '',
        },
    })

    const accountForm = useForm<AccountCreationSchema>({
        resolver: zodResolver(accountSchema),
    })

    const personalForm = useForm<PersonalInfoSchema>({
        resolver: zodResolver(personalSchema),
        defaultValues: { pais: 'PE', sexo: 'M', dialCode: '+51' }, //
    })

    // Función para mostrar error modal
    const showError = (title: string, message: string) => {
        console.error('❌ Mostrando error:', title, message)
        setErrorModal({ isOpen: true, title, message })
    }

    // Step 1: Verificación de documento
    const handleDocumentVerification = async (values: DocumentVerificationSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            console.log('🔍 Verificando documento:', values)
            const result = await apiVerifyDocIdentity(values)

            if (result.exists) {
                // NUEVO: Verificar si ya está registrado en nueva plataforma
                if (result.message.includes('Ya está registrado en esta nueva plataforma')) {
                    setAlreadyRegisteredModal({
                        isOpen: true,
                        message: result.message,
                    })
                    setSubmitting(false)
                    return
                }

                if (result.singleUser && result.user) {
                    setSelectedUser(result.user)
                    accountForm.setValue('userName', result.user.nombres || '')
                    accountForm.setValue('apellido', result.user.apellidos || '')
                    accountForm.setValue('email', result.user.correo)
                    setIsNewUser(false)
                    console.log('👤 Usuario existente encontrado:', result.user.correo)
                } else if (result.users && result.users.length > 0) {
                    setFoundUsers(result.users)
                    // Por ahora tomamos el primero, se puede mejorar para mostrar lista
                    const firstUser = result.users[0]
                    setSelectedUser(firstUser)
                    accountForm.setValue('userName', firstUser.nombres || '')
                    accountForm.setValue('apellido', firstUser.apellidos || '')
                    accountForm.setValue('email', firstUser.correo)
                    setIsNewUser(false)
                    console.log('👤 Usuario existente encontrado (múltiple):', firstUser.correo)
                }
            } else {
                setIsNewUser(true)
                setSelectedUser(null)
                console.log('🆕 Usuario nuevo - DNI no encontrado')
            }

            setCurrentStep(1)
        } catch (error) {
            showError('Error de Verificación', (error as Error).message || 'Error al verificar el documento')
        } finally {
            setSubmitting(false)
        }
    }

    // Step 2: Crear cuenta (CORREGIDO: con validación de email solo para nuevos)
    const handleAccountCreation = async (values: AccountCreationSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            // 🔧 CORRECCIÓN: Para usuarios existentes, NO verificar email
            if (!isNewUser && selectedUser) {
                console.log('⏭️ Usuario EXISTENTE - saltando verificación de email:', values.email)
                setCurrentStep(2)
                setSubmitting(false)
                return
            }

            // Para usuarios NUEVOS, verificar si el email ya existe
            console.log('🔍 Usuario NUEVO - verificando disponibilidad de email:', values.email)

            const emailExists = await apiCheckEmailExists(values.email)

            if (emailExists) {
                console.warn('⚠️ Email ya existe para usuario nuevo')
                setExistingEmailModal({ isOpen: true, email: values.email })
                setSubmitting(false)
                return
            }

            // Email disponible, continuar al siguiente paso
            console.log('✅ Email disponible para usuario nuevo')
            setCurrentStep(2)
        } catch (error) {
            const errorMessage = (error as Error).message || 'Error al verificar el correo electrónico'
            showError('Error de Validación', errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    // Step 3: Información personal (CORREGIDO: mejor manejo de respuesta)
    const handlePersonalInfo = async (values: PersonalInfoSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            const documentValues = documentForm.getValues()
            const accountValues = accountForm.getValues()

            console.log('📝 Iniciando registro final...')
            console.log('📋 Tipo de usuario:', isNewUser ? 'NUEVO' : 'EXISTENTE')
            console.log('📋 Usuario seleccionado ID:', selectedUser?.id)
            const telefonoCompleto = values.dialCode + values.telefono
            console.log('📞 Teléfono completo:', telefonoCompleto)
            // 🔧 CORRECCIÓN: Evitar redirección automática
            // No usar await directamente aquí para evitar que useAuth redirija
            const signUpPromise = signUp({
                userName: accountValues.userName,
                email: accountValues.email,
                password: accountValues.password,
                userDetails: isNewUser
                    ? {
                          tipoDocIdentidad: documentValues.tipoDocIdentidad,
                          numDocIdentidad: documentValues.numDocIdentidad,
                          apellido: accountValues.apellido || '',
                          pais: values.pais,
                          direccion: values.direccion,
                          sexo: values.sexo,
                          telefono: telefonoCompleto,
                          fechaNacimiento: new Date(),
                      }
                    : {
                          existingUserId: selectedUser?.id,
                      },
            })

            const result = await signUpPromise

            console.log('📤 Resultado del registro:', result)

            if (result?.status === 'failed') {
                console.error('❌ Registro falló:', result.message)
                showError('Error de Registro', result.message)
            } else {
                // ✅ Registro exitoso - IR AL PASO 4
                console.log('🎉 Registro exitoso, yendo al paso 4')
                console.log('📧 Mostrando modal de verificación para:', accountValues.email)

                // PRIMERO establecer el paso 4
                setCurrentStep(3) // Paso 4 (índice 3)

                // LUEGO mostrar modal de verificación (sin esperar)
                setTimeout(() => {
                    setEmailVerificationModal({ isOpen: true, email: accountValues.email })
                }, 100)
            }
        } catch (error) {
            console.error('💥 Error en registro final:', error)
            const errorMessage = (error as Error).message || 'Error al registrar usuario'
            showError('Error de Registro', errorMessage)
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
        // Usar location.href para evitar problemas de navegación
        window.location.href = '/sign-in'
    }

    return (
        <div className={className}>
            {/* Stepper */}
            <div className='mb-8'>
                <Stepper steps={STEPS} currentStep={currentStep} size='md' />
            </div>

            {/* Forms */}
            <AnimatePresence mode='wait'>
                {/* Step 1: Verificación de documento */}
                {currentStep === 0 && (
                    <motion.div
                        key='step-0'
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}>
                        <div className='mb-6 text-center'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                                Verificación de Documento
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Ingresa tu tipo y número de documento de identidad
                            </p>
                        </div>

                        <Form onSubmit={documentForm.handleSubmit(handleDocumentVerification)}>
                            <FormItem
                                label='Tipo de Documento'
                                invalid={Boolean(documentForm.formState.errors.tipoDocIdentidad)}
                                errorMessage={documentForm.formState.errors.tipoDocIdentidad?.message}>
                                <Controller
                                    name='tipoDocIdentidad'
                                    control={documentForm.control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder='Seleccione tipo de documento'
                                            options={tiposDocumento}
                                            value={tiposDocumento.find(option => option.value === field.value)}
                                            onChange={option => {
                                                field.onChange(option?.value)
                                                // Limpiar el campo de número cuando cambie el tipo
                                                documentForm.setValue('numDocIdentidad', '')
                                                documentForm.clearErrors('numDocIdentidad')
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label='Número de Documento'
                                invalid={Boolean(documentForm.formState.errors.numDocIdentidad)}
                                errorMessage={documentForm.formState.errors.numDocIdentidad?.message}>
                                <Controller
                                    name='numDocIdentidad'
                                    control={documentForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type='text'
                                            placeholder={getPlaceholder(documentForm.watch('tipoDocIdentidad'))}
                                            autoComplete='off'
                                            {...field}
                                            value={field.value || ''}
                                            onChange={e => {
                                                const tipoDoc = documentForm.getValues('tipoDocIdentidad')
                                                const formattedValue = formatInput(e.target.value, tipoDoc)
                                                field.onChange(formattedValue)
                                            }}
                                            onBlur={e => {
                                                // Aplicar validación adicional al salir del campo
                                                const tipoDoc = documentForm.getValues('tipoDocIdentidad')
                                                const cleanValue = cleanSpaces(e.target.value)
                                                const formattedValue = formatInput(cleanValue, tipoDoc)
                                                field.onChange(formattedValue)
                                                field.onBlur()
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>

                            <Button block loading={isSubmitting} variant='solid' type='submit' className='mt-6'>
                                {isSubmitting ? 'Verificando...' : 'Continuar'}
                            </Button>
                        </Form>
                    </motion.div>
                )}

                {/* Step 2: Información de cuenta */}
                {currentStep === 1 && (
                    <motion.div
                        key='step-1'
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}>
                        <div className='mb-6 text-center'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                                Información de Cuenta
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400'>
                                {isNewUser
                                    ? 'Crea tu cuenta de usuario'
                                    : 'Configuración de credenciales para tu cuenta existente'}
                            </p>
                        </div>

                        {!isNewUser && selectedUser && (
                            <div className='mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                                <p className='text-sm text-blue-800 dark:text-blue-200'>
                                    ✅ Se encontró una cuenta con tu documento. Configura tu contraseña para acceder.
                                </p>
                            </div>
                        )}

                        <Form onSubmit={accountForm.handleSubmit(handleAccountCreation)}>
                            <div className='grid grid-cols-2 gap-4'>
                                <FormItem
                                    label='Nombres'
                                    invalid={Boolean(accountForm.formState.errors.userName)}
                                    errorMessage={accountForm.formState.errors.userName?.message}>
                                    <Controller
                                        name='userName'
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input type='text' placeholder='Nombres' disabled={!isNewUser} {...field} />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label='Apellidos'
                                    invalid={Boolean(accountForm.formState.errors.apellido)}
                                    errorMessage={accountForm.formState.errors.apellido?.message}>
                                    <Controller
                                        name='apellido'
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type='text'
                                                placeholder='Apellidos'
                                                disabled={!isNewUser}
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>

                            <FormItem
                                label='Correo Electrónico'
                                invalid={Boolean(accountForm.formState.errors.email)}
                                errorMessage={accountForm.formState.errors.email?.message}>
                                <Controller
                                    name='email'
                                    control={accountForm.control}
                                    render={({ field }) => (
                                        <Input
                                            type='email'
                                            placeholder='correo@ejemplo.com'
                                            disabled={!isNewUser}
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <div className='grid grid-cols-2 gap-4'>
                                <FormItem
                                    label='Contraseña'
                                    invalid={Boolean(accountForm.formState.errors.password)}
                                    errorMessage={accountForm.formState.errors.password?.message}>
                                    <Controller
                                        name='password'
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type='password'
                                                placeholder='Contraseña'
                                                autoComplete='new-password'
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>

                                <FormItem
                                    label='Confirmar Contraseña'
                                    invalid={Boolean(accountForm.formState.errors.confirmPassword)}
                                    errorMessage={accountForm.formState.errors.confirmPassword?.message}>
                                    <Controller
                                        name='confirmPassword'
                                        control={accountForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type='password'
                                                placeholder='Confirmar Contraseña'
                                                autoComplete='new-password'
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>

                            <div className='flex gap-3 mt-6'>
                                <Button variant='default' onClick={goBack} className='flex-1'>
                                    Anterior
                                </Button>

                                <Button loading={isSubmitting} variant='solid' type='submit' className='flex-1'>
                                    {isSubmitting ? 'Validando...' : 'Continuar'}
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )}

                {/* Step 3: Información personal */}
                {currentStep === 2 && (
                    <motion.div
                        key='step-2'
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}>
                        <div className='mb-6 text-center'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                                Información Personal
                            </h3>
                            <p className='text-gray-600 dark:text-gray-400'>
                                Complete su información personal para finalizar el registro
                            </p>
                        </div>

                        <Form onSubmit={personalForm.handleSubmit(handlePersonalInfo)}>
                            <FormItem
                                label='País'
                                invalid={Boolean(personalForm.formState.errors.pais)}
                                errorMessage={personalForm.formState.errors.pais?.message}>
                                <Controller
                                    name='pais'
                                    control={personalForm.control}
                                    render={({ field }) => (
                                        <Select<CountryOption>
                                            options={countryList}
                                            components={{
                                                Option: props => (
                                                    <CustomSelectOption
                                                        variant='country'
                                                        {...(props as OptionProps<CountryOption>)}
                                                    />
                                                ),
                                                Control: CustomControl,
                                            }}
                                            placeholder='Seleccione su país'
                                            value={
                                                field.value
                                                    ? countryList.find(option => option.value === field.value)
                                                    : null
                                            }
                                            onChange={option => field.onChange(option?.value)}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label='Dirección'
                                invalid={Boolean(personalForm.formState.errors.direccion)}
                                errorMessage={personalForm.formState.errors.direccion?.message}>
                                <Controller
                                    name='direccion'
                                    control={personalForm.control}
                                    render={({ field }) => (
                                        <Input type='text' placeholder='Dirección completa' {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label='Sexo'
                                invalid={Boolean(personalForm.formState.errors.sexo)}
                                errorMessage={personalForm.formState.errors.sexo?.message}>
                                <Controller
                                    name='sexo'
                                    control={personalForm.control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder='Seleccione'
                                            options={sexoOptions}
                                            value={sexoOptions.find(option => option.value === field.value)}
                                            onChange={option => field.onChange(option?.value)}
                                        />
                                    )}
                                />
                            </FormItem>

                            <div className='flex items-end gap-4 w-full'>
                                <FormItem
                                    invalid={
                                        Boolean(personalForm.formState.errors.telefono) ||
                                        Boolean(personalForm.formState.errors.dialCode)
                                    }>
                                    <label className='form-label mb-2'>Número de teléfono</label>
                                    <Controller
                                        name='dialCode'
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Select<CountryOption>
                                                options={dialCodeList}
                                                className='w-[150px]'
                                                menuPlacement='top'
                                                components={{
                                                    Option: props => (
                                                        <CustomSelectOption
                                                            variant='phone'
                                                            {...(props as OptionProps<CountryOption>)}
                                                        />
                                                    ),
                                                    Control: CustomControl,
                                                }}
                                                placeholder=''
                                                value={
                                                    dialCodeList.find(option => option.dialCode === field.value) || null
                                                }
                                                onChange={option => field.onChange(option?.dialCode)}
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem
                                    className='w-full'
                                    invalid={
                                        Boolean(personalForm.formState.errors.telefono) ||
                                        Boolean(personalForm.formState.errors.dialCode)
                                    }
                                    errorMessage={personalForm.formState.errors.telefono?.message}>
                                    <Controller
                                        name='telefono'
                                        control={personalForm.control}
                                        render={({ field }) => (
                                            <Input
                                                type='tel'
                                                autoComplete='off'
                                                placeholder='Número de teléfono'
                                                {...field}
                                            />
                                        )}
                                    />
                                </FormItem>
                            </div>

                            <div className='flex gap-3 mt-6'>
                                <Button variant='default' onClick={goBack} className='flex-1'>
                                    Anterior
                                </Button>

                                <Button loading={isSubmitting} variant='solid' type='submit' className='flex-1'>
                                    {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )}

                {/* Step 4: Completado */}
                {currentStep === 3 && (
                    <motion.div
                        key='step-3'
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className='text-center py-8'>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                            className='w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <PiCheckCircleBold className='w-10 h-10 text-green-600 dark:text-green-400' />
                        </motion.div>

                        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
                            ¡Registro Completado!
                        </h3>
                        <p className='text-gray-600 dark:text-gray-400 mb-8'>
                            Tu cuenta ha sido creada exitosamente. Revisa tu correo electrónico para activar tu cuenta.
                        </p>

                        <Button variant='solid' onClick={goToSignIn} className='px-8'>
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
                variant='error'
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

            {/* NUEVO: Modal para usuario ya registrado */}
            <NotificationModal
                isOpen={alreadyRegisteredModal.isOpen}
                onClose={() => setAlreadyRegisteredModal({ isOpen: false, message: '' })}
                title='Usuario Ya Registrado'
                message={alreadyRegisteredModal.message}
                variant='warning'
                actionLabel='Ir a Iniciar Sesión'
                onAction={goToSignIn}
            />
        </div>
    )
}

export default SignUpFormStepper
