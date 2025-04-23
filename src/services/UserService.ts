// src/services/UserService.ts
import { supabase } from '@/lib/supabase'
import type { TblUsuario } from '@/lib/supabase'

export async function getUserProfile(userId: string) {
    // Primero obtenemos el correo del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser(userId)
    
    if (authError) {
        throw new Error(authError.message)
    }
    
    const email = authData.user?.email
    
    if (!email) {
        throw new Error('Usuario no encontrado')
    }
    
    // Luego buscamos el perfil completo en nuestra tabla personalizada
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('correo', email)
        .eq('estado', 1)
        .single()
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data as TblUsuario
}

export async function updateUserProfile(userId: number, userData: Partial<Omit<TblUsuario, 'id'>>) {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .update(userData)
        .eq('id', userId)
        .select()
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data[0] as TblUsuario
}

export async function getAllTiposDocumento() {
    // Obtener tipos de documento únicos desde la tabla de usuarios
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('tipodocidentidad')
        .eq('estado', 1)
    
    if (error) {
        throw new Error(error.message)
    }
    
    // Extraer valores únicos
    const tiposSet = new Set<string>()
    data.forEach(item => {
        if (item.tipodocidentidad) {
            tiposSet.add(item.tipodocidentidad)
        }
    })
    
    // Si no hay tipos predefinidos, devolver al menos DNI
    if (tiposSet.size === 0) {
        tiposSet.add('DNI')
    }
    
    return Array.from(tiposSet).map(tipo => ({
        value: tipo,
        label: tipo
    }))
}