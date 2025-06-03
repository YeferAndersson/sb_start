// src/services/ServiceAccess.ts
import { supabase, getUserServices, DicServicio, TblUsuarioServicio } from '@/lib/supabase'

export async function getUserAvailableServices(userId: number) {
    try {
        const services = await getUserServices(userId)
        return services
    } catch (error) {
        console.error('Error obteniendo servicios:', error)
        throw error
    }
}

export async function getAllServices() {
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

export async function assignServiceToUser(userId: number, serviceId: number) {
    try {
        // Verificar si ya tiene el servicio asignado
        const { data: existing, error: checkError } = await supabase
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

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error asignando servicio:', error)
        throw error
    }
}

export async function removeServiceFromUser(userId: number, serviceId: number) {
    try {
        const { data, error } = await supabase
            .from('tbl_usuarios_servicios')
            .update({ estado: 0 })
            .eq('id_usuario', userId)
            .eq('id_servicio', serviceId)
            .select()

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error removiendo servicio:', error)
        throw error
    }
}

export async function getServiceById(serviceId: number) {
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

export async function getUsersWithService(serviceId: number) {
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
        return data
    } catch (error) {
        console.error('Error obteniendo usuarios con servicio:', error)
        throw error
    }
}