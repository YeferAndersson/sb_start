// src/services/AuthService.ts
import { 
    supabase, 
    findUsersByDocIdentity, 
    createNewUser, 
    getUserByEmail,
    TblUsuario, 
    TblUsuarioInsert 
} from '@/lib/supabase'
import type {
    SignInCredential,
    SignUpCredential,
    VerifyDocIdentityRequest,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
    VerifyDocIdentityResponse
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
    const { email, password } = data
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        throw new Error(error.message)
    }

    // Obtener los datos del usuario desde nuestra tabla personalizada
    try {
        const userData = await getUserByEmail(email)
        
        return {
            token: authData.session?.access_token || '',
            user: {
                userId: authData.user?.id || '',
                email: email,
                userName: userData?.nombres || '',
                avatar: userData?.ruta_foto || '',
                authority: [],
                id: userData?.id
            },
            userData: userData  // ← ✅ AGREGAR ESTA LÍNEA
        }
    } catch (userError) {
        console.error('Error al obtener datos del usuario:', userError)
        throw new Error('Error al obtener información del usuario')
    }
}

// FUNCIÓN NUEVA: Verificar si email ya existe (sin registrar en Auth)
export async function apiCheckEmailExists(email: string): Promise<boolean> {
    try {
        const { data: existingUser, error: checkError } = await supabase
            .from('tbl_usuarios')
            .select('id, correo, contrasenia')
            .eq('correo', email)
            .eq('estado', 1)
            .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error al verificar email existente:', checkError)
            throw new Error('Error al verificar la disponibilidad del correo electrónico')
        }

        return !!existingUser
    } catch (error) {
        console.error('Error verificando email:', error)
        throw error
    }
}

// FUNCIÓN CORREGIDA: Validar todos los datos antes de registrar en Supabase Auth
export async function apiValidateSignUpData(data: SignUpCredential): Promise<{ isValid: boolean; error?: string }> {
    const { email, userDetails } = data
    
    try {
        // 🔧 CORRECCIÓN: NO validar email para usuarios existentes
        const isExistingUser = !!userDetails?.existingUserId
        
        if (!isExistingUser) {
            // Solo verificar email para usuarios NUEVOS
            console.log('🔍 Verificando email para usuario NUEVO:', email)
            const emailExists = await apiCheckEmailExists(email)
            if (emailExists) {
                return {
                    isValid: false,
                    error: `El correo electrónico ${email} ya está registrado. Si tienes una cuenta, intenta iniciar sesión o recuperar tu contraseña.`
                }
            }
        } else {
            console.log('⏭️ Saltando verificación de email para usuario EXISTENTE:', email)
        }

        // 2. Validar datos adicionales
        if (userDetails?.pais && userDetails.pais.length > 3) {
            return {
                isValid: false,
                error: 'El país debe tener máximo 3 caracteres (ejemplo: PER para Perú)'
            }
        }

        return { isValid: true }
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Error de validación'
        }
    }
}

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    const { email, password, userName, userDetails } = data
    
    try {
        // 🔍 PASO 1: Validar TODOS los datos antes de tocar Supabase Auth
        console.log('🔍 Validando datos completos antes de registrar...')
        console.log('📋 Datos recibidos:', {
            email,
            userName,
            isExistingUser: !!userDetails?.existingUserId,
            existingUserId: userDetails?.existingUserId
        })
        
        const validation = await apiValidateSignUpData(data)
        if (!validation.isValid) {
            console.error('❌ Validación falló:', validation.error)
            throw new Error(validation.error || 'Datos de registro inválidos')
        }

        // 🚀 PASO 2: Solo AHORA registrar en Supabase Auth
        console.log('📝 Registrando usuario en Supabase Auth...')
        
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth-callback`,
                data: {
                    display_name: userName,
                    signup_source: 'web_form'
                }
            }
        })

        if (error) {
            console.error('❌ Error en Supabase Auth:', error)
            throw new Error(`Error en el registro: ${error.message}`)
        }
        
        console.log('✅ Usuario creado en Auth:', authData)
        
        const supabaseUuid = authData.user?.id
        
        if (!supabaseUuid) {
            throw new Error('No se pudo obtener el identificador único del usuario. Intenta nuevamente.')
        }

        let customUserId = null
        
        // 🔄 PASO 3: Manejar usuario existente vs nuevo
        if (userDetails?.existingUserId) {
            console.log('👤 Procesando usuario EXISTENTE con ID:', userDetails.existingUserId)
            try {
                const { data: updatedUser, error: updateError } = await supabase
                    .from('tbl_usuarios')
                    .update({ 
                        estado: 1,
                        contrasenia: 'SUPABASE_AUTH',
                        uuid: supabaseUuid
                    })
                    .eq('id', userDetails.existingUserId)
                    .select()
                    
                if (updateError) {
                    console.error('❌ Error actualizando usuario existente:', updateError)
                    throw updateError
                }
                
                if (!updatedUser || updatedUser.length === 0) {
                    throw new Error('No se pudo encontrar el usuario existente para actualizar.')
                }
                
                customUserId = updatedUser[0].id
                console.log('✅ Usuario existente actualizado con UUID de Supabase:', customUserId)
                
            } catch (updateError) {
                console.error('❌ Error al actualizar usuario existente:', updateError)
                
                // ROLLBACK: Eliminar de Supabase Auth
                try {
                    await supabase.auth.admin.deleteUser(supabaseUuid)
                    console.log('🔄 Rollback: Usuario eliminado de Auth debido a error en BD')
                } catch (rollbackError) {
                    console.error('❌ Error en rollback:', rollbackError)
                }
                
                throw new Error('Error al vincular la cuenta existente. Por favor, intenta nuevamente.')
            }
            
        } else {
            // Nuevo usuario
            console.log('🆕 Procesando usuario NUEVO')
            
            try {
                const newUserData: TblUsuarioInsert = {
                    nombres: userName,
                    apellidos: userDetails?.apellido || '',
                    tipo_doc_identidad: userDetails?.tipoDocIdentidad || 'DNI',
                    num_doc_identidad: userDetails?.numDocIdentidad || '',
                    correo: email,
                    correo_google: null,
                    pais: userDetails?.pais || 'PER',
                    direccion: userDetails?.direccion || '',
                    sexo: userDetails?.sexo || 'M',
                    telefono: userDetails?.telefono || '',
                    fecha_nacimiento: userDetails?.fechaNacimiento ? 
                        (userDetails.fechaNacimiento instanceof Date ? 
                            userDetails.fechaNacimiento.toISOString().split('T')[0] : 
                            userDetails.fechaNacimiento.toString()) : 
                        null,
                    ruta_foto: null,
                    estado: 1,
                    contrasenia: 'SUPABASE_AUTH',
                    uuid: supabaseUuid
                }
                
                const insertedUser = await createNewUser(newUserData)
                customUserId = insertedUser.id
                console.log('✅ Nuevo usuario creado con UUID de Supabase:', customUserId)
                
            } catch (createError) {
                console.error('❌ Error al crear usuario en tabla personalizada:', createError)
                
                // ROLLBACK: Eliminar de Supabase Auth
                try {
                    await supabase.auth.admin.deleteUser(supabaseUuid)
                    console.log('🔄 Rollback: Usuario eliminado de Auth debido a error en BD')
                } catch (rollbackError) {
                    console.error('❌ Error en rollback:', rollbackError)
                }
                
                if (createError instanceof Error && createError.message.includes('duplicate')) {
                    throw new Error('Ya existe un usuario con estos datos. Verifica la información e intenta nuevamente.')
                }
                
                throw new Error('Error al crear el perfil de usuario. Por favor, intenta nuevamente.')
            }
        }

        // 🎉 PASO 4: Retornar respuesta exitosa
        console.log('🎉 Registro completado exitosamente')
        
        const successResponse = {
            token: authData.session?.access_token || '',
            user: {
                userId: supabaseUuid,
                email: email,
                userName: userName,
                avatar: '',
                authority: [],
                id: customUserId
            }
        }
        
        console.log('📤 Enviando respuesta exitosa:', successResponse)
        return successResponse
        
    } catch (error) {
        console.error('💥 Error completo en signUp:', error)
        
        if (error instanceof Error) {
            // Re-lanzar errores específicos sin modificar
            throw error
        }
        
        throw new Error('Ocurrió un error inesperado durante el registro. Por favor, intenta nuevamente.')
    }
}

export async function apiVerifyDocIdentity(data: VerifyDocIdentityRequest): Promise<VerifyDocIdentityResponse> {
    const { tipoDocIdentidad, numDocIdentidad } = data
    
    try {
        const users = await findUsersByDocIdentity(tipoDocIdentidad, numDocIdentidad)
        
        if (users.length === 0) {
            return {
                exists: false,
                message: 'No existen usuarios registrados con este documento de identidad'
            }
        }
        
        // NUEVO: Verificar si algún usuario ya está registrado en la nueva plataforma
        const registeredUser = users.find(user => user.contrasenia === 'SUPABASE_AUTH')
        
        if (registeredUser) {
            // Enmascarar email para seguridad
            const email = registeredUser.correo
            const [localPart, domain] = email.split('@')
            const maskedEmail = `${localPart.substring(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`
            
            return {
                exists: true,
                singleUser: false, // Para indicar que no debe continuar con registro
                message: `Ya está registrado en esta nueva plataforma con el correo ${maskedEmail}. Vaya a iniciar sesión.`
            }
        }
        
        if (users.length === 1) {
            return {
                exists: true,
                singleUser: true,
                user: users[0],
                message: 'Usuario encontrado'
            }
        }
        
        return {
            exists: true,
            singleUser: false,
            users: users,
            message: 'Se encontraron múltiples usuarios con este documento'
        }
    } catch (error) {
        console.error('Error verificando documento:', error)
        throw new Error('Error al verificar el documento de identidad')
    }
}

export async function apiSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        throw new Error(error.message)
    }
    return true
}

export async function apiForgotPassword(data: ForgotPassword) {
    const { email } = data
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
        throw new Error(error.message)
    }
    
    return true
}

export async function apiResetPassword(data: ResetPassword) {
    const { password } = data
    
    const { error } = await supabase.auth.updateUser({
        password
    })
    
    if (error) {
        throw new Error(error.message)
    }
    
    return true
}