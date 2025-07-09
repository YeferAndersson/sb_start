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

export interface ValidarCompaneroData {
    codigoMatricula: string
    dniCompanero: string
    idEstructuraAcademica: number
}

export interface CompaneroValidado {
    usuarioId: number
    tesistaId: number
    nombres: string
    apellidos: string
    codigoEstudiante: string
    yaEsTesista: boolean
}


//interfaces en el proceso de completar proyecto
export interface SublineaVRI {
    id: number
    nombre: string
    id_area: number
    id_carrera: number
    id_disciplina: number
    id_linea_universidad: number
    id_subarea: number
    estado_sublinea_vri: number
}

export interface DocenteAsesor {
    id: number
    codigo_airhs: string
    usuario: {
        id: number
        nombres: string | null
        apellidos: string | null
        correo: string
    }
    especialidad: {
        id: number
        nombre: string
    }
}

export interface CoasesorData {
    id: number
    investigador: {
        id: number
        usuario: {
            id: number
            nombres: string | null
            apellidos: string | null
            correo: string
        }
        orcid?: string | null
        codigo_renacyt?: string | null
        nivel_renacyt?: string | null
    }
}

export interface TipoArchivoEtapa1 {
    id: number
    nombre: string
    descripcion: string | null
    obligatorio: boolean
    max_size: number
}

export interface MetadatosFormData {
    titulo: string
    abstract: string
    keywords: string
    presupuesto: number
}

export interface CompletarEtapa1Data {
    metadatos: MetadatosFormData
    sublineaId: number
    asesorId: number
    coasesorId?: number
    archivos: { file: File; tipoId: number }[]
}

export interface TramiteCompleteInfo {
    id: number
    codigo_proyecto: string
    fecha_registro: string
    estado_tramite: number
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
    sublinea_vri?: {
        id: number
        nombre: string
        linea_universidad: {
            id: number
            nombre: string
        }
        area_ocde: {
            id: number
            nombre: string
        }
    }
}

export interface TramiteMetadatosInfo {
    id: number
    titulo: string
    abstract: string
    keywords: string
    presupuesto: number
    conclusiones?: string | null
    fecha: string
    estado_tm: number
    etapa: {
        id: number
        nombre: string
    }
}

export interface IntegranteInfo {
    id: number
    tipo_integrante: number
    fecha_registro: string
    tesista: {
        id: number
        codigo_estudiante: string
        usuario: {
            id: number
            nombres: string | null
            apellidos: string | null
            correo: string
        }
    }
}

export interface AsesorInfo {
    id: number
    orden: number
    fecha_asignacion: string
    docente: {
        id: number
        codigo_airhs: string
        usuario: {
            id: number
            nombres: string | null
            apellidos: string | null
            correo: string
        }
        especialidad: {
            id: number
            nombre: string
        }
    }
    coasesor?: {
        id: number
        investigador: {
            id: number
            usuario: {
                id: number
                nombres: string | null
                apellidos: string | null
                correo: string
            }
            orcid?: string | null
            codigo_renacyt?: string | null
            nivel_renacyt?: string | null
        }
    }
}

export interface ArchivoInfo {
    id: number
    nombre_archivo: string
    fecha: string
    estado_archivo: number
    max_size: number | null // Corregido para aceptar null
    tipo_archivo: {
        id: number
        nombre: string
        descripcion: string | null // También corregido para aceptar null
    }
}

export interface LogAccionInfo {
    id: number
    fecha: string
    mensaje?: string | null
    accion: {
        id: number
        nombre: string
        descripcion: string
    }
    etapa: {
        id: number
        nombre: string
    }
    usuario: {
        id: number
        nombres: string | null
        apellidos: string | null
    }
}

export interface TramiteResumenData {
    tramite: TramiteCompleteInfo
    metadatos?: TramiteMetadatosInfo
    integrantes: IntegranteInfo[]
    asesor?: AsesorInfo
    archivos: ArchivoInfo[]
    historialAcciones: LogAccionInfo[]
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

/**
 * Verifica si un usuario existe en el sistema por DNI
 */
export async function verificarUsuarioExiste(dni: string): Promise<{ existe: boolean; usuarioId?: number; usuario?: any }> {
    try {
        const { data, error } = await supabase
            .from('tbl_usuarios')
            .select('id, nombres, apellidos, num_doc_identidad')
            .eq('num_doc_identidad', dni)
            .eq('estado', 1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error verificando usuario:', error)
            throw new Error('Error al verificar usuario en el sistema')
        }

        return {
            existe: !!data,
            usuarioId: data?.id,
            usuario: data
        }
    } catch (error) {
        console.error('❌ Error en verificarUsuarioExiste:', error)
        throw error
    }
}

/**
 * Verifica si un usuario ya es tesista en la estructura académica
 */
export async function verificarTesistaExiste(usuarioId: number, idEstructuraAcademica: number): Promise<{ existe: boolean; tesistaId?: number }> {
    try {
        const { data, error } = await supabase
            .from('tbl_tesistas')
            .select('id')
            .eq('id_usuario', usuarioId)
            .eq('id_estructura_academica', idEstructuraAcademica)
            .eq('estado', 1)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error verificando tesista:', error)
            throw new Error('Error al verificar tesista')
        }

        return {
            existe: !!data,
            tesistaId: data?.id
        }
    } catch (error) {
        console.error('❌ Error en verificarTesistaExiste:', error)
        throw error
    }
}

/**
 * Crea un nuevo tesista para el compañero
 */
export async function crearTesistaCompanero(usuarioId: number, codigoEstudiante: string, idEstructuraAcademica: number): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('tbl_tesistas')
            .insert([{
                id_usuario: usuarioId,
                codigo_estudiante: codigoEstudiante,
                id_estructura_academica: idEstructuraAcademica,
                estado: 1
            }])
            .select('id')
            .single()

        if (error) {
            console.error('Error creando tesista compañero:', error)
            throw new Error('Error al crear registro de tesista para el compañero')
        }

        console.log('✅ Tesista compañero creado con ID:', data.id)
        return data.id
    } catch (error) {
        console.error('❌ Error en crearTesistaCompanero:', error)
        throw error
    }
}

/**
 * Verifica si un usuario (no tesista) tiene trámite activo
 */
export async function checkUsuarioHasTramite(usuarioId: number): Promise<boolean> {
    try {
        // Obtener todos los tesistas del usuario
        const { data: tesistas, error: tesistasError } = await supabase
            .from('tbl_tesistas')
            .select('id')
            .eq('id_usuario', usuarioId)
            .eq('estado', 1)

        if (tesistasError) {
            console.error('Error obteniendo tesistas:', tesistasError)
            throw new Error('Error al verificar tesistas del usuario')
        }

        if (!tesistas || tesistas.length === 0) {
            return false
        }

        // Verificar si alguno de sus tesistas tiene trámite activo
        for (const tesista of tesistas) {
            const tieneActivo = await checkTesistaHasTramite(tesista.id)
            if (tieneActivo) {
                return true
            }
        }

        return false
    } catch (error) {
        console.error('❌ Error en checkUsuarioHasTramite:', error)
        throw error
    }
}

/**
 * Validación completa del compañero
 */
export async function validarCompanero(validarData: ValidarCompaneroData): Promise<CompaneroValidado> {
    try {
        console.log('🔍 Iniciando validación de compañero:', validarData)

        // 1. Verificar que el usuario existe en el sistema
        const { existe, usuarioId, usuario } = await verificarUsuarioExiste(validarData.dniCompanero)
        
        if (!existe || !usuarioId) {
            throw new Error('El compañero no está registrado en el sistema. Debe crear su cuenta primero.')
        }

        // 2. Validar código con Edge Function
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('student-info', {
            body: { studentCode: validarData.codigoMatricula }
        })

        if (edgeError || !edgeData.success) {
            throw new Error(edgeData?.error || 'Error al verificar código de matrícula del compañero')
        }

        const studentInfo = edgeData.data

        // 3. Validar que el DNI del código coincida con el DNI ingresado
        if (studentInfo.numDocIdentidad !== validarData.dniCompanero) {
            throw new Error(`El DNI del código de matrícula (${studentInfo.numDocIdentidad}) no coincide con el DNI ingresado (${validarData.dniCompanero})`)
        }

        // 4. Validar semestre mínimo
        const minSemestre = studentInfo.totalSemestre - 3
        if (studentInfo.semestreActual < minSemestre) {
            throw new Error(`El compañero debe estar en el semestre ${minSemestre} o superior. Actualmente está en el semestre ${studentInfo.semestreActual} de ${studentInfo.totalSemestre}.`)
        }

        // ✅ AGREGAR: 4.5. Validar que el código corresponda a la misma estructura académica
        if (studentInfo.idEstructuraAcademica !== validarData.idEstructuraAcademica) {
            throw new Error(`El código de matrícula del compañero corresponde a una carrera diferente. Debe ingresar el código de la misma carrera que tienes registrada.`)
        }

        // 5. Verificar/crear tesista PRIMERO
        let tesistaId: number
        const { existe: yaEsTesista, tesistaId: existingTesistaId } = await verificarTesistaExiste(usuarioId, validarData.idEstructuraAcademica)
        
        if (yaEsTesista && existingTesistaId) {
            tesistaId = existingTesistaId
        } else {
            // Crear nuevo tesista con la misma estructura académica
            tesistaId = await crearTesistaCompanero(usuarioId, validarData.codigoMatricula, validarData.idEstructuraAcademica)
        }

        // 6. Verificar y agregar servicio tesista si no lo tiene
        await verificarYAgregarServicioTesista(usuarioId)

        // 7. Validar que no tenga proyecto activo EN ESTA CARRERA específica
        const tieneProyecto = await checkTesistaHasTramite(tesistaId)
        if (tieneProyecto) {
            throw new Error('El compañero ya tiene un proyecto de tesis activo en esta carrera')
        }

        console.log('✅ Compañero validado exitosamente')

        return {
            usuarioId,
            tesistaId,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            codigoEstudiante: validarData.codigoMatricula,
            yaEsTesista
        }

    } catch (error) {
        console.error('❌ Error en validarCompanero:', error)
        throw error
    }
}

/**
 * Agrega un compañero como integrante del proyecto
 */
export async function agregarCompaneroProyecto(tramiteId: number, tesistaId: number, usuarioLogueadoId: number): Promise<void> {
    try {
        console.log('🔗 Agregando compañero al proyecto:', { tramiteId, tesistaId })

        // 1. Agregar en tbl_integrantes
        const { error: integranteError } = await supabase
            .from('tbl_integrantes')
            .insert([{
                id_tramite: tramiteId,
                id_tesista: tesistaId,
                tipo_integrante: 2, // Compañero
                estado_integrante: 1
            }])

        if (integranteError) {
            console.error('Error agregando integrante:', integranteError)
            throw new Error('Error al agregar el compañero al proyecto')
        }

        // 2. Registrar en log de acciones
        const { error: logError } = await supabase
            .from('log_acciones')
            .insert([{
                id_tramite: tramiteId,
                id_accion: 2, // "integrantes del proyecto"
                id_etapa: 1,
                id_usuario: usuarioLogueadoId,
                mensaje: null
            }])

        if (logError) {
            console.error('Error creando log de acción:', logError)
            // No lanzar error por el log, es información de auditoría
        }

        console.log('✅ Compañero agregado al proyecto exitosamente')

    } catch (error) {
        console.error('❌ Error en agregarCompaneroProyecto:', error)
        throw error
    }
}

/**
 * Registra que el proyecto será individual (solo un integrante)
 */
export async function registrarProyectoIndividual(tramiteId: number, usuarioLogueadoId: number): Promise<void> {
    try {
        console.log('📝 Registrando proyecto como individual:', { tramiteId })

        // Registrar en log de acciones
        const { error: logError } = await supabase
            .from('log_acciones')
            .insert([{
                id_tramite: tramiteId,
                id_accion: 2, // "integrantes del proyecto"
                id_etapa: 1,
                id_usuario: usuarioLogueadoId,
                mensaje: 'Proyecto definido como individual'
            }])

        if (logError) {
            console.error('Error creando log de acción individual:', logError)
            throw new Error('Error al registrar proyecto individual')
        }

        console.log('✅ Proyecto individual registrado exitosamente')

    } catch (error) {
        console.error('❌ Error en registrarProyectoIndividual:', error)
        throw error
    }
}

/**
 * Verifica si ya se eligió el tipo de proyecto (individual o grupal)
 */
export async function checkTipoProyectoElegido(tramiteId: number): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('log_acciones')
            .select('id')
            .eq('id_tramite', tramiteId)
            .eq('id_accion', 2) // "integrantes del proyecto"
            .eq('id_etapa', 1)
            .limit(1)

        if (error) {
            console.error('Error verificando tipo proyecto:', error)
            return false
        }

        return data && data.length > 0
    } catch (error) {
        console.error('❌ Error en checkTipoProyectoElegido:', error)
        return false
    }
}

/**
 * Verifica y agrega servicio tesista al compañero si no lo tiene
 */
export async function verificarYAgregarServicioTesista(usuarioId: number): Promise<boolean> {
    try {
        // Verificar si ya tiene el servicio tesista
        const { data: servicioExistente, error: servicioError } = await supabase
            .from('tbl_usuarios_servicios')
            .select('id')
            .eq('id_usuario', usuarioId)
            .eq('id_servicio', 1) // Servicio tesista
            .eq('estado', 1)
            .limit(1)

        if (servicioError) {
            console.error('Error verificando servicio tesista:', servicioError)
            throw new Error('Error al verificar servicio tesista')
        }

        // Si ya tiene el servicio, no hacer nada
        if (servicioExistente && servicioExistente.length > 0) {
            console.log('✅ Usuario ya tiene servicio tesista')
            return false // No se agregó porque ya lo tenía
        }

        // Agregar el servicio tesista
        const { error: insertError } = await supabase
            .from('tbl_usuarios_servicios')
            .insert([{
                id_usuario: usuarioId,
                id_servicio: 1, // ID del servicio tesista
                fecha_asignacion: new Date().toISOString(),
                estado: 1
            }])

        if (insertError) {
            console.error('Error agregando servicio tesista:', insertError)
            throw new Error('Error al agregar el servicio de tesista')
        }

        console.log('✅ Servicio tesista agregado al compañero')
        return true // Se agregó el servicio

    } catch (error) {
        console.error('❌ Error en verificarYAgregarServicioTesista:', error)
        throw error
    }
}


// completar informacion proyecto


/**
 * Obtiene las sublíneas de investigación por carrera
 */
export async function getSublineasByCarrera(carreraId: number): Promise<SublineaVRI[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_sublineas_vri')
            .select('*')
            .eq('id_carrera', carreraId)
            .eq('estado_sublinea_vri', 1)
            .order('nombre')

        if (error) {
            console.error('Error obteniendo sublíneas:', error)
            throw new Error('Error al obtener las líneas de investigación')
        }

        console.log(`📚 Sublíneas obtenidas para carrera ${carreraId}:`, data.length)
        return data as SublineaVRI[]

    } catch (error) {
        console.error('❌ Error en getSublineasByCarrera:', error)
        throw error
    }
}

/**
 * Actualiza la sublínea de investigación del trámite
 */
export async function updateTramiteSublinea(tramiteId: number, sublineaId: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('tbl_tramites')
            .update({ id_sublinea_vri: sublineaId })
            .eq('id', tramiteId)

        if (error) {
            console.error('Error actualizando sublínea:', error)
            throw new Error('Error al asignar la línea de investigación')
        }

        console.log(`✅ Sublínea ${sublineaId} asignada al trámite ${tramiteId}`)

    } catch (error) {
        console.error('❌ Error en updateTramiteSublinea:', error)
        throw error
    }
}

/**
 * Obtiene docentes disponibles por sublínea de investigación
 */
export async function getDocentesBySublinea(sublineaId: number): Promise<DocenteAsesor[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_docentes_lineas')
            .select(`
                docente:id_docente(
                    id,
                    codigo_airhs,
                    estado_docente,
                    usuario:id_usuario(
                        id,
                        nombres,
                        apellidos,
                        correo
                    ),
                    especialidad:id_especialidad(
                        id,
                        nombre
                    )
                )
            `)
            .eq('id_sublinea_vri', sublineaId)
            .eq('id_estado_linea', 1)

        if (error) {
            console.error('Error obteniendo docentes:', error)
            throw new Error('Error al obtener los docentes de la línea de investigación')
        }

        // Transformar y filtrar datos con validaciones de null
        const docentes: DocenteAsesor[] = data
            .filter(item => item.docente && item.docente.estado_docente === 1)
            .map(item => ({
                id: item.docente.id,
                codigo_airhs: item.docente.codigo_airhs,
                usuario: {
                    id: item.docente.usuario.id,
                    nombres: item.docente.usuario.nombres,
                    apellidos: item.docente.usuario.apellidos,
                    correo: item.docente.usuario.correo
                },
                especialidad: {
                    id: item.docente.especialidad.id,
                    nombre: item.docente.especialidad.nombre
                }
            }))

        console.log(`👨‍🏫 Docentes obtenidos para sublínea ${sublineaId}:`, docentes.length)
        return docentes

    } catch (error) {
        console.error('❌ Error en getDocentesBySublinea:', error)
        throw error
    }
}

/**
 * Obtiene todos los coasesores activos disponibles
 */
export async function getCoasesoresActivos(): Promise<CoasesorData[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_coasesores')
            .select(`
                id,
                estado_coasesor,
                investigador:id_investigador(
                    id,
                    estado_investigador,
                    orcid,
                    codigo_renacyt,
                    nivel_renacyt,
                    usuario:id_usuario(
                        id,
                        nombres,
                        apellidos,
                        correo
                    )
                )
            `)
            .eq('estado_coasesor', 1)
            .order('id')

        if (error) {
            console.error('Error obteniendo coasesores:', error)
            throw new Error('Error al obtener los coasesores disponibles')
        }

        // Transformar y filtrar datos
        const coasesores: CoasesorData[] = data
            .filter(item => item.investigador && item.investigador.estado_investigador === 1)
            .map(item => ({
                id: item.id,
                investigador: {
                    id: item.investigador.id,
                    usuario: {
                        id: item.investigador.usuario.id,
                        nombres: item.investigador.usuario.nombres,
                        apellidos: item.investigador.usuario.apellidos,
                        correo: item.investigador.usuario.correo
                    },
                    orcid: item.investigador.orcid,
                    codigo_renacyt: item.investigador.codigo_renacyt,
                    nivel_renacyt: item.investigador.nivel_renacyt
                }
            }))

        console.log(`👨‍💼 Coasesores activos obtenidos:`, coasesores.length)
        return coasesores

    } catch (error) {
        console.error('❌ Error en getCoasesoresActivos:', error)
        throw error
    }
}

/**
 * Obtiene los tipos de archivos requeridos para Etapa 1
 */
export async function getTiposArchivosEtapa1(): Promise<TipoArchivoEtapa1[]> {
    try {
        const { data, error } = await supabase
            .from('dic_tipo_archivo')
            .select('*')
            .in('id', [1, 2, 3, 4, 5]) // IDs específicos para Etapa 1
            .order('id')

        if (error) {
            console.error('Error obteniendo tipos de archivo:', error)
            throw new Error('Error al obtener los tipos de archivo')
        }

        // Agregar campo obligatorio basado en el ID
        const tiposArchivo: TipoArchivoEtapa1[] = data.map(tipo => ({
            id: tipo.id,
            nombre: tipo.nombre,
            descripcion: tipo.descripcion, // Mantener null si es null
            obligatorio: [1, 2, 3].includes(tipo.id), // Proyecto, Turnitin, IA son obligatorios
            max_size: 4 // Default 4MB
        }))

        console.log(`📁 Tipos de archivo para Etapa 1:`, tiposArchivo.length)
        return tiposArchivo

    } catch (error) {
        console.error('❌ Error en getTiposArchivosEtapa1:', error)
        throw error
    }
}

/**
 * Asigna asesor y coasesor al proyecto
 */
export async function assignAsesorYCoasesor(
    tramiteId: number, 
    asesorId: number, 
    usuarioAsignadorId: number,
    coasesorId?: number
): Promise<void> {
    try {
        console.log(`🎯 Asignando asesor ${asesorId} al trámite ${tramiteId}`)

        // Primero eliminar cualquier conformación previa para este trámite en etapa 1
        await supabase
            .from('tbl_conformacion_jurados')
            .delete()
            .eq('id_tramite', tramiteId)
            .eq('id_etapa', 1)

        // Insertar nuevo asesor
        const { error: asesorError } = await supabase
            .from('tbl_conformacion_jurados')
            .insert([{
                id_tramite: tramiteId,
                id_docente: asesorId,
                orden: 4, // Asesor principal
                id_etapa: 1,
                id_usuario_asignador: usuarioAsignadorId,
                id_coasesor: coasesorId || null,
                fecha_asignacion: new Date().toISOString(),
                estado_cj: 1
            }])

        if (asesorError) {
            console.error('Error asignando asesor:', asesorError)
            throw new Error('Error al asignar el asesor principal')
        }

        console.log(`✅ Asesor y ${coasesorId ? 'coasesor' : 'sin coasesor'} asignados exitosamente`)

    } catch (error) {
        console.error('❌ Error en assignAsesorYCoasesor:', error)
        throw error
    }
}

/**
 * Guarda los metadatos del proyecto
 */
export async function saveTramiteMetadatos(
    tramiteId: number, 
    metadatos: MetadatosFormData
): Promise<number> {
    try {
        console.log(`💾 Guardando metadatos para trámite ${tramiteId}`)

        // Primero eliminar metadatos previos de etapa 1 si existen
        await supabase
            .from('tbl_tramites_metadatos')
            .delete()
            .eq('id_tramite', tramiteId)
            .eq('id_etapa', 1)

        // Insertar nuevos metadatos
        const { data, error } = await supabase
            .from('tbl_tramites_metadatos')
            .insert([{
                id_tramite: tramiteId,
                id_etapa: 1,
                titulo: metadatos.titulo,
                abstract: metadatos.abstract,
                keywords: metadatos.keywords,
                presupuesto: metadatos.presupuesto,
                conclusiones: null, // Explícitamente null para etapa 1
                fecha: new Date().toISOString(),
                estado_tm: 1
            }])
            .select('id')
            .single()

        if (error || !data) {
            console.error('Error guardando metadatos:', error)
            throw new Error('Error al guardar la información del proyecto')
        }

        console.log(`✅ Metadatos guardados con ID: ${data.id}`)
        return data.id

    } catch (error) {
        console.error('❌ Error en saveTramiteMetadatos:', error)
        throw error
    }
}

/**
 * Sube archivo con renombrado automático
 */
export async function uploadArchivoWithRename(
    file: File,
    tramiteId: number,
    tipoArchivoId: number,
    metadatosId: number,
    codigoProyecto: string,
    userUuid: string  // ← CAMBIO: Ahora recibe UUID directamente
): Promise<void> {
    try {
        console.log(`📤 Subiendo archivo tipo ${tipoArchivoId} para trámite ${tramiteId}`)
        console.log(`🔑 Usando UUID para storage path: ${userUuid}`)

        // Determinar extensión del archivo
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (!extension) {
            throw new Error('No se pudo determinar la extensión del archivo')
        }

        // Verificar si ya existe archivo del mismo tipo
        const { data: existingFiles } = await supabase
            .from('tbl_archivos_tramites')
            .select('nombre_archivo')
            .eq('id_tramite', tramiteId)
            .eq('id_tipo_archivo', tipoArchivoId)
            .eq('estado_archivo', 1)

        // Determinar letra para el archivo (A, B, C...)
        let letra = 'A'
        if (existingFiles && existingFiles.length > 0) {
            // Desactivar archivos anteriores
            await supabase
                .from('tbl_archivos_tramites')
                .update({ estado_archivo: 0 })
                .eq('id_tramite', tramiteId)
                .eq('id_tipo_archivo', tipoArchivoId)

            // Calcular siguiente letra
            letra = String.fromCharCode(65 + existingFiles.length) // A=65, B=66, etc.
        }

        // Generar nombre del archivo: "A1-P25-191942A.pdf"
        const nombreArchivo = `${letra}${tipoArchivoId}-${codigoProyecto}.${extension}`
        
        // Ruta en storage: userUuid/nombreArchivo
        const storagePath = `${userUuid}/${nombreArchivo}`

        console.log(`📁 Storage path: ${storagePath}`)

        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('tramites-documentos')
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) {
            console.error('Error subiendo archivo:', uploadError)
            throw new Error(`Error al subir el archivo: ${uploadError.message}`)
        }

        console.log(`✅ Archivo subido a storage: ${storagePath}`)

        // Registrar en base de datos
        const { error: dbError } = await supabase
            .from('tbl_archivos_tramites')
            .insert([{
                id_tramite: tramiteId,
                id_tipo_archivo: tipoArchivoId,
                nombre_archivo: nombreArchivo,
                storage: 'supabase',
                bucket: 'tramites-documentos',
                id_etapa: 1,
                id_tramites_metadatos: metadatosId,
                fecha: new Date().toISOString(),
                estado_archivo: 1,
                max_size: 4 // Default 4MB
            }])

        if (dbError) {
            console.error('Error registrando archivo en BD:', dbError)
            // Intentar limpiar archivo subido
            await supabase.storage
                .from('tramites-documentos')
                .remove([storagePath])
            throw new Error('Error al registrar el archivo en la base de datos')
        }

        console.log(`✅ Archivo registrado en BD: ${nombreArchivo}`)

    } catch (error) {
        console.error('❌ Error en uploadArchivoWithRename:', error)
        throw error
    }
}

/**
 * Finaliza Etapa 1 y cambia a Etapa 2
 */
export async function finalizarEtapa1ToEtapa2(tramiteId: number, usuarioId: number): Promise<void> {
    try {
        console.log(`🏁 Finalizando Etapa 1 para trámite ${tramiteId}`)

        // 1. Actualizar trámite a etapa 2
        const { error: tramiteError } = await supabase
            .from('tbl_tramites')
            .update({ id_etapa: 2 })
            .eq('id', tramiteId)

        if (tramiteError) {
            console.error('Error actualizando etapa del trámite:', tramiteError)
            throw new Error('Error al actualizar la etapa del trámite')
        }

        // 2. Registrar en historial
        const { error: historialError } = await supabase
            .from('tbl_tramites_historial')
            .insert([{
                id_tramite: tramiteId,
                id_etapa: 2,
                estado_tramite_historial: 1,
                comentario: 'Etapa 1 completada - Proyecto listo para revisión de formato',
                fecha_cambio: new Date().toISOString()
            }])

        if (historialError) {
            console.error('Error registrando historial:', historialError)
            // No lanzar error, es información auxiliar
        }

        // 3. Registrar en log de acciones
        const { error: logError } = await supabase
            .from('log_acciones')
            .insert([{
                id_tramite: tramiteId,
                id_accion: 3, // "completar información del proyecto"
                id_etapa: 1,
                id_usuario: usuarioId,
                mensaje: 'Etapa 1 completada - listo para revisión',
                fecha: new Date().toISOString()
            }])

        if (logError) {
            console.error('Error registrando log de acción:', logError)
            // No lanzar error, es información de auditoría
        }

        console.log(`✅ Etapa 1 finalizada exitosamente, trámite movido a Etapa 2`)

    } catch (error) {
        console.error('❌ Error en finalizarEtapa1ToEtapa2:', error)
        throw error
    }
}

/**
 * Función principal para completar toda la Etapa 1
 */
export async function completarEtapa1(
    tramiteId: number,
    codigoProyecto: string,
    userUuid: string,  // ← CAMBIO: Ahora recibe UUID directamente
    completarData: CompletarEtapa1Data
): Promise<void> {
    try {
        console.log(`🚀 Iniciando completado de Etapa 1 para trámite ${tramiteId}`)
        console.log(`🔑 Usando UUID para storage: ${userUuid}`)

        // 1. Guardar metadatos
        const metadatosId = await saveTramiteMetadatos(tramiteId, completarData.metadatos)

        // 2. Actualizar sublínea en trámite
        await updateTramiteSublinea(tramiteId, completarData.sublineaId)

        // 3. Obtener el ID numérico del usuario para las relaciones en BD
        const { data: userData, error: userError } = await supabase
            .from('tbl_usuarios')
            .select('id')
            .eq('uuid', userUuid)
            .single()

        if (userError || !userData) {
            throw new Error('No se pudo obtener la información del usuario')
        }

        const numericUserId = userData.id

        // 4. Asignar asesor y coasesor
        await assignAsesorYCoasesor(
            tramiteId, 
            completarData.asesorId, 
            numericUserId,  // ← Usar ID numérico para relaciones BD
            completarData.coasesorId
        )

        // 5. Subir archivos
        for (const archivo of completarData.archivos) {
            await uploadArchivoWithRename(
                archivo.file,
                tramiteId,
                archivo.tipoId,
                metadatosId,
                codigoProyecto,
                userUuid  // ← Usar UUID para storage
            )
        }

        // 6. Finalizar etapa
        await finalizarEtapa1ToEtapa2(tramiteId, numericUserId)  // ← Usar ID numérico para logs

        console.log(`🎉 Etapa 1 completada exitosamente para trámite ${tramiteId}`)

    } catch (error) {
        console.error('❌ Error en completarEtapa1:', error)
        throw error
    }
}

/**
 * Obtiene información completa del trámite para el resumen
 */
export async function getTramiteCompleteInfo(tramiteId: number): Promise<TramiteCompleteInfo> {
    try {
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
                ),
                sublinea_vri:id_sublinea_vri(
                    id,
                    nombre,
                    linea_universidad:id_linea_universidad(
                        id,
                        nombre
                    ),
                    area_ocde:id_area(
                        id,
                        nombre
                    )
                )
            `)
            .eq('id', tramiteId)
            .single()

        if (error || !data) {
            console.error('Error obteniendo trámite completo:', error)
            throw new Error('No se encontró el trámite especificado')
        }

        return {
            id: data.id,
            codigo_proyecto: data.codigo_proyecto,
            fecha_registro: data.fecha_registro,
            estado_tramite: data.estado_tramite,
            etapa: {
                id: data.etapa.id,
                nombre: data.etapa.nombre,
                descripcion: data.etapa.descripcion
            },
            modalidad: {
                id: data.modalidad.id,
                descripcion: data.modalidad.descripcion
            },
            denominacion: {
                id: data.denominacion.id,
                nombre: data.denominacion.nombre
            },
            tipo_trabajo: {
                id: data.tipo_trabajo.id,
                nombre: data.tipo_trabajo.nombre
            },
            sublinea_vri: data.sublinea_vri ? {
                id: data.sublinea_vri.id,
                nombre: data.sublinea_vri.nombre,
                linea_universidad: {
                    id: data.sublinea_vri.linea_universidad.id,
                    nombre: data.sublinea_vri.linea_universidad.nombre
                },
                area_ocde: {
                    id: data.sublinea_vri.area_ocde.id,
                    nombre: data.sublinea_vri.area_ocde.nombre
                }
            } : undefined
        }

    } catch (error) {
        console.error('❌ Error en getTramiteCompleteInfo:', error)
        throw error
    }
}

/**
 * Obtiene los metadatos del trámite
 */
export async function getTramiteMetadatos(tramiteId: number): Promise<TramiteMetadatosInfo | null> {
    try {
        const { data, error } = await supabase
            .from('tbl_tramites_metadatos')
            .select(`
                id,
                titulo,
                abstract,
                keywords,
                presupuesto,
                conclusiones,
                fecha,
                estado_tm,
                etapa:id_etapa(
                    id,
                    nombre
                )
            `)
            .eq('id_tramite', tramiteId)
            .eq('estado_tm', 1)
            .order('fecha', { ascending: false })
            .limit(1)

        if (error) {
            console.error('Error obteniendo metadatos:', error)
            return null
        }

        if (!data || data.length === 0) {
            return null
        }

        const metadato = data[0]
        return {
            id: metadato.id,
            titulo: metadato.titulo,
            abstract: metadato.abstract,
            keywords: metadato.keywords,
            presupuesto: metadato.presupuesto,
            conclusiones: metadato.conclusiones, // Mantener null si es null
            fecha: metadato.fecha,
            estado_tm: metadato.estado_tm,
            etapa: {
                id: metadato.etapa.id,
                nombre: metadato.etapa.nombre
            }
        }

    } catch (error) {
        console.error('❌ Error en getTramiteMetadatos:', error)
        return null
    }
}

/**
 * Obtiene los integrantes del trámite
 */
export async function getTramiteIntegrantes(tramiteId: number): Promise<IntegranteInfo[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_integrantes')
            .select(`
                id,
                tipo_integrante,
                fecha_registro,
                tesista:id_tesista(
                    id,
                    codigo_estudiante,
                    usuario:id_usuario(
                        id,
                        nombres,
                        apellidos,
                        correo
                    )
                )
            `)
            .eq('id_tramite', tramiteId)
            .eq('estado_integrante', 1)
            .order('tipo_integrante')

        if (error) {
            console.error('Error obteniendo integrantes:', error)
            throw new Error('Error al obtener los integrantes del proyecto')
        }

        return data.map(item => ({
            id: item.id,
            tipo_integrante: item.tipo_integrante,
            fecha_registro: item.fecha_registro,
            tesista: {
                id: item.tesista.id,
                codigo_estudiante: item.tesista.codigo_estudiante,
                usuario: {
                    id: item.tesista.usuario.id,
                    nombres: item.tesista.usuario.nombres,
                    apellidos: item.tesista.usuario.apellidos,
                    correo: item.tesista.usuario.correo
                }
            }
        }))

    } catch (error) {
        console.error('❌ Error en getTramiteIntegrantes:', error)
        throw error
    }
}

/**
 * Obtiene el asesor y coasesor del trámite
 */
export async function getTramiteAsesor(tramiteId: number): Promise<AsesorInfo | null> {
    try {
        const { data, error } = await supabase
            .from('tbl_conformacion_jurados')
            .select(`
                id,
                orden,
                fecha_asignacion,
                docente:id_docente(
                    id,
                    codigo_airhs,
                    usuario:id_usuario(
                        id,
                        nombres,
                        apellidos,
                        correo
                    ),
                    especialidad:id_especialidad(
                        id,
                        nombre
                    )
                ),
                coasesor:id_coasesor(
                    id,
                    investigador:id_investigador(
                        id,
                        orcid,
                        codigo_renacyt,
                        nivel_renacyt,
                        usuario:id_usuario(
                            id,
                            nombres,
                            apellidos,
                            correo
                        )
                    )
                )
            `)
            .eq('id_tramite', tramiteId)
            .eq('orden', 4) // Asesor principal
            .eq('estado_cj', 1)
            .single()

        if (error || !data) {
            console.log('No se encontró asesor para el trámite')
            return null
        }

        return {
            id: data.id,
            orden: data.orden,
            fecha_asignacion: data.fecha_asignacion,
            docente: {
                id: data.docente.id,
                codigo_airhs: data.docente.codigo_airhs,
                usuario: {
                    id: data.docente.usuario.id,
                    nombres: data.docente.usuario.nombres,
                    apellidos: data.docente.usuario.apellidos,
                    correo: data.docente.usuario.correo
                },
                especialidad: {
                    id: data.docente.especialidad.id,
                    nombre: data.docente.especialidad.nombre
                }
            },
            coasesor: data.coasesor ? {
                id: data.coasesor.id,
                investigador: {
                    id: data.coasesor.investigador.id,
                    usuario: {
                        id: data.coasesor.investigador.usuario.id,
                        nombres: data.coasesor.investigador.usuario.nombres,
                        apellidos: data.coasesor.investigador.usuario.apellidos,
                        correo: data.coasesor.investigador.usuario.correo
                    },
                    orcid: data.coasesor.investigador.orcid,
                    codigo_renacyt: data.coasesor.investigador.codigo_renacyt,
                    nivel_renacyt: data.coasesor.investigador.nivel_renacyt
                }
            } : undefined
        }

    } catch (error) {
        console.error('❌ Error en getTramiteAsesor:', error)
        return null
    }
}
/**
 * Obtiene los archivos del trámite
 */
export async function getTramiteArchivos(tramiteId: number): Promise<ArchivoInfo[]> {
    try {
        const { data, error } = await supabase
            .from('tbl_archivos_tramites')
            .select(`
                id,
                nombre_archivo,
                fecha,
                estado_archivo,
                max_size,
                tipo_archivo:id_tipo_archivo(
                    id,
                    nombre,
                    descripcion
                )
            `)
            .eq('id_tramite', tramiteId)
            .eq('estado_archivo', 1)
            .order('id_tipo_archivo')

        if (error) {
            console.error('Error obteniendo archivos:', error)
            throw new Error('Error al obtener los archivos del proyecto')
        }

        return data.map(item => ({
            id: item.id,
            nombre_archivo: item.nombre_archivo,
            fecha: item.fecha,
            estado_archivo: item.estado_archivo,
            max_size: item.max_size,
            tipo_archivo: {
                id: item.tipo_archivo.id,
                nombre: item.tipo_archivo.nombre,
                descripcion: item.tipo_archivo.descripcion
            }
        }))

    } catch (error) {
        console.error('❌ Error en getTramiteArchivos:', error)
        throw error
    }
}

/**
 * Obtiene el historial de acciones del trámite
 */
export async function getTramiteHistorialAcciones(tramiteId: number): Promise<LogAccionInfo[]> {
    try {
        const { data, error } = await supabase
            .from('log_acciones')
            .select(`
                id,
                fecha,
                mensaje,
                accion:id_accion(
                    id,
                    nombre,
                    descripcion
                ),
                etapa:id_etapa(
                    id,
                    nombre
                ),
                usuario:id_usuario(
                    id,
                    nombres,
                    apellidos
                )
            `)
            .eq('id_tramite', tramiteId)
            .order('fecha', { ascending: false })

        if (error) {
            console.error('Error obteniendo historial:', error)
            throw new Error('Error al obtener el historial de acciones')
        }

        return data.map(item => ({
            id: item.id,
            fecha: item.fecha,
            mensaje: item.mensaje, // Mantener null si es null
            accion: {
                id: item.accion.id,
                nombre: item.accion.nombre,
                descripcion: item.accion.descripcion
            },
            etapa: {
                id: item.etapa.id,
                nombre: item.etapa.nombre
            },
            usuario: {
                id: item.usuario.id,
                nombres: item.usuario.nombres,
                apellidos: item.usuario.apellidos
            }
        }))

    } catch (error) {
        console.error('❌ Error en getTramiteHistorialAcciones:', error)
        throw error
    }
}

/**
 * Función principal para obtener todos los datos del resumen
 */
export async function getTramiteResumenCompleto(tramiteId: number): Promise<TramiteResumenData> {
    try {
        console.log(`📋 Obteniendo resumen completo para trámite ${tramiteId}`)

        // Ejecutar todas las consultas en paralelo
        const [
            tramiteInfo,
            metadatos,
            integrantes,
            asesor,
            archivos,
            historialAcciones
        ] = await Promise.all([
            getTramiteCompleteInfo(tramiteId),
            getTramiteMetadatos(tramiteId),
            getTramiteIntegrantes(tramiteId),
            getTramiteAsesor(tramiteId),
            getTramiteArchivos(tramiteId),
            getTramiteHistorialAcciones(tramiteId)
        ])

        const resumenData: TramiteResumenData = {
            tramite: tramiteInfo,
            metadatos: metadatos || undefined,
            integrantes,
            asesor: asesor || undefined,
            archivos,
            historialAcciones
        }

        console.log(`✅ Resumen completo obtenido:`)
        console.log(`  - Integrantes: ${integrantes.length}`)
        console.log(`  - Archivos: ${archivos.length}`)
        console.log(`  - Acciones: ${historialAcciones.length}`)
        console.log(`  - Asesor: ${asesor ? 'Sí' : 'No'}`)
        console.log(`  - Metadatos: ${metadatos ? 'Sí' : 'No'}`)

        return resumenData

    } catch (error) {
        console.error('❌ Error en getTramiteResumenCompleto:', error)
        throw error
    }
}