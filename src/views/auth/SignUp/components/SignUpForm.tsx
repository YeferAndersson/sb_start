// src/views/auth/SignUp/components/SignUpForm.tsx
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { TblUsuario } from '@/lib/supabase'
import { apiVerifyDocIdentity } from '@/services/AuthService'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

// Estados del formulario de registro
type RegistrationState = 'init' | 'verifying' | 'existing_single' | 'existing_multiple' | 'new_user'

type SignUpVerifySchema = {
    tipoDocIdentidad: string
    numDocIdentidad: string
}

type SignUpExistingUserSchema = {
    userName: string
    email: string
    password: string
    confirmPassword: string
}

type SignUpNewUserSchema = {
    userName: string
    apellido: string
    email: string
    password: string
    confirmPassword: string
    pais: string
    direccion: string
    sexo: string
    telefono: string
}

const tiposDocumento = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carné de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
]

const sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
]

const verifySchema: ZodType<SignUpVerifySchema> = z.object({
    tipoDocIdentidad: z.string({ required_error: 'Seleccione el tipo de documento' }),
    numDocIdentidad: z.string({ required_error: 'Ingrese su número de documento' })
        .min(8, { message: 'El documento debe tener al menos 8 caracteres' })
})

const existingUserSchema: ZodType<SignUpExistingUserSchema> = z.object({
    userName: z.string().min(1, { message: 'El nombre es requerido' }),
    email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
})

const newUserSchema: ZodType<SignUpNewUserSchema> = z.object({
    userName: z.string().min(1, { message: 'El nombre es requerido' }),
    apellido: z.string().min(1, { message: 'El apellido es requerido' }),
    email: z.string().email({ message: 'Ingrese un correo electrónico válido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string(),
    pais: z.string().min(1, { message: 'El país es requerido' }),
    direccion: z.string().min(1, { message: 'La dirección es requerida' }),
    sexo: z.string().min(1, { message: 'Seleccione su sexo' }),
    telefono: z.string().min(9, { message: 'Ingrese un número de teléfono válido' })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [registrationState, setRegistrationState] = useState<RegistrationState>('init')
    const [foundUsers, setFoundUsers] = useState<TblUsuario[]>([])
    const [selectedUser, setSelectedUser] = useState<TblUsuario | null>(null)

    const { signUp } = useAuth()

    // Formulario para verificar documento
    const {
        handleSubmit: handleSubmitVerify,
        formState: { errors: errorsVerify },
        control: controlVerify,
        getValues: getVerifyValues
    } = useForm<SignUpVerifySchema>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            tipoDocIdentidad: 'DNI'
        }
    })

    // Formulario para usuario existente
    const {
        handleSubmit: handleSubmitExisting,
        formState: { errors: errorsExisting },
        control: controlExisting,
        setValue: setExistingValue
    } = useForm<SignUpExistingUserSchema>({
        resolver: zodResolver(existingUserSchema)
    })

    // Formulario para nuevo usuario
    const {
        handleSubmit: handleSubmitNew,
        formState: { errors: errorsNew },
        control: controlNew,
        setValue: setNewValue
    } = useForm<SignUpNewUserSchema>({
        resolver: zodResolver(newUserSchema),
        defaultValues: {
            pais: 'Perú',
            sexo: 'M'
        }
    })

    // Verificar documento de identidad
    const onVerifyDocument = async (values: SignUpVerifySchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            const result = await apiVerifyDocIdentity(values)
            
            if (result.exists) {
                if (result.singleUser && result.user) {
                    // Un solo usuario encontrado
                    setSelectedUser(result.user)
                    setExistingValue('userName', result.user.nombre)
                    setExistingValue('email', result.user.correo)
                    setRegistrationState('existing_single')
                } else if (result.users && result.users.length > 0) {
                    // Múltiples usuarios encontrados
                    setFoundUsers(result.users)
                    setRegistrationState('existing_multiple')
                }
            } else {
                // No se encontraron usuarios - registro nuevo
                setRegistrationState('new_user')
                // Mantener los valores del documento en el nuevo formulario
                setNewValue('numDocIdentidad', values.numDocIdentidad)
                setNewValue('tipoDocIdentidad', values.tipoDocIdentidad)
            }
        } catch (error) {
            setMessage?.((error as Error).message || 'Error al verificar el documento')
        } finally {
            setSubmitting(false)
        }
    }

    // Seleccionar usuario de la lista (caso múltiples usuarios)
    const handleSelectUser = (user: TblUsuario) => {
        setSelectedUser(user)
        setExistingValue('userName', user.nombre)
        setExistingValue('email', user.correo)
        setRegistrationState('existing_single')
    }

    // Registro para usuario existente
    const onSignUpExisting = async (values: SignUpExistingUserSchema) => {
        if (disableSubmit || !selectedUser) return

        setSubmitting(true)
        try {
            const result = await signUp({
                userName: values.userName,
                email: values.email,
                password: values.password,
                userDetails: {
                    existingUserId: selectedUser.id
                }
            })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        } catch (error) {
            setMessage?.((error as Error).message || 'Error al registrar usuario')
        } finally {
            setSubmitting(false)
        }
    }

    // Registro para usuario nuevo
    const onSignUpNew = async (values: SignUpNewUserSchema) => {
        if (disableSubmit) return

        setSubmitting(true)
        try {
            const { tipoDocIdentidad, numDocIdentidad } = getVerifyValues()
            
            const result = await signUp({
                userName: values.userName,
                email: values.email,
                password: values.password,
                userDetails: {
                    tipoDocIdentidad,
                    numDocIdentidad,
                    apellido: values.apellido,
                    pais: values.pais,
                    direccion: values.direccion,
                    sexo: values.sexo,
                    telefono: values.telefono,
                    fechaNacimiento: new Date()
                }
            })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        } catch (error) {
            setMessage?.((error as Error).message || 'Error al registrar usuario')
        } finally {
            setSubmitting(false)
        }
    }

    // Volver al inicio del proceso
    const handleReset = () => {
        setRegistrationState('init')
        setSelectedUser(null)
        setFoundUsers([])
    }

    return (
        <div className={className}>
            {/* Paso inicial: Verificación de documento */}
            {registrationState === 'init' && (
                <Form onSubmit={handleSubmitVerify(onVerifyDocument)}>
                    <FormItem
                        label="Tipo de Documento"
                        invalid={Boolean(errorsVerify.tipoDocIdentidad)}
                        errorMessage={errorsVerify.tipoDocIdentidad?.message}
                    >
                        <Controller
                            name="tipoDocIdentidad"
                            control={controlVerify}
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
                        invalid={Boolean(errorsVerify.numDocIdentidad)}
                        errorMessage={errorsVerify.numDocIdentidad?.message}
                    >
                        <Controller
                            name="numDocIdentidad"
                            control={controlVerify}
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
                    >
                        {isSubmitting ? 'Verificando...' : 'Verificar'}
                    </Button>
                </Form>
            )}

            {/* Opción de selección cuando hay múltiples usuarios */}
            {registrationState === 'existing_multiple' && (
                <div>
                    <h4 className="mb-4">Se encontraron múltiples cuentas con este documento</h4>
                    <p className="mb-4">Seleccione la cuenta con la que desea registrarse:</p>
                    
                    <div className="mb-4 space-y-2">
                        {foundUsers.map(user => (
                            <div 
                                key={user.id} 
                                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => handleSelectUser(user)}
                            >
                                <p className="font-medium">{user.nombre} {user.apellido}</p>
                                <p className="text-sm text-gray-500">{user.correo}</p>
                            </div>
                        ))}
                    </div>
                    
                    <Button
                        block
                        variant="default"
                        onClick={handleReset}
                    >
                        Volver
                    </Button>
                </div>
            )}

            {/* Formulario para usuario existente */}
            {registrationState === 'existing_single' && selectedUser && (
                <Form onSubmit={handleSubmitExisting(onSignUpExisting)}>
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm">Se encontró un usuario registrado con este documento de identidad. Complete el formulario para crear su cuenta.</p>
                    </div>
                    
                    <FormItem
                        label="Nombre"
                        invalid={Boolean(errorsExisting.userName)}
                        errorMessage={errorsExisting.userName?.message}
                    >
                        <Controller
                            name="userName"
                            control={controlExisting}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    disabled
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem
                        label="Correo Electrónico"
                        invalid={Boolean(errorsExisting.email)}
                        errorMessage={errorsExisting.email?.message}
                    >
                        <Controller
                            name="email"
                            control={controlExisting}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    disabled
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem
                        label="Contraseña"
                        invalid={Boolean(errorsExisting.password)}
                        errorMessage={errorsExisting.password?.message}
                    >
                        <Controller
                            name="password"
                            control={controlExisting}
                            render={({ field }) => (
                                <Input
                                    type="password"
                                    placeholder="Ingrese su contraseña"
                                    autoComplete="new-password"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem
                        label="Confirmar Contraseña"
                        invalid={Boolean(errorsExisting.confirmPassword)}
                        errorMessage={errorsExisting.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={controlExisting}
                            render={({ field }) => (
                                <Input
                                    type="password"
                                    placeholder="Confirme su contraseña"
                                    autoComplete="new-password"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <div className="flex gap-2 mt-6">
                        <Button
                            block
                            variant="default"
                            onClick={handleReset}
                        >
                            Volver
                        </Button>
                        
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </div>
                </Form>
            )}

            {/* Formulario para nuevo usuario */}
            {registrationState === 'new_user' && (
                <Form onSubmit={handleSubmitNew(onSignUpNew)}>
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm">No se encontró ningún usuario con este documento. Complete el formulario para crear una nueva cuenta.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem
                            label="Nombre"
                            invalid={Boolean(errorsNew.userName)}
                            errorMessage={errorsNew.userName?.message}
                        >
                            <Controller
                                name="userName"
                                control={controlNew}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="Nombre"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Apellido"
                            invalid={Boolean(errorsNew.apellido)}
                            errorMessage={errorsNew.apellido?.message}
                        >
                            <Controller
                                name="apellido"
                                control={controlNew}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        placeholder="Apellido"
                                        autoComplete="off"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    
                    <FormItem
                        label="Correo Electrónico"
                        invalid={Boolean(errorsNew.email)}
                        errorMessage={errorsNew.email?.message}
                    >
                        <Controller
                            name="email"
                            control={controlNew}
                            render={({ field }) => (
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem
                            label="Contraseña"
                            invalid={Boolean(errorsNew.password)}
                            errorMessage={errorsNew.password?.message}
                        >
                            <Controller
                                name="password"
                                control={controlNew}
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
                            invalid={Boolean(errorsNew.confirmPassword)}
                            errorMessage={errorsNew.confirmPassword?.message}
                        >
                            <Controller
                                name="confirmPassword"
                                control={controlNew}
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
                    
                    <FormItem
                        label="País"
                        invalid={Boolean(errorsNew.pais)}
                        errorMessage={errorsNew.pais?.message}
                    >
                        <Controller
                            name="pais"
                            control={controlNew}
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
                        invalid={Boolean(errorsNew.direccion)}
                        errorMessage={errorsNew.direccion?.message}
                    >
                        <Controller
                            name="direccion"
                            control={controlNew}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="Dirección"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem
                            label="sexo"
                            invalid={Boolean(errorsNew.sexo)}
                            errorMessage={errorsNew.sexo?.message}
                        >
                            <Controller
                                name="sexo"
                                control={controlNew}
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
                            invalid={Boolean(errorsNew.telefono)}
                            errorMessage={errorsNew.telefono?.message}
                        >
                            <Controller
                                name="telefono"
                                control={controlNew}
                                render={({ field }) => (
                                    <Input
                                        type="tel"
                                        placeholder="Teléfono"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        <Button
                            block
                            variant="default"
                            onClick={handleReset}
                        >
                            Volver
                        </Button>
                        
                        <Button
                            block
                            loading={isSubmitting}
                            variant="solid"
                            type="submit"
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </div>
                </Form>
            )}
        </div>
    )
}

export default SignUpForm