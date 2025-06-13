// src/lib/supabase.ts - Actualizado con nueva estructura de BD
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/@types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL y Anon Key deben estar definidos en las variables de entorno')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Tipos basados en la nueva estructura de la base de datos
export type TblUsuario = Database['public']['Tables']['tbl_usuarios']['Row']
export type TblUsuarioInsert = Database['public']['Tables']['tbl_usuarios']['Insert']
export type TblUsuarioUpdate = Database['public']['Tables']['tbl_usuarios']['Update']

export type DicServicio = Database['public']['Tables']['dic_servicios']['Row']
export type TblUsuarioServicio = Database['public']['Tables']['tbl_usuarios_servicios']['Row']

// Tipos para facultades, carreras y especialidades
export type DicFacultad = Database['public']['Tables']['dic_facultades']['Row']
export type DicCarrera = Database['public']['Tables']['dic_carreras']['Row']
export type DicEspecialidad = Database['public']['Tables']['dic_especialidades']['Row']
export type DicDenominacion = Database['public']['Tables']['dic_denominaciones']['Row']

// Tipos para tesistas
export type TblTesista = Database['public']['Tables']['tbl_tesistas']['Row']
export type TblTesistaInsert = Database['public']['Tables']['tbl_tesistas']['Insert']

// Tipos para trámites
export type TblTramite = Database['public']['Tables']['tbl_tramites']['Row']
export type TblTramiteInsert = Database['public']['Tables']['tbl_tramites']['Insert']
export type TblTramiteUpdate = Database['public']['Tables']['tbl_tramites']['Update']

// Tipos para etapas y modalidades
export type DicEtapa = Database['public']['Tables']['dic_etapas']['Row']
export type DicModalidad = Database['public']['Tables']['dic_modalidades']['Row']
export type DicTipoTrabajo = Database['public']['Tables']['dic_tipo_trabajos']['Row']

// Tipos para líneas de investigación
export type TblSublineaVri = Database['public']['Tables']['tbl_sublineas_vri']['Row']
export type DicLineaUniversidad = Database['public']['Tables']['dic_lineas_universidad']['Row']
export type DicAreaOcde = Database['public']['Tables']['dic_areas_ocde']['Row']
export type DicSubareaOcde = Database['public']['Tables']['dic_subareas_ocde']['Row']
export type DicDisciplina = Database['public']['Tables']['dic_disciplinas']['Row']

// Tipos para docentes
export type TblDocente = Database['public']['Tables']['tbl_docentes']['Row']
export type TblDocenteInsert = Database['public']['Tables']['tbl_docentes']['Insert']

// Tipos para integrantes de trámites
export type TblIntegrante = Database['public']['Tables']['tbl_integrantes']['Row']
export type TblIntegranteInsert = Database['public']['Tables']['tbl_integrantes']['Insert']

// Funciones de autenticación personalizadas
export const findUsersByDocIdentity = async (tipoDoc: string, numDoc: string) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('tipo_doc_identidad', tipoDoc)
        .eq('num_doc_identidad', numDoc)
        .eq('estado', 1)

    if (error) {
        throw error
    }

    return data as TblUsuario[]
}

export const createNewUser = async (userData: TblUsuarioInsert) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .insert([userData])
        .select()

    if (error) {
        console.error('Error al insertar usuario:', error)
        throw error
    }

    return data[0] as TblUsuario
}

export const updateExistingUser = async (id: number, userData: TblUsuarioUpdate) => {
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

export const getUserByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('tbl_usuarios')
        .select('*')
        .eq('correo', email)
        .eq('estado', 1)
        .single()

    if (error) {
        console.error('Error al buscar usuario por email:', error)
        throw error
    }

    return data as TblUsuario
}

// Funciones para servicios de usuario
export const getUserServices = async (userId: number) => {
    const { data, error } = await supabase
        .from('tbl_usuarios_servicios')
        .select(`
            *,
            servicio:id_servicio(*)
        `)
        .eq('id_usuario', userId)
        .eq('estado', 1)

    if (error) {
        console.error('Error al obtener servicios del usuario:', error)
        throw error
    }

    return data
}

// FACULTADES, CARRERAS Y ESPECIALIDADES
export const getFacultades = async () => {
    const { data, error } = await supabase
        .from('dic_facultades')
        .select('*')
        .eq('estado_facultad', 1)
        .order('nombre')

    if (error) throw error
    return data as DicFacultad[]
}

export const getCarreras = async (facultadId?: number) => {
    let query = supabase
        .from('dic_carreras')
        .select(`
            *,
            facultad:id_facultad(*)
        `)
        .eq('estado_carrera', 1)

    if (facultadId) {
        query = query.eq('id_facultad', facultadId)
    }

    const { data, error } = await query.order('nombre')
    if (error) throw error
    return data
}

export const getEspecialidades = async (carreraId: number) => {
    const { data, error } = await supabase
        .from('dic_especialidades')
        .select(`
            *,
            carrera:id_carrera(*)
        `)
        .eq('id_carrera', carreraId)
        .eq('estado_especialidad', 1)
        .order('nombre')

    if (error) throw error
    return data
}

export const getDenominaciones = async (carreraId: number, especialidadId?: number) => {
    let query = supabase
        .from('dic_denominaciones')
        .select(`
            *,
            carrera:id_carrera(*),
            especialidad:id_especialidad(*)
        `)
        .eq('id_carrera', carreraId)
        .eq('estado_denominacion', 1)

    if (especialidadId) {
        query = query.eq('id_especialidad', especialidadId)
    }

    const { data, error } = await query.order('nombre')
    if (error) throw error
    return data
}

// TESISTAS
export const getTesistaByUsuario = async (usuarioId: number) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .select(`
            *,
            usuario:id_usuario(*),
            carrera:id_carrera(*),
            especialidad:id_especialidad(*)
        `)
        .eq('id_usuario', usuarioId)
        .eq('estado_tesista', 1)
        .single()

    if (error) {
        console.error('Error al obtener tesista:', error)
        throw error
    }
    return data
}

export const checkIsTesista = async (usuarioId: number) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .select('id')
        .eq('id_usuario', usuarioId)
        .eq('estado_tesista', 1)

    if (error) throw error
    return data && data.length > 0
}

export const createTesista = async (tesistaData: TblTesistaInsert) => {
    const { data, error } = await supabase
        .from('tbl_tesistas')
        .insert([{
            ...tesistaData,
            estado_tesista: 1
        }])
        .select()

    if (error) throw error
    return data[0] as TblTesista
}

// TRÁMITES
export const getEtapas = async () => {
    const { data, error } = await supabase
        .from('dic_etapas')
        .select('*')
        .order('id')

    if (error) throw error
    return data as DicEtapa[]
}

export const getModalidades = async () => {
    const { data, error } = await supabase
        .from('dic_modalidades')
        .select('*')
        .eq('estado_modalidad', 1)

    if (error) throw error
    return data as DicModalidad[]
}

export const getTipoTrabajos = async () => {
    const { data, error } = await supabase
        .from('dic_tipo_trabajos')
        .select('*')
        .eq('estado_tipo_trabajo', 1)

    if (error) throw error
    return data as DicTipoTrabajo[]
}

// LÍNEAS DE INVESTIGACIÓN
export const getLineasUniversidad = async () => {
    const { data, error } = await supabase
        .from('dic_lineas_universidad')
        .select('*')
        .eq('estado_linea_universidad', 1)
        .order('nombre')

    if (error) throw error
    return data as DicLineaUniversidad[]
}

export const getAreasOcde = async () => {
    const { data, error } = await supabase
        .from('dic_areas_ocde')
        .select('*')
        .eq('estado_area', 1)
        .order('nombre')

    if (error) throw error
    return data as DicAreaOcde[]
}

export const getSubareasOcde = async (areaId: number) => {
    const { data, error } = await supabase
        .from('dic_subareas_ocde')
        .select('*')
        .eq('id_area', areaId)
        .eq('estado_subarea', 1)
        .order('nombre')

    if (error) throw error
    return data as DicSubareaOcde[]
}

export const getDisciplinas = async (subareaId: number) => {
    const { data, error } = await supabase
        .from('dic_disciplinas')
        .select('*')
        .eq('id_subarea', subareaId)
        .eq('estado_disciplina', 1)
        .order('nombre')

    if (error) throw error
    return data as DicDisciplina[]
}

export const getSublineasVri = async (carreraId?: number) => {
    let query = supabase
        .from('tbl_sublineas_vri')
        .select(`
            *,
            area:id_area(*),
            carrera:id_carrera(*),
            subarea:id_subarea(*),
            disciplina:id_disciplina(*),
            linea_universidad:id_linea_universidad(*)
        `)
        .eq('estado_sublinea_vri', 1)

    if (carreraId) {
        query = query.eq('id_carrera', carreraId)
    }

    const { data, error } = await query.order('nombre')
    if (error) throw error
    return data
}

// TRÁMITES - FUNCIONES PRINCIPALES
export const getTramitesByTesista = async (tesistaId: number) => {
    // Primero obtener los trámites donde el tesista es integrante
    const { data: integrantes, error: integrantesError } = await supabase
        .from('tbl_integrantes')
        .select('id_tramite')
        .eq('id_tesista', tesistaId)
        .eq('estado_integrante', 1)

    if (integrantesError) throw integrantesError

    const tramiteIds = integrantes.map(i => i.id_tramite)
    
    if (tramiteIds.length === 0) return []

    const { data, error } = await supabase
        .from('tbl_tramites')
        .select(`
            *,
            etapa:id_etapa(*),
            modalidad:id_modalidad(*),
            denominacion:id_denominacion(*),
            tipo_trabajo:id_tipo_trabajo(*),
            sublinea_vri:id_sublinea_vri(*)
        `)
        .in('id', tramiteIds)
        .eq('estado_tramite', 1)
        .order('fecha_registro', { ascending: false })

    if (error) throw error
    return data
}

export const getTramiteById = async (tramiteId: number) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .select(`
            *,
            etapa:id_etapa(*),
            modalidad:id_modalidad(*),
            denominacion:id_denominacion(*),
            tipo_trabajo:id_tipo_trabajo(*),
            sublinea_vri:id_sublinea_vri(*)
        `)
        .eq('id', tramiteId)
        .single()

    if (error) throw error
    return data
}

export const createTramite = async (tramiteData: TblTramiteInsert) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .insert([{
            ...tramiteData,
            estado_tramite: 1
        }])
        .select()

    if (error) throw error
    return data[0] as TblTramite
}

export const updateTramiteEtapa = async (tramiteId: number, nuevaEtapaId: number) => {
    const { data, error } = await supabase
        .from('tbl_tramites')
        .update({ id_etapa: nuevaEtapaId })
        .eq('id', tramiteId)
        .select()

    if (error) throw error
    return data[0] as TblTramite
}

// GENERACIÓN DE CÓDIGOS
export const generarCodigoProyecto = async () => {
    const currentYear = new Date().getFullYear()
    
    // Obtener el último código para este año
    const { data, error } = await supabase
        .from('tbl_tramites')
        .select('codigo_proyecto')
        .ilike('codigo_proyecto', `${currentYear}-%`)
        .order('codigo_proyecto', { ascending: false })
        .limit(1)

    if (error) throw error

    let numeroSecuencial = 1

    if (data && data.length > 0) {
        const ultimoCodigo = data[0].codigo_proyecto
        const partes = ultimoCodigo.split('-')
        if (partes.length === 2) {
            const ultimoNumero = parseInt(partes[1])
            if (!isNaN(ultimoNumero)) {
                numeroSecuencial = ultimoNumero + 1
            }
        }
    }

    // Formatear con ceros a la izquierda
    const numeroFormateado = numeroSecuencial.toString().padStart(3, '0')
    return `${currentYear}-${numeroFormateado}`
}