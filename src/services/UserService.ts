// src/services/UserService.ts
import { supabase, TblUsuario, TblUsuarioUpdate } from '@/lib/supabase'

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

export async function updateUserProfile(userId: number, userData: TblUsuarioUpdate) {
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
        .select('tipo_doc_identidad')
        .eq('estado', 1)
        .not('tipo_doc_identidad', 'is', null)
    
    if (error) {
        throw new Error(error.message)
    }
    
    // Extraer valores únicos
    const tiposSet = new Set<string>()
    data.forEach(item => {
        if (item.tipo_doc_identidad) {
            tiposSet.add(item.tipo_doc_identidad)
        }
    })
    
    // Si no hay tipos predefinidos, devolver tipos comunes
    if (tiposSet.size === 0) {
        return [
            { value: 'DNI', label: 'DNI' },
            { value: 'CE', label: 'Carné de Extranjería' },
            { value: 'PASSPORT', label: 'Pasaporte' }
        ]
    }
    
    return Array.from(tiposSet).map(tipo => ({
        value: tipo,
        label: tipo
    }))
}

export async function getUserById(userId: number) {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('id', userId)
        .eq('estado', 1)
        .single()
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data as TblUsuario
}

export async function getUserByUuid(uuid: string) {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('uuid', uuid)
        .eq('estado', 1)
        .single()
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data as TblUsuario
}