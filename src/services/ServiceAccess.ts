// src/services/ServiceAccess.ts
import { supabase, getUserServices, DicServicio, UsuarioServicio } from '@/lib/supabase';

export async function getUserAvailableServices(userId: number) {
  try {
    const services = await getUserServices(userId);
    return services;
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    throw error;
  }
}

export async function getAllServices() {
  try {
    const { data, error } = await supabase
      .from('dic_servicios')
      .select('*')
      .eq('estado', 1);
    
    if (error) throw error;
    
    return data as DicServicio[];
  } catch (error) {
    console.error('Error obteniendo lista de servicios:', error);
    throw error;
  }
}