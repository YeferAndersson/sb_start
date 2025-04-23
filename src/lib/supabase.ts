// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL y Anon Key deben estar definidos en las variables de entorno')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para los usuarios de nuestra tabla personalizada
export interface TblUsuario {
  id: number
  nombre: string
  apellido: string
  tipodocidentidad: string
  numdocidentidad: string
  correo: string
  CorreoGoogle: string | null
  pais: string
  direccion: string
  sexo: string
  telefono: string
  fechanacimiento: Date
  password: string | null
  rutafoto: string | null
  estado: number
  uuid: string | null  
}

// Funciones de autenticación personalizadas
export const findUsersByDocIdentity = async (tipoDoc: string, numDoc: string) => {
  const { data, error } = await supabase
    .from('tbl_usuarios')
    .select('*')
    .eq('tipodocidentidad', tipoDoc)
    .eq('numdocidentidad', numDoc)
    .eq('estado', 1)

  if (error) {
    throw error
  }

  return data as TblUsuario[]
}

export const createNewUser = async (userData: Omit<TblUsuario, 'id'>) => {
    const formattedData = {
      ...userData,
      password: "SUPABASE_AUTH", // Valor fijo para usuarios autenticados con Supabase
      fechanacimiento: userData.fechanacimiento instanceof Date 
        ? userData.fechanacimiento.toISOString().split('T')[0] 
        : userData.fechanacimiento
    };
  
    console.log('Datos a insertar en tbl_usuarios:', formattedData);
  
    try {
      const { data, error } = await supabase
        .from('tbl_usuarios')
        .insert([formattedData])
        .select();
  
      if (error) {
        console.error('Error detallado al insertar usuario:', error);
        throw error;
      }
  
      return data[0] as TblUsuario;
    } catch (err) {
      console.error('Error al crear usuario:', err);
      throw err;
    }
  }

// Función para actualizar usuario existente si es necesario
export const updateExistingUser = async (id: number, userData: Partial<TblUsuario>) => {
  const { data, error } = await supabase
    .from('tbl_usuarios')
    .update(userData)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return data[0] as TblUsuario
}

// Nueva función para obtener un usuario por su UUID de Supabase
export const getUserByUuid = async (uuid: string) => {
    const { data, error } = await supabase
      .from('tbl_usuarios')
      .select('*')
      .eq('uuid', uuid)
      .single()
  
    if (error) {
      console.error('Error al buscar usuario por UUID:', error)
      throw error
    }
  
    return data as TblUsuario
  }