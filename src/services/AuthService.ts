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

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    const { email, password, userName, userDetails } = data
    
    try {
        // Primero registramos el usuario en Supabase Auth
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth-callback`
            }
        })

        if (error) {
            console.error('Error en auth.signUp:', error)
            throw error
        }
        
        console.log('Usuario creado en Auth:', authData)
        
        const supabaseUuid = authData.user?.id
        
        if (!supabaseUuid) {
            throw new Error('No se pudo obtener el UUID del usuario')
        }

        let customUserId = null
        
        // Si es un usuario existente, actualizamos con el UUID de Supabase
        if (userDetails?.existingUserId) {
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
                    
                if (updateError) throw updateError
                
                customUserId = updatedUser[0].id
                console.log('Usuario existente actualizado con UUID de Supabase')
            } catch (updateError) {
                console.error('Error al actualizar usuario existente:', updateError)
                throw updateError
            }
        } else {
            // Crear nuevo usuario en nuestra tabla personalizada
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
                console.log('Nuevo usuario creado con UUID de Supabase:', customUserId)
            } catch (createError) {
                console.error('Error al crear usuario en tabla personalizada:', createError)
                throw createError
            }
        }

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
        console.error('Error completo en signUp:', error)
        throw error
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