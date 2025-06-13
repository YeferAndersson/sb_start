// src/services/ServiceAccess.ts - Corregido
import { supabase, getUserServices, type DicServicio, type TblUsuarioServicio } from '@/lib/supabase'

// Tipo para el resultado de servicios de usuario con servicio anidado
export type UsuarioServicioConServicio = TblUsuarioServicio & {
    servicio: DicServicio
}

export async function getUserAvailableServices(userId: number): Promise<UsuarioServicioConServicio[]> {
    try {
        const services = await getUserServices(userId)
        return services as UsuarioServicioConServicio[]
    } catch (error) {
        console.error('Error obteniendo servicios:', error)
        throw error
    }
}

export async function getAllServices(): Promise<DicServicio[]> {
    try {
        const { data, error } = await supabase
            .from('dic_servicios')
            .select('*')
            .order('nombre')
        
        if (error) throw error
        
        return data as DicServicio[]
    } catch (error) {
        console.error('Error obteniendo lista de servicios:', error)
        throw error
    }
}

export async function assignServiceToUser(userId: number, serviceId: number): Promise<TblUsuarioServicio> {
    try {
        // Verificar si ya tiene el servicio asignado
        const { data: existing } = await supabase
            .from('tbl_usuarios_servicios')
            .select('id')
            .eq('id_usuario', userId)
            .eq('id_servicio', serviceId)
            .eq('estado', 1)
            .single()

        if (existing) {
            throw new Error('El usuario ya tiene este servicio asignado')
        }

        const { data, error } = await supabase
            .from('tbl_usuarios_servicios')
            .insert([{
                id_usuario: userId,
                id_servicio: serviceId,
                fecha_asignacion: new Date().toISOString(),
                estado: 1
            }])
            .select()
            .single()

        if (error) throw error
        return data as TblUsuarioServicio
    } catch (error) {
        console.error('Error asignando servicio:', error)
        throw error
    }
}

export async function removeServiceFromUser(userId: number, serviceId: number): Promise<TblUsuarioServicio> {
    try {
        const { data, error } = await supabase
            .from('tbl_usuarios_servicios')
            .update({ estado: 0 })
            .eq('id_usuario', userId)
            .eq('id_servicio', serviceId)
            .select()
            .single()

        if (error) throw error
        return data as TblUsuarioServicio
    } catch (error) {
        console.error('Error removiendo servicio:', error)
        throw error
    }
}

export async function getServiceById(serviceId: number): Promise<DicServicio> {
    try {
        const { data, error } = await supabase
            .from('dic_servicios')
            .select('*')
            .eq('id', serviceId)
            .single()

        if (error) throw error
        return data as DicServicio
    } catch (error) {
        console.error('Error obteniendo servicio por ID:', error)
        throw error
    }
}

export async function getUsersWithService(serviceId: number): Promise<UsuarioServicioConServicio[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_usuarios_servicios')
            .select(`
                *,
                usuario:id_usuario(*),
                servicio:id_servicio(*)
            `)
            .eq('id_servicio', serviceId)
            .eq('estado', 1)

        if (error) throw error
        return data as UsuarioServicioConServicio[]
    } catch (error) {
        console.error('Error obteniendo usuarios con servicio:', error)
        throw error
    }
}