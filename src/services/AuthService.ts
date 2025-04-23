// src/services/AuthService.ts
import { supabase, findUsersByDocIdentity, createNewUser, TblUsuario } from '@/lib/supabase'
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
    const { data: userData } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('correo', email)
        .eq('estado', 1)
        .single()

    return {
        token: authData.session?.access_token || '',
        user: {
            userId: authData.user?.id || '',
            email: email,
            userName: userData?.nombre || '',
            avatar: userData?.rutafoto || '',
            authority: [],
            id: userData?.id
        }
    }
}

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    const { email, password, userName, userDetails } = data;
    
    try {
      // Primero registramos el usuario en Supabase Auth para obtener el UUID
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`
        }
      });
  
      if (error) {
        console.error('Error en auth.signUp:', error);
        throw error;
      }
      
      console.log('Usuario creado en Auth:', authData);
      
      // Obtenemos el UUID generado por Supabase
      const supabaseUuid = authData.user?.id;
      
      if (!supabaseUuid) {
        throw new Error('No se pudo obtener el UUID del usuario');
      }
  
      // Luego actualizamos o creamos en nuestra tabla personalizada
      let customUserId = null;
      
      // Si es un usuario existente, actualizamos con el UUID de Supabase
      if (userDetails?.existingUserId) {
        try {
          const { data: updatedUser, error: updateError } = await supabase
            .from('tbl_usuarios')
            .update({ 
              estado: 1,
              password: 'SUPABASE_AUTH',
              uuid: supabaseUuid  // Guardamos el UUID de Supabase
            })
            .eq('id', userDetails.existingUserId)
            .select();
            
          if (updateError) throw updateError;
          
          customUserId = updatedUser[0].id;
          console.log('Usuario existente actualizado con UUID de Supabase');
        } catch (updateError) {
          console.error('Error al actualizar usuario existente:', updateError);
        }
      } else {
        // Si es un usuario nuevo, lo creamos en nuestra tabla personalizada con el UUID
        try {
          const newUserData = {
            nombre: userName,
            apellido: userDetails?.apellido || '',
            tipodocidentidad: userDetails?.tipoDocIdentidad || 'DNI',
            numdocidentidad: userDetails?.numDocIdentidad || '',
            correo: email,
            correogoogle: null,
            pais: userDetails?.pais || 'Perú',
            direccion: userDetails?.direccion || '',
            sexo: userDetails?.sexo || 'M',
            telefono: userDetails?.telefono || '',
            fechanacimiento: userDetails?.fechaNacimiento || new Date(),
            rutafoto: null,
            estado: 1,
            password: 'SUPABASE_AUTH',
            uuid: supabaseUuid  // Guardamos el UUID de Supabase
          };
          
          const { data: insertedUser, error: insertError } = await supabase
            .from('tbl_usuarios')
            .insert([newUserData])
            .select();
            
          if (insertError) throw insertError;
          
          customUserId = insertedUser[0].id;
          console.log('Nuevo usuario creado con UUID de Supabase:', customUserId);
        } catch (createError) {
          console.error('Error al crear usuario en tabla personalizada:', createError);
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
          Id: customUserId
        }
      };
    } catch (error) {
      console.error('Error completo en signUp:', error);
      throw error;
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
        
        // Si solo existe un usuario con ese documento
        if (users.length === 1) {
            return {
                exists: true,
                singleUser: true,
                user: users[0],
                message: 'Usuario encontrado'
            }
        }
        
        // Si existen múltiples usuarios con el mismo documento
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