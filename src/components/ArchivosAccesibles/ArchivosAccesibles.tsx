// src/components/ArchivosAccesibles/ArchivosAccesibles.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/auth'
import { useSessionUser } from '@/store/authStore'
import { downloadArchiveTramite } from '@/services/TramiteService'
import { supabase } from '@/lib/supabase'
import Container from '@/components/shared/Container'
import {
    FaFileAlt,
    FaEye,
    FaSpinner,
    FaUser,
    FaUsers,
    FaUserGraduate,
    FaUniversity,
    FaUserTie,
    FaCalendarAlt,
    FaTag,
    FaChevronDown,
    FaChevronUp,
    FaInfoCircle,
    FaExclamationTriangle,
    FaShieldAlt,
    FaBan,
    FaFlask,
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

// Interfaces
export interface ArchivoAccesible {
    archivo: {
        id: number
        nombre_archivo: string
        fecha: string
        estado_archivo: number
        tipo_archivo: {
            id: number
            nombre: string
            descripcion: string | null
        }
    }
    tramite: {
        id: number
        codigo_proyecto: string
        etapa: {
            id: number
            nombre: string
        }
    }
    metadatos?: {
        titulo: string
    }
    proyecto: {
        integrantes: string[]
        carrera: string
        facultad: string
    }
    razonAcceso: 'integrante' | 'docente' | 'coasesor' | 'coordinador' | 'no_accesible'
}

// Estructura para el testing de seguridad
interface ResultadosTesting {
    archivosAccesibles: ArchivoAccesible[]
    archivosNoAccesibles: ArchivoAccesible[]
    totalArchivos: number
}

// Servicio principal - AHORA CON TESTING DE SEGURIDAD
export async function getArchivosParaTesting(userId: number): Promise<ResultadosTesting> {
    try {
        console.log('🔍 === INICIANDO TESTING DE SEGURIDAD COMPLETO ===')
        console.log('🔍 Usuario ID:', userId)

        // PASO 1: Obtener archivos accesibles (lógica existente)
        const archivosAccesibles = await getArchivosAccesiblesParaUsuario(userId)

        // PASO 2: Obtener TODOS los archivos del sistema para comparación
        console.log('🔍 PASO 2: Obteniendo TODOS los archivos del sistema...')
        const todosLosArchivos = await obtenerTodosLosArchivos()

        // PASO 3: Identificar archivos NO accesibles (sin eliminar duplicados)
        const idsAccesibles = new Set(archivosAccesibles.map(a => a.archivo.id))
        const archivosNoAccesibles = todosLosArchivos
            .filter(archivo => !idsAccesibles.has(archivo.archivo.id))
            .map(archivo => ({
                ...archivo,
                razonAcceso: 'no_accesible' as const,
            }))

        console.log('🔒 === RESULTADOS TESTING DE SEGURIDAD ===')
        console.log('✅ Archivos ACCESIBLES (con todos los roles):', archivosAccesibles.length)
        console.log('🚫 Archivos NO ACCESIBLES:', archivosNoAccesibles.length)
        console.log('📊 Total archivos en sistema:', todosLosArchivos.length)
        console.log('📝 NOTA: Los duplicados se mantienen para mostrar acceso por cada rol')
        console.log('🔍 === FIN TESTING DE SEGURIDAD ===')

        return {
            archivosAccesibles,
            archivosNoAccesibles,
            totalArchivos: todosLosArchivos.length,
        }
    } catch (error) {
        console.error('❌ Error en testing de seguridad:', error)
        throw error
    }
}

// Función para obtener TODOS los archivos del sistema (sin filtros de permisos)
async function obtenerTodosLosArchivos(): Promise<ArchivoAccesible[]> {
    console.log('📁 Obteniendo TODOS los archivos del sistema...')

    // Obtener todos los archivos activos
    const { data: archivos, error } = await supabase
        .from('tbl_archivos_tramites')
        .select(
            `
            id,
            nombre_archivo,
            fecha,
            estado_archivo,
            id_tramite,
            tipo_archivo:id_tipo_archivo(
                id,
                nombre,
                descripcion
            )
        `,
        )
        .eq('estado_archivo', 1)

    if (error || !archivos) {
        console.log('❌ Error obteniendo todos los archivos:', error)
        return []
    }

    console.log('📁 Total archivos en sistema:', archivos.length)

    // Obtener información de tramites únicos
    const tramiteIds = [...new Set(archivos.map(a => a.id_tramite))]
    const { data: tramites, error: errorTramites } = await supabase
        .from('tbl_tramites')
        .select(
            `
            id,
            codigo_proyecto,
            etapa:id_etapa(id, nombre),
            metadatos:tbl_tramites_metadatos(titulo),
            integrantes:tbl_integrantes(
                tesista:id_tesista(
                    usuario:id_usuario(nombres, apellidos),
                    estructura_academica:id_estructura_academica(
                        carrera:id_carrera(nombre),
                        facultad:id_facultad(nombre)
                    )
                )
            )
        `,
        )
        .in('id', tramiteIds)

    if (errorTramites || !tramites) {
        console.log('❌ Error obteniendo tramites:', errorTramites)
        return []
    }

    // Combinar archivos con información de tramites
    const archivosCompletos: ArchivoAccesible[] = archivos
        .map(archivo => {
            const tramite = tramites.find(t => t.id === archivo.id_tramite)

            if (!tramite) {
                console.log(`⚠️ No se encontró tramite ${archivo.id_tramite} para archivo ${archivo.id}`)
                return null
            }

            return {
                archivo: {
                    id: archivo.id,
                    nombre_archivo: archivo.nombre_archivo,
                    fecha: archivo.fecha,
                    estado_archivo: archivo.estado_archivo,
                    tipo_archivo: archivo.tipo_archivo,
                },
                tramite: {
                    id: tramite.id,
                    codigo_proyecto: tramite.codigo_proyecto,
                    etapa: tramite.etapa,
                },
                metadatos: tramite.metadatos?.[0]
                    ? {
                          titulo: tramite.metadatos[0].titulo,
                      }
                    : undefined,
                proyecto: {
                    integrantes:
                        tramite.integrantes
                            ?.map(i =>
                                `${i.tesista?.usuario?.nombres || ''} ${i.tesista?.usuario?.apellidos || ''}`.trim(),
                            )
                            .filter(Boolean) || [],
                    carrera: tramite.integrantes?.[0]?.tesista?.estructura_academica?.carrera?.nombre || 'Sin carrera',
                    facultad:
                        tramite.integrantes?.[0]?.tesista?.estructura_academica?.facultad?.nombre || 'Sin facultad',
                },
                razonAcceso: 'no_accesible' as const, // Temporal, se ajusta después
            }
        })
        .filter(Boolean) as ArchivoAccesible[]

    console.log('✅ Archivos completos obtenidos:', archivosCompletos.length)
    return archivosCompletos
}

// Servicio para obtener archivos accesibles - MANTIENE LA LÓGICA QUE FUNCIONA
export async function getArchivosAccesiblesParaUsuario(userId: number): Promise<ArchivoAccesible[]> {
    try {
        console.log('🔍 === INICIANDO SISTEMA CORREGIDO ===')
        console.log('🔍 Usuario ID:', userId)

        // PASO 1: Verificar roles del usuario de manera SIMPLE
        console.log('🔍 PASO 1: Verificando roles del usuario...')
        const rolesUsuario = await verificarRolesUsuario(userId)

        if (!rolesUsuario.tieneAlgunRol) {
            console.log('❌ Usuario no tiene ningún rol. Retornando array vacío.')
            return []
        }

        console.log('✅ Roles encontrados:', rolesUsuario)

        // PASO 2: Obtener archivos según los roles que SÍ tiene
        const archivosFinales: ArchivoAccesible[] = []

        if (rolesUsuario.integrante.length > 0) {
            const archivos = await obtenerArchivosPorTramites(rolesUsuario.integrante, 'integrante')
            archivosFinales.push(...archivos)
            console.log('👤 Archivos como INTEGRANTE:', archivos.length)
        }

        if (rolesUsuario.docente.length > 0) {
            const archivos = await obtenerArchivosPorTramites(rolesUsuario.docente, 'docente')
            archivosFinales.push(...archivos)
            console.log('🎓 Archivos como DOCENTE:', archivos.length)
        }

        if (rolesUsuario.coasesor.length > 0) {
            const archivos = await obtenerArchivosPorTramites(rolesUsuario.coasesor, 'coasesor')
            archivosFinales.push(...archivos)
            console.log('🏛️ Archivos como COASESOR:', archivos.length)
        }

        if (rolesUsuario.coordinador.length > 0) {
            const archivos = await obtenerArchivosPorTramites(rolesUsuario.coordinador, 'coordinador')
            archivosFinales.push(...archivos)
            console.log('👔 Archivos como COORDINADOR:', archivos.length)
        }

        // PASO 3: NO eliminar duplicados - mantener TODOS los accesos por rol
        const todosLosArchivosConRoles = [...archivosFinales]

        console.log('📊 === RESULTADO FINAL (SIN ELIMINAR DUPLICADOS) ===')
        console.log('📊 Total archivos con todos los roles:', todosLosArchivosConRoles.length)
        console.log('📊 Archivos por rol:', {
            integrante: todosLosArchivosConRoles.filter(a => a.razonAcceso === 'integrante').length,
            docente: todosLosArchivosConRoles.filter(a => a.razonAcceso === 'docente').length,
            coasesor: todosLosArchivosConRoles.filter(a => a.razonAcceso === 'coasesor').length,
            coordinador: todosLosArchivosConRoles.filter(a => a.razonAcceso === 'coordinador').length,
        })
        console.log('🔍 === FIN SISTEMA CORREGIDO ===')

        return todosLosArchivosConRoles
    } catch (error) {
        console.error('❌ Error obteniendo archivos accesibles:', error)
        throw error
    }
}

// Función para verificar roles del usuario de manera SIMPLE
async function verificarRolesUsuario(userId: number) {
    console.log('🔍 Verificando roles para usuario:', userId)

    // 1. Verificar INTEGRANTE - tramites donde es integrante
    // 1. Verificar INTEGRANTE - tramites donde es integrante (CORREGIDO PARA MÚLTIPLES CARRERAS)
    console.log('👤 Paso 1a: Buscando TODOS los tesistas para usuario', userId)
    const { data: tesistas } = await supabase.from('tbl_tesistas').select('id').eq('id_usuario', userId) // SIN .maybeSingle() - obtiene TODOS

    console.log(
        '👤 Tesistas encontrados:',
        tesistas?.length || 0,
        tesistas?.map(t => t.id),
    )

    let integrante: any[] = []
    if (tesistas && tesistas.length > 0) {
        console.log(
            '👤 Paso 1b: Buscando tramites para TODOS los tesista_ids:',
            tesistas.map(t => t.id),
        )
        const { data: integranteData } = await supabase
            .from('tbl_integrantes')
            .select('id_tramite')
            .in(
                'id_tesista',
                tesistas.map(t => t.id),
            ) // ← CAMBIO: .in() en lugar de .eq()
            .eq('estado_integrante', 1)

        integrante = integranteData || []
        console.log('👤 Tramites como INTEGRANTE (todas las carreras):', integrante.length)
    }

    // 2. Verificar DOCENTE - tramites donde es jurado
    console.log('🎓 Paso 2a: Buscando docente para usuario', userId)
    const { data: docente_info } = await supabase
        .from('tbl_docentes')
        .select('id')
        .eq('id_usuario', userId)
        .maybeSingle()

    console.log('🎓 Docente encontrado:', docente_info?.id || 'ninguno')

    let docente: any[] = []
    if (docente_info) {
        console.log('🎓 Paso 2b: Buscando tramites donde es jurado con docente_id:', docente_info.id)
        const { data: docenteData } = await supabase
            .from('tbl_conformacion_jurados')
            .select('id_tramite')
            .eq('id_docente', docente_info.id)
            .eq('estado_cj', 1)

        docente = docenteData || []
        console.log('🎓 Tramites como DOCENTE:', docente.length)
    }

    // 3. Verificar COASESOR - tramites donde es coasesor
    console.log('🏛️ Paso 3a: Buscando perfil investigador para usuario', userId)
    const { data: investigador } = await supabase
        .from('tbl_perfil_investigador')
        .select('id')
        .eq('id_usuario', userId)
        .maybeSingle()

    console.log('🏛️ Investigador encontrado:', investigador?.id || 'ninguno')

    let coasesorData: any[] = []
    if (investigador) {
        console.log('🏛️ Paso 3b: Buscando coasesor con investigador_id:', investigador.id)
        const { data: coasesor_info } = await supabase
            .from('tbl_coasesores')
            .select('id')
            .eq('id_investigador', investigador.id)
            .maybeSingle()

        console.log('🏛️ Coasesor encontrado:', coasesor_info?.id || 'ninguno')

        if (coasesor_info) {
            console.log('🏛️ Paso 3c: Buscando tramites donde es coasesor con coasesor_id:', coasesor_info.id)
            const { data: coasesorTramites } = await supabase
                .from('tbl_coasesor_tramites')
                .select('id_tramite')
                .eq('id_coasesor', coasesor_info.id)
                .eq('estado_coasesor', 1)

            coasesorData = coasesorTramites || []
            console.log('🏛️ Tramites como COASESOR:', coasesorData.length)
        }
    }

    // 4. Verificar COORDINADOR - facultades que coordina
    console.log('👔 Paso 4a: Buscando facultades que coordina usuario', userId)
    const { data: coordinadorFacultades } = await supabase
        .from('tbl_coordinadores')
        .select('id_facultad')
        .eq('id_usuario', userId)
        .eq('estado_coordinador', 1)

    console.log('👔 Facultades como COORDINADOR:', coordinadorFacultades?.length || 0)

    // Si es coordinador, obtener tramites de esas facultades
    let coordinadorTramites: number[] = []
    if (coordinadorFacultades && coordinadorFacultades.length > 0) {
        const facultadIds = coordinadorFacultades.map(f => f.id_facultad)
        console.log('👔 Paso 4b: Buscando tramites de facultades:', facultadIds)

        // Obtener tramites de estudiantes de esas facultades
        const { data: tramitesFacultad } = await supabase
            .from('tbl_integrantes')
            .select(
                `
                id_tramite,
                tesista:id_tesista!inner(
                    estructura_academica:id_estructura_academica!inner(
                        id_facultad
                    )
                )
            `,
            )
            .in('tesista.estructura_academica.id_facultad', facultadIds)
            .eq('estado_integrante', 1)

        coordinadorTramites = tramitesFacultad?.map(t => t.id_tramite) || []
        console.log('👔 Tramites como COORDINADOR (derivados):', coordinadorTramites.length)
    }

    const roles = {
        integrante: integrante?.map(i => i.id_tramite) || [],
        docente: docente?.map(d => d.id_tramite) || [],
        coasesor: coasesorData?.map(c => c.id_tramite) || [],
        coordinador: coordinadorTramites,
        tieneAlgunRol:
            (integrante?.length || 0) +
                (docente?.length || 0) +
                (coasesorData?.length || 0) +
                coordinadorTramites.length >
            0,
    }

    console.log('📋 ROLES FINALES:', roles)
    return roles
}

// Función para obtener archivos por tramites específicos
async function obtenerArchivosPorTramites(
    tramiteIds: number[],
    razonAcceso: ArchivoAccesible['razonAcceso'],
): Promise<ArchivoAccesible[]> {
    if (tramiteIds.length === 0) return []

    console.log(`📁 Obteniendo archivos para tramites como ${razonAcceso.toUpperCase()}:`, tramiteIds)

    // Obtener archivos de los tramites específicos
    const { data: archivos, error } = await supabase
        .from('tbl_archivos_tramites')
        .select(
            `
            id,
            nombre_archivo,
            fecha,
            estado_archivo,
            id_tramite,
            tipo_archivo:id_tipo_archivo(
                id,
                nombre,
                descripcion
            )
        `,
        )
        .in('id_tramite', tramiteIds)
        .eq('estado_archivo', 1)

    if (error || !archivos) {
        console.log(`❌ Error obteniendo archivos para ${razonAcceso}:`, error)
        return []
    }

    console.log(`📁 Archivos encontrados para ${razonAcceso}:`, archivos.length)

    // Obtener información de tramites
    const { data: tramites, error: errorTramites } = await supabase
        .from('tbl_tramites')
        .select(
            `
            id,
            codigo_proyecto,
            etapa:id_etapa(id, nombre),
            metadatos:tbl_tramites_metadatos(titulo),
            integrantes:tbl_integrantes(
                tesista:id_tesista(
                    usuario:id_usuario(nombres, apellidos),
                    estructura_academica:id_estructura_academica(
                        carrera:id_carrera(nombre),
                        facultad:id_facultad(nombre)
                    )
                )
            )
        `,
        )
        .in('id', tramiteIds)

    if (errorTramites || !tramites) {
        console.log(`❌ Error obteniendo tramites para ${razonAcceso}:`, errorTramites)
        return []
    }

    // Combinar archivos con información de tramites
    const archivosCompletos: ArchivoAccesible[] = archivos
        .map(archivo => {
            const tramite = tramites.find(t => t.id === archivo.id_tramite)

            if (!tramite) {
                console.log(`⚠️ No se encontró tramite ${archivo.id_tramite} para archivo ${archivo.id}`)
                return null
            }

            return {
                archivo: {
                    id: archivo.id,
                    nombre_archivo: archivo.nombre_archivo,
                    fecha: archivo.fecha,
                    estado_archivo: archivo.estado_archivo,
                    tipo_archivo: archivo.tipo_archivo,
                },
                tramite: {
                    id: tramite.id,
                    codigo_proyecto: tramite.codigo_proyecto,
                    etapa: tramite.etapa,
                },
                metadatos: tramite.metadatos?.[0]
                    ? {
                          titulo: tramite.metadatos[0].titulo,
                      }
                    : undefined,
                proyecto: {
                    integrantes:
                        tramite.integrantes
                            ?.map(i =>
                                `${i.tesista?.usuario?.nombres || ''} ${i.tesista?.usuario?.apellidos || ''}`.trim(),
                            )
                            .filter(Boolean) || [],
                    carrera: tramite.integrantes?.[0]?.tesista?.estructura_academica?.carrera?.nombre || 'Sin carrera',
                    facultad:
                        tramite.integrantes?.[0]?.tesista?.estructura_academica?.facultad?.nombre || 'Sin facultad',
                },
                razonAcceso,
            }
        })
        .filter(Boolean) as ArchivoAccesible[]

    console.log(`✅ Archivos completos para ${razonAcceso}:`, archivosCompletos.length)
    return archivosCompletos
}

const ArchivosAccesibles = () => {
    const { user } = useAuth()
    const userData = useSessionUser(state => state.userData)

    const [loading, setLoading] = useState(true)
    const [resultadosTesting, setResultadosTesting] = useState<ResultadosTesting>({
        archivosAccesibles: [],
        archivosNoAccesibles: [],
        totalArchivos: 0,
    })
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        integrante: true,
        docente: true,
        coasesor: true,
        coordinador: true,
        no_accesible: false, // Inicialmente cerrada para que no distraiga
    })
    const [downloadingFiles, setDownloadingFiles] = useState<Record<number, boolean>>({})
    const [testingResults, setTestingResults] = useState<Record<number, 'pending' | 'blocked' | 'error'>>({})

    // Cargar archivos con testing de seguridad
    useEffect(() => {
        const cargarArchivos = async () => {
            if (!user.id) return

            try {
                setLoading(true)
                const resultados = await getArchivosParaTesting(user.id)
                setResultadosTesting(resultados)
            } catch (error) {
                console.error('Error cargando archivos:', error)
            } finally {
                setLoading(false)
            }
        }

        cargarArchivos()
    }, [user.id])

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleDownloadFile = async (archivo: ArchivoAccesible) => {
        if (!userData?.uuid) {
            alert('Error: No se pudo obtener la información del usuario')
            return
        }

        const isTestingFile = archivo.razonAcceso === 'no_accesible'

        try {
            setDownloadingFiles(prev => ({ ...prev, [archivo.archivo.id]: true }))

            if (isTestingFile) {
                setTestingResults(prev => ({ ...prev, [archivo.archivo.id]: 'pending' }))
                console.log(
                    '🧪 TESTING: Intentando descargar archivo que NO debería ser accesible:',
                    archivo.archivo.nombre_archivo,
                )
            }

            await downloadArchiveTramite(archivo.archivo.nombre_archivo, userData.uuid)

            if (isTestingFile) {
                // Si llega aquí, hay un problema de seguridad
                setTestingResults(prev => ({ ...prev, [archivo.archivo.id]: 'error' }))
                alert(
                    '🚨 ALERTA DE SEGURIDAD: El archivo se descargó cuando NO debería ser accesible. Revisar políticas RLS.',
                )
                console.error('🚨 FALLO DE SEGURIDAD: Archivo descargado sin permisos:', archivo.archivo.nombre_archivo)
            }
        } catch (error) {
            console.error('Error descargando archivo:', error)

            if (isTestingFile) {
                // Esto es lo esperado para archivos no accesibles
                setTestingResults(prev => ({ ...prev, [archivo.archivo.id]: 'blocked' }))
                console.log('✅ SEGURIDAD OK: Archivo correctamente bloqueado por RLS:', archivo.archivo.nombre_archivo)
                alert('✅ Seguridad funcionando: El archivo fue correctamente bloqueado por las políticas RLS.')
            } else {
                alert('Error al descargar el archivo. Intente nuevamente.')
            }
        } finally {
            setDownloadingFiles(prev => ({ ...prev, [archivo.archivo.id]: false }))
        }
    }

    const getRazonIcon = (razon: string) => {
        switch (razon) {
            case 'integrante':
                return <FaUser className='text-blue-500' size={16} />
            case 'docente':
                return <FaUserGraduate className='text-green-500' size={16} />
            case 'coasesor':
                return <FaUniversity className='text-purple-500' size={16} />
            case 'coordinador':
                return <FaUserTie className='text-orange-500' size={16} />
            case 'no_accesible':
                return <FaBan className='text-red-500' size={16} />
            default:
                return <FaFileAlt className='text-gray-500' size={16} />
        }
    }

    const getRazonLabel = (razon: string) => {
        switch (razon) {
            case 'integrante':
                return { label: 'Como Integrante', color: 'blue' }
            case 'docente':
                return { label: 'Como Asesor/Jurado', color: 'green' }
            case 'coasesor':
                return { label: 'Como Coasesor', color: 'purple' }
            case 'coordinador':
                return { label: 'Como Coordinador', color: 'orange' }
            case 'no_accesible':
                return { label: 'Archivos No Accesibles (Testing)', color: 'red' }
            default:
                return { label: 'Acceso Directo', color: 'gray' }
        }
    }

    const getTestingIcon = (archivoId: number) => {
        const result = testingResults[archivoId]
        switch (result) {
            case 'pending':
                return <FaSpinner className='animate-spin text-yellow-500' size={14} />
            case 'blocked':
                return <FaShieldAlt className='text-green-500' size={14} title='Correctamente bloqueado por RLS' />
            case 'error':
                return <FaExclamationTriangle className='text-red-500' size={14} title='¡FALLO DE SEGURIDAD!' />
            default:
                return <FaFlask className='text-gray-400' size={14} title='Click para probar' />
        }
    }

    // Agrupar TODOS los archivos por razón de acceso
    const todosLosArchivos = [...resultadosTesting.archivosAccesibles, ...resultadosTesting.archivosNoAccesibles]
    const archivosPorRazon = todosLosArchivos.reduce(
        (acc, archivo) => {
            if (!acc[archivo.razonAcceso]) {
                acc[archivo.razonAcceso] = []
            }
            acc[archivo.razonAcceso].push(archivo)
            return acc
        },
        {} as Record<string, ArchivoAccesible[]>,
    )

    if (loading) {
        return (
            <Container>
                <div className='text-center py-12'>
                    <Spinner size={40} />
                    <p className='mt-4 text-gray-600 dark:text-gray-300 font-medium'>
                        Cargando archivos y ejecutando testing de seguridad...
                    </p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className='max-w-6xl mx-auto py-8'>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
                        Archivos Accesibles - Auditoría Completa de Roles
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 text-lg'>
                        Vista de auditoría que muestra TODOS los accesos por cada rol individual. Los duplicados son
                        intencionales para verificar acceso multi-rol.
                    </p>
                </motion.div>

                {/* Stats Card - Ahora con testing de seguridad */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 mb-8'>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                        {/* Stats de archivos accesibles */}
                        {Object.entries(archivosPorRazon)
                            .filter(([razon]) => razon !== 'no_accesible')
                            .map(([razon, archivosGrupo]) => {
                                const info = getRazonLabel(razon)
                                return (
                                    <div key={razon} className='text-center'>
                                        <div className='flex items-center justify-center mb-2'>
                                            {getRazonIcon(razon)}
                                        </div>
                                        <div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                                            {archivosGrupo.length}
                                        </div>
                                        <div className='text-sm text-gray-600 dark:text-gray-400'>{info.label}</div>
                                    </div>
                                )
                            })}

                        {/* Stat especial para archivos no accesibles */}
                        <div className='text-center border-l border-gray-200 dark:border-gray-600 pl-4'>
                            <div className='flex items-center justify-center mb-2'>
                                <FaBan className='text-red-500' size={16} />
                            </div>
                            <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                                {resultadosTesting.archivosNoAccesibles.length}
                            </div>
                            <div className='text-sm text-red-600 dark:text-red-400'>No Accesibles</div>
                        </div>
                    </div>

                    <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center'>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Total accesos mostrados:{' '}
                            <strong>
                                {resultadosTesting.archivosAccesibles.length +
                                    resultadosTesting.archivosNoAccesibles.length}
                            </strong>{' '}
                            | Archivos únicos en sistema: <strong>{resultadosTesting.totalArchivos}</strong>
                        </span>
                        <div className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                            Los duplicados son intencionales - muestran acceso por cada rol individual
                        </div>
                    </div>
                </motion.div>

                {/* Secciones por tipo de acceso - incluyendo no accesibles */}
                {Object.entries(archivosPorRazon).map(([razon, archivosGrupo], index) => {
                    const info = getRazonLabel(razon)
                    const isTestingSection = razon === 'no_accesible'

                    return (
                        <motion.div
                            key={razon}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className={`rounded-2xl border shadow-lg mb-6 ${
                                isTestingSection
                                    ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                            <div
                                className={`flex items-center justify-between p-6 border-b cursor-pointer transition-colors ${
                                    isTestingSection
                                        ? 'border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                onClick={() => toggleSection(razon)}>
                                <div className='flex items-center space-x-3'>
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            isTestingSection
                                                ? 'bg-red-100 dark:bg-red-800'
                                                : 'bg-gray-50 dark:bg-gray-700'
                                        }`}>
                                        {getRazonIcon(razon)}
                                    </div>
                                    <div>
                                        <h3
                                            className={`text-xl font-semibold ${
                                                isTestingSection
                                                    ? 'text-red-900 dark:text-red-100'
                                                    : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                            {info.label}
                                            {isTestingSection && (
                                                <span className='ml-2 text-sm font-normal text-red-600 dark:text-red-400'>
                                                    🧪 Testing RLS
                                                </span>
                                            )}
                                        </h3>
                                        <p
                                            className={`text-sm ${
                                                isTestingSection
                                                    ? 'text-red-700 dark:text-red-300'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {archivosGrupo.length} archivo{archivosGrupo.length !== 1 ? 's' : ''}
                                            {isTestingSection && ' - Click para probar políticas RLS'}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`${
                                        isTestingSection
                                            ? 'text-red-400 dark:text-red-500'
                                            : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {expandedSections[razon] ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedSections[razon] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className='p-6'>
                                        {isTestingSection && (
                                            <div className='mb-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
                                                <div className='flex items-start space-x-3'>
                                                    <FaFlask
                                                        className='text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1'
                                                        size={20}
                                                    />
                                                    <div>
                                                        <h4 className='font-semibold text-yellow-900 dark:text-yellow-100 mb-2'>
                                                            ⚠️ Sección de Testing de Seguridad
                                                        </h4>
                                                        <p className='text-yellow-800 dark:text-yellow-200 text-sm'>
                                                            Estos archivos NO deberían ser accesibles para ti. Al hacer
                                                            click en "Ver archivo", las políticas RLS deberían bloquear
                                                            la descarga. Si algún archivo se descarga, indica un fallo
                                                            de seguridad.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className='grid gap-4'>
                                            {archivosGrupo.map((archivo, archivoIndex) => (
                                                <motion.div
                                                    key={archivo.archivo.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: archivoIndex * 0.05 }}
                                                    className={`flex items-center justify-between p-4 rounded-lg border ${
                                                        isTestingSection
                                                            ? 'bg-red-100 dark:bg-red-800 border-red-200 dark:border-red-600'
                                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                    }`}>
                                                    <div className='flex items-center space-x-4 flex-1'>
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                isTestingSection
                                                                    ? 'bg-red-200 dark:bg-red-700'
                                                                    : 'bg-white dark:bg-gray-600'
                                                            }`}>
                                                            <FaFileAlt
                                                                className={`${
                                                                    isTestingSection
                                                                        ? 'text-red-600 dark:text-red-300'
                                                                        : 'text-gray-600 dark:text-gray-300'
                                                                }`}
                                                                size={16}
                                                            />
                                                        </div>
                                                        <div className='flex-1'>
                                                            <div className='flex items-center space-x-2 mb-1'>
                                                                <h4
                                                                    className={`font-semibold ${
                                                                        isTestingSection
                                                                            ? 'text-red-900 dark:text-red-100'
                                                                            : 'text-gray-900 dark:text-gray-100'
                                                                    }`}>
                                                                    {archivo.archivo.tipo_archivo.nombre}
                                                                </h4>
                                                                <span
                                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                                        isTestingSection
                                                                            ? 'bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200'
                                                                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                    }`}>
                                                                    {archivo.tramite.codigo_proyecto}
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-1 rounded text-xs ${
                                                                        isTestingSection
                                                                            ? 'bg-red-200 dark:bg-red-700 text-red-700 dark:text-red-300'
                                                                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                                    }`}>
                                                                    Etapa {archivo.tramite.etapa.id}
                                                                </span>
                                                            </div>
                                                            <p
                                                                className={`text-sm ${
                                                                    isTestingSection
                                                                        ? 'text-red-700 dark:text-red-300'
                                                                        : 'text-gray-600 dark:text-gray-300'
                                                                }`}>
                                                                {archivo.archivo.nombre_archivo}
                                                            </p>
                                                            {archivo.metadatos?.titulo && (
                                                                <p
                                                                    className={`text-xs mt-1 ${
                                                                        isTestingSection
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : 'text-gray-500 dark:text-gray-400'
                                                                    }`}>
                                                                    {archivo.metadatos.titulo}
                                                                </p>
                                                            )}
                                                            <div
                                                                className={`flex items-center space-x-4 mt-2 text-xs ${
                                                                    isTestingSection
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                <span className='flex items-center space-x-1'>
                                                                    <FaCalendarAlt size={10} />
                                                                    <span>{formatFecha(archivo.archivo.fecha)}</span>
                                                                </span>
                                                                <span className='flex items-center space-x-1'>
                                                                    <FaUsers size={10} />
                                                                    <span>
                                                                        {archivo.proyecto.integrantes.join(', ')}
                                                                    </span>
                                                                </span>
                                                                <span className='flex items-center space-x-1'>
                                                                    <FaUniversity size={10} />
                                                                    <span>{archivo.proyecto.carrera}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center space-x-3'>
                                                        {isTestingSection && (
                                                            <div className='flex items-center space-x-1'>
                                                                {getTestingIcon(archivo.archivo.id)}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownloadFile(archivo)}
                                                            disabled={downloadingFiles[archivo.archivo.id]}
                                                            className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                                                isTestingSection
                                                                    ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
                                                                    : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
                                                            }`}
                                                            title={
                                                                isTestingSection
                                                                    ? 'Probar RLS (debería ser bloqueado)'
                                                                    : 'Ver archivo'
                                                            }>
                                                            {downloadingFiles[archivo.archivo.id] ? (
                                                                <FaSpinner className='animate-spin' size={16} />
                                                            ) : (
                                                                <FaEye size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}

                {/* Empty State */}
                {resultadosTesting.totalArchivos === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-center py-12'>
                        <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <FaExclamationTriangle className='text-gray-400 dark:text-gray-500' size={24} />
                        </div>
                        <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                            No hay archivos en el sistema
                        </h3>
                        <p className='text-gray-600 dark:text-gray-400'>No se encontraron documentos en el sistema.</p>
                    </motion.div>
                )}

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className='bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mt-8'>
                    <div className='flex items-start space-x-3'>
                        <FaInfoCircle className='text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1' size={20} />
                        <div>
                            <h4 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                                Sistema de auditoría y testing de roles múltiples
                            </h4>
                            <p className='text-blue-800 dark:text-blue-200 text-sm'>
                                Este componente muestra TODOS los accesos que tienes por cada rol individual, incluyendo
                                duplicados. Un mismo archivo puede aparecer en múltiples secciones si tienes varios
                                roles en el mismo proyecto. Esto es correcto ya que cada rol tendrá su propia vista en
                                el sistema real. Los archivos "No Accesibles" permiten probar las políticas RLS - si
                                alguno se descarga, indica un fallo de seguridad.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Container>
    )
}

export default ArchivosAccesibles
