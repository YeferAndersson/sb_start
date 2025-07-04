// src/services/TramiteService.ts
import { supabase, type TblTramite, type TblTramiteInsert, type DicEtapa } from '@/lib/supabase'

export interface TramiteData {
    id: number
    codigo_proyecto: string
    etapa: {
        id: number
        nombre: string
        descripcion: string
    }
    modalidad: {
        id: number
        descripcion: string
    }
    denominacion: {
        id: number
        nombre: string
    }
    tipo_trabajo: {
        id: number
        nombre: string
    }
    fecha_registro: string
    estado_tramite: number
}

export interface CreateProyectoData {
    tesistaId: number
    usuarioId: number
    codigoEstudiante: string
    carreraId: number
    especialidadId: number
}

export interface ProyectoCreatedData {
    tramiteId: number
    codigoProyecto: string
    success: boolean
}

/**
 * Verifica si un tesista ya tiene un trámite ACTIVO
 */
export async function checkTesistaHasTramite(tesistaId: number): Promise<boolean> {
    try {
        // Verificar si tiene trámites ACTIVOS (estado_tramite = 1)
        const { data, error } = await supabase
            .from('tbl_integrantes')
            .select(`
                id,
                tramite:id_tramite(
                    id,
                    estado_tramite
                )
            `)
            .eq('id_tesista', tesistaId)
            .eq('estado_integrante', 1)

        if (error) {
            console.error('Error verificando trámite del tesista:', error)
            throw new Error('Error al verificar el estado del trámite')
        }

        // Filtrar solo trámites ACTIVOS (estado_tramite = 1)
        const tramitesActivos = data?.filter(item => 
            item.tramite && item.tramite.estado_tramite === 1
        ) || []

        const tieneActivo = tramitesActivos.length > 0

        console.log(`📋 Tesista ${tesistaId} - Trámites activos: ${tramitesActivos.length}`)
        
        return tieneActivo
        
    } catch (error) {
        console.error('❌ Error en checkTesistaHasTramite:', error)
        throw error
    }
}

/**
 * Genera un código único de proyecto
 */
export async function generateCodigoProyecto(codigoEstudiante: string): Promise<string> {
    try {
        const currentYear = new Date().getFullYear().toString().slice(-2)
        const baseCode = `P${currentYear}-${codigoEstudiante}`
        
        let letra = 'A'
        let codigoFinal = `${baseCode}${letra}`
        
        // Verificar si el código ya existe
        while (true) {
            const { data, error } = await supabase
                .from('tbl_tramites')
                .select('id')
                .eq('codigo_proyecto', codigoFinal)
                .limit(1)

            if (error) {
                console.error('Error verificando código de proyecto:', error)
                throw new Error('Error al generar código de proyecto')
            }

            // Si no existe, usar este código
            if (!data || data.length === 0) {
                break
            }

            // Si existe, incrementar la letra
            letra = String.fromCharCode(letra.charCodeAt(0) + 1)
            codigoFinal = `${baseCode}${letra}`

            // Evitar loop infinito (después de Z, usar AA, AB, etc.)
            if (letra > 'Z') {
                throw new Error('Se agotaron los códigos disponibles para este estudiante')
            }
        }

        console.log('✅ Código de proyecto generado:', codigoFinal)
        return codigoFinal

    } catch (error) {
        console.error('❌ Error en generateCodigoProyecto:', error)
        throw error
    }
}

/**
 * Busca la denominación correspondiente a una carrera y especialidad
 */
export async function getDenominacionByEstructura(carreraId: number, especialidadId: number): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('dic_denominaciones')
            .select('id')
            .eq('id_carrera', carreraId)
            .eq('id_especialidad', especialidadId)
            .eq('denominacion_actual', 1)
            .single()

        if (error || !data) {
            console.error('Error obteniendo denominación:', error)
            throw new Error('No se encontró denominación para la carrera y especialidad especificada')
        }

        return data.id
    } catch (error) {
        console.error('❌ Error en getDenominacionByEstructura:', error)
        throw error
    }
}

/**
 * Crea un nuevo proyecto de tesis (operación transaccional)
 */
export async function createNuevoProyecto(createData: CreateProyectoData): Promise<ProyectoCreatedData> {
    try {
        console.log('🚀 Iniciando creación de nuevo proyecto:', createData)

        // 1. Generar código único
        const codigoProyecto = await generateCodigoProyecto(createData.codigoEstudiante)

        // 2. Obtener denominación
        const denominacionId = await getDenominacionByEstructura(createData.carreraId, createData.especialidadId)

        // 3. Crear el trámite principal
        const tramiteData: TblTramiteInsert = {
            codigo_proyecto: codigoProyecto,
            id_etapa: 1,
            id_modalidad: 1,
            id_tipo_trabajo: 1,
            id_denominacion: denominacionId,
            id_sublinea_vri: null,
            estado_tramite: 1
        }

        const { data: tramite, error: tramiteError } = await supabase
            .from('tbl_tramites')
            .insert([tramiteData])
            .select()
            .single()

        if (tramiteError || !tramite) {
            console.error('Error creando trámite:', tramiteError)
            throw new Error('Error al crear el trámite principal')
        }

        console.log('✅ Trámite creado con ID:', tramite.id)

        // 4. Crear registro en tbl_integrantes
        const { error: integranteError } = await supabase
            .from('tbl_integrantes')
            .insert([{
                id_tramite: tramite.id,
                id_tesista: createData.tesistaId,
                tipo_integrante: 1,
                estado_integrante: 1
            }])

        if (integranteError) {
            console.error('Error creando integrante:', integranteError)
            // Rollback: eliminar trámite
            await supabase.from('tbl_tramites').delete().eq('id', tramite.id)
            throw new Error('Error al registrar al tesista como integrante')
        }

        // 5. Crear registro en historial
        const { error: historialError } = await supabase
            .from('tbl_tramites_historial')
            .insert([{
                id_tramite: tramite.id,
                id_etapa: 1,
                estado_tramite_historial: 1,
                comentario: 'Proyecto de tesis iniciado'
            }])

        if (historialError) {
            console.error('Error creando historial:', historialError)
            // Nota: No hacemos rollback completo por el historial, es información auxiliar
        }

        // 6. Crear registro en log de acciones
        const { error: logError } = await supabase
            .from('log_acciones')
            .insert([{
                id_tramite: tramite.id,
                id_accion: 1, // "generar codigo proyecto"
                id_etapa: 1,
                id_usuario: createData.usuarioId,
                mensaje: null
            }])

        if (logError) {
            console.error('Error creando log de acción:', logError)
            // Nota: No hacemos rollback por el log, es información de auditoría
        }

        console.log('✅ Proyecto creado exitosamente:', {
            tramiteId: tramite.id,
            codigoProyecto,
            tesistaId: createData.tesistaId
        })

        return {
            tramiteId: tramite.id,
            codigoProyecto,
            success: true
        }

    } catch (error) {
        console.error('❌ Error en createNuevoProyecto:', error)
        throw error
    }
}

/**
 * Obtiene todas las etapas del proceso
 */
export async function getEtapas(): Promise<DicEtapa[]> {
    try {
        const { data, error } = await supabase
            .from('dic_etapas')
            .select('*')
            .order('id')

        if (error) {
            console.error('Error obteniendo etapas:', error)
            throw new Error('Error al obtener las etapas del proceso')
        }

        return data as DicEtapa[]
    } catch (error) {
        console.error('❌ Error en getEtapas:', error)
        throw error
    }
}

/**
 * Obtiene los trámites de un tesista específico
 */
export async function getTramitesByTesista(tesistaId: number): Promise<TramiteData[]> {
    try {
        // Primero obtener los trámites donde el tesista es integrante
        const { data: integrantes, error: integrantesError } = await supabase
            .from('tbl_integrantes')
            .select('id_tramite')
            .eq('id_tesista', tesistaId)
            .eq('estado_integrante', 1)

        if (integrantesError) {
            console.error('Error obteniendo integrantes:', integrantesError)
            throw new Error('Error al obtener los trámites del tesista')
        }

        if (!integrantes || integrantes.length === 0) {
            return []
        }

        const tramiteIds = integrantes.map(i => i.id_tramite)

        // Obtener los trámites con todas sus relaciones
        const { data, error } = await supabase
            .from('tbl_tramites')
            .select(`
                id,
                codigo_proyecto,
                fecha_registro,
                estado_tramite,
                etapa:id_etapa(
                    id,
                    nombre,
                    descripcion
                ),
                modalidad:id_modalidad(
                    id,
                    descripcion
                ),
                denominacion:id_denominacion(
                    id,
                    nombre
                ),
                tipo_trabajo:id_tipo_trabajo(
                    id,
                    nombre
                )
            `)
            .in('id', tramiteIds)
            .eq('estado_tramite', 1)
            .order('fecha_registro', { ascending: false })

        if (error) {
            console.error('Error obteniendo trámites:', error)
            throw new Error('Error al obtener los detalles de los trámites')
        }

        // Transformar la data al formato esperado
        const tramites: TramiteData[] = data
            .filter(item => item.etapa && item.modalidad && item.denominacion && item.tipo_trabajo)
            .map(item => ({
                id: item.id,
                codigo_proyecto: item.codigo_proyecto,
                fecha_registro: item.fecha_registro,
                estado_tramite: item.estado_tramite,
                etapa: {
                    id: item.etapa.id,
                    nombre: item.etapa.nombre,
                    descripcion: item.etapa.descripcion
                },
                modalidad: {
                    id: item.modalidad.id,
                    descripcion: item.modalidad.descripcion
                },
                denominacion: {
                    id: item.denominacion.id,
                    nombre: item.denominacion.nombre
                },
                tipo_trabajo: {
                    id: item.tipo_trabajo.id,
                    nombre: item.tipo_trabajo.nombre
                }
            }))

        console.log('📚 Trámites obtenidos:', tramites.length)
        return tramites

    } catch (error) {
        console.error('❌ Error en getTramitesByTesista:', error)
        throw error
    }
}

/**
 * Obtiene los trámites cancelados/inactivos de un tesista
 */
export async function getTramitesCanceladosByTesista(tesistaId: number): Promise<TramiteData[]> {
    try {
        // Obtener trámites donde el tesista es integrante
        const { data: integrantes, error: integrantesError } = await supabase
            .from('tbl_integrantes')
            .select('id_tramite')
            .eq('id_tesista', tesistaId)
            .eq('estado_integrante', 1)

        if (integrantesError) {
            console.error('Error obteniendo integrantes:', integrantesError)
            throw new Error('Error al obtener los trámites del tesista')
        }

        if (!integrantes || integrantes.length === 0) {
            return []
        }

        const tramiteIds = integrantes.map(i => i.id_tramite)

        // Obtener solo trámites CANCELADOS (estado_tramite = 0)
        const { data, error } = await supabase
            .from('tbl_tramites')
            .select(`
                id,
                codigo_proyecto,
                fecha_registro,
                estado_tramite,
                etapa:id_etapa(
                    id,
                    nombre,
                    descripcion
                ),
                modalidad:id_modalidad(
                    id,
                    descripcion
                ),
                denominacion:id_denominacion(
                    id,
                    nombre
                ),
                tipo_trabajo:id_tipo_trabajo(
                    id,
                    nombre
                )
            `)
            .in('id', tramiteIds)
            .eq('estado_tramite', 0) // Solo cancelados
            .order('fecha_registro', { ascending: false })

        if (error) {
            console.error('Error obteniendo trámites cancelados:', error)
            throw new Error('Error al obtener los trámites cancelados')
        }

        // Transformar la data al formato esperado
        const tramitesCancelados: TramiteData[] = data
            .filter(item => item.etapa && item.modalidad && item.denominacion && item.tipo_trabajo)
            .map(item => ({
                id: item.id,
                codigo_proyecto: item.codigo_proyecto,
                fecha_registro: item.fecha_registro,
                estado_tramite: item.estado_tramite,
                etapa: {
                    id: item.etapa.id,
                    nombre: item.etapa.nombre,
                    descripcion: item.etapa.descripcion
                },
                modalidad: {
                    id: item.modalidad.id,
                    descripcion: item.modalidad.descripcion
                },
                denominacion: {
                    id: item.denominacion.id,
                    nombre: item.denominacion.nombre
                },
                tipo_trabajo: {
                    id: item.tipo_trabajo.id,
                    nombre: item.tipo_trabajo.nombre
                }
            }))

        console.log(`📚 Trámites cancelados obtenidos: ${tramitesCancelados.length}`)
        return tramitesCancelados

    } catch (error) {
        console.error('❌ Error en getTramitesCanceladosByTesista:', error)
        throw error
    }
}