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
            }
        }
    } catch (userError) {
        console.error('Error al obtener datos del usuario:', userError)
        throw new Error('Error al obtener información del usuario')
    }
}

// src/services/AuthService.ts - Función apiSignUp mejorada

// src/services/AuthService.ts - Solo las partes que necesitan corrección

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    const { email, password, userName, userDetails } = data
    
    try {
        // 🔍 PASO 1: Verificar si el email ya existe ANTES de intentar registrar
        console.log('🔍 Verificando si el email ya existe:', email)
        
        const { data: existingUser, error: checkError } = await supabase
            .from('tbl_usuarios')
            .select('id, correo, uuid')
            .eq('correo', email)
            .eq('estado', 1)
            .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Error al verificar email existente:', checkError)
            throw new Error('Error al verificar la disponibilidad del correo electrónico')
        }

        if (existingUser) {
            console.log('⚠️ Email ya registrado en nuestra BD:', existingUser)
            throw new Error(`El correo electrónico ${email} ya está registrado. Si tienes una cuenta, intenta iniciar sesión o recuperar tu contraseña.`)
        }

        // 🚀 PASO 2: Registrar usuario en Supabase Auth (PASO 3 original, ahora es PASO 2)
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
            
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                throw new Error(`El correo electrónico ${email} ya está registrado. Si olvidaste tu contraseña, puedes recuperarla en la página de inicio de sesión.`)
            }
            
            if (error.message.includes('invalid email')) {
                throw new Error('El formato del correo electrónico no es válido. Por favor, verifica e intenta nuevamente.')
            }
            
            if (error.message.includes('password')) {
                throw new Error('La contraseña no cumple con los requisitos de seguridad. Debe tener al menos 6 caracteres.')
            }
            
            if (error.message.includes('rate limit') || error.message.includes('too many')) {
                throw new Error('Demasiados intentos de registro. Por favor, espera unos minutos e intenta nuevamente.')
            }
            
            if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.')
            }
            
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
            try {
                const { data: updatedUser, error: updateError } = await supabase
                    .from('tbl_usuarios')
                    .update({ 
                        estado: 1,
                        contrasenia: 'SUPABASE_AUTH',
                        uuid: supabaseUuid
                        // ❌ ELIMINADO: fecha_modificacion
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
            console.log('📝 Creando nuevo usuario en tabla personalizada...')
            
            try {
                const newUserData: TblUsuarioInsert = {
                    nombres: userName,
                    apellidos: userDetails?.apellido || '',
                    tipo_doc_identidad: userDetails?.tipoDocIdentidad || 'DNI',
                    num_doc_identidad: userDetails?.numDocIdentidad || '',
                    correo: email,
                    correo_google: null,
                    pais: userDetails?.pais || 'Perú',
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
                    // ❌ ELIMINADO: fecha_registro y fecha_modificacion
                }
                
                const insertedUser = await createNewUser(newUserData)
                customUserId = insertedUser.id
                console.log('✅ Nuevo usuario creado con UUID de Supabase:', customUserId)
                
            } catch (createError) {
                console.error('❌ Error al crear usuario en tabla personalizada:', createError)
                
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
        
        return {
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
        
    } catch (error) {
        console.error('💥 Error completo en signUp:', error)
        
        if (error instanceof Error) {
            if (error.message.includes('ya está registrado') || 
                error.message.includes('already registered') ||
                error.message.includes('already been registered')) {
                throw error
            }
            
            if (error.message.includes('fetch') || 
                error.message.includes('network') || 
                error.message.includes('NetworkError') ||
                error.message.includes('Failed to fetch')) {
                throw new Error('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.')
            }
            
            if (error.message.includes('validation') || 
                error.message.includes('invalid') ||
                error.message.includes('format')) {
                throw new Error('Los datos ingresados no son válidos. Verifica la información e intenta nuevamente.')
            }
            
            if (error.message.includes('500') || 
                error.message.includes('Internal Server Error') ||
                error.message.includes('Database error')) {
                throw new Error('Error del servidor. Por favor, intenta nuevamente en unos minutos.')
            }
            
            if (error.message.includes('permission') || 
                error.message.includes('unauthorized') ||
                error.message.includes('forbidden')) {
                throw new Error('Error de permisos. Contacta al administrador del sistema.')
            }
            
            if (error.message.length > 10) {
                throw error
            }
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