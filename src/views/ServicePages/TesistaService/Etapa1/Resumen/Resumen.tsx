// src/views/ServicePages/TesistaService/Etapa1/Resumen/Resumen.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/auth'
import {
    getTramitesByTesista,
    getTramiteResumenCompleto,
    type TramiteData,
    type TramiteResumenData
} from '@/services/TramiteService'
import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import Container from '@/components/shared/Container'
import {
    FaClipboardList,
    FaUser,
    FaUsers,
    FaFileAlt,
    FaCalendarAlt,
    FaClock,
    FaCheckCircle,
    FaEye,
    FaDownload,
    FaGraduationCap,
    FaUniversity,
    FaBookOpen,
    FaUserTie,
    FaTags,
    FaDollarSign,
    FaHistory,
    FaRocket,
    FaInfoCircle,
    FaExternalLinkAlt,
    FaArrowLeft,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

const Resumen = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const {
        activeCareer,
        isLoading: careerLoading,
        activeCareerName
    } = useActiveTesistaCareer()

    const [loading, setLoading] = useState(true)
    const [tramiteActual, setTramiteActual] = useState<TramiteData | null>(null)
    const [resumenData, setResumenData] = useState<TramiteResumenData | null>(null)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        metadatos: true,
        integrantes: true,
        asesor: true,
        archivos: true,
        historial: false
    })

    // Cargar datos
    useEffect(() => {
        const cargarDatos = async () => {
            if (!activeCareer || !user.id) return

            try {
                setLoading(true)

                // Obtener trámite actual
                const tramites = await getTramitesByTesista(activeCareer.tesistaId)
                if (tramites.length === 0) {
                    navigate('/servicio/tesista')
                    return
                }

                const tramite = tramites[0]
                setTramiteActual(tramite)

                // Obtener resumen completo
                const resumen = await getTramiteResumenCompleto(tramite.id)
                setResumenData(resumen)

            } catch (error) {
                console.error('Error cargando resumen:', error)
                navigate('/servicio/tesista')
            } finally {
                setLoading(false)
            }
        }

        if (!careerLoading && activeCareer) {
            cargarDatos()
        }
    }, [activeCareer, careerLoading, user.id, navigate])

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const calcularDiasEnProceso = (fechaInicio: string) => {
        const inicio = new Date(fechaInicio)
        const hoy = new Date()
        const diferencia = hoy.getTime() - inicio.getTime()
        return Math.floor(diferencia / (1000 * 60 * 60 * 24))
    }

    const getEstadoColor = (estado: number) => {
        switch (estado) {
            case 1: return 'text-green-600 bg-green-100 dark:bg-green-900/40 dark:text-green-400'
            case 0: return 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400'
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
        }
    }

    const getTipoIntegranteLabel = (tipo: number) => {
        switch (tipo) {
            case 1: return { label: 'Autor Principal', icon: <FaUser size={16} />, color: 'blue' }
            case 2: return { label: 'Compañero', icon: <FaUsers size={16} />, color: 'purple' }
            default: return { label: 'Integrante', icon: <FaUser size={16} />, color: 'gray' }
        }
    }

    if (loading || careerLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-screen"
            >
                <Spinner size={40} />
            </motion.div>
        )
    }

    if (!tramiteActual || !resumenData) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        No se encontró información del proyecto
                    </h1>
                    <button
                        onClick={() => navigate('/servicio/tesista')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                        Volver al Panel
                    </button>
                </div>
            </Container>
        )
    }

    const { tramite, metadatos, integrantes, asesor, archivos, historialAcciones } = resumenData

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Container>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Resumen del Proyecto de Tesis
                        </h1>
                        <p className="text-gray-300 dark:text-gray-400 text-lg">
                            Información completa y estado actual de tu proyecto
                        </p>
                    </motion.div>

                    {/* Project Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl p-8 mb-8 text-white"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-4">
                                    <FaRocket size={32} />
                                    <div>
                                        <h2 className="text-2xl font-bold">{tramite.codigo_proyecto}</h2>
                                        <p className="text-blue-100">{activeCareerName}</p>
                                    </div>
                                </div>
                                {metadatos && (
                                    <h3 className="text-xl font-semibold mb-2 text-blue-50">
                                        {metadatos.titulo}
                                    </h3>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                                    <div className="flex items-center space-x-2">
                                        <FaCalendarAlt size={14} />
                                        <span>Iniciado: {formatFecha(tramite.fecha_registro)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FaClock size={14} />
                                        <span>{calcularDiasEnProceso(tramite.fecha_registro)} días en proceso</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 lg:mt-0 lg:ml-8">
                                <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
                                    <div className="text-3xl font-bold mb-1">{tramite.etapa.id}</div>
                                    <div className="text-sm text-blue-100">Etapa Actual</div>
                                    <div className="text-lg font-semibold mt-2">{tramite.etapa.nombre}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Metadatos del Proyecto */}
                            {metadatos && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                    <div 
                                        className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                        onClick={() => toggleSection('metadatos')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                <FaFileAlt className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Información del Proyecto
                                            </h3>
                                        </div>
                                        {expandedSections.metadatos ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>

                                    <AnimatePresence>
                                        {expandedSections.metadatos && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-6"
                                            >
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Título</h4>
                                                        <p className="text-gray-700 dark:text-gray-300">{metadatos.titulo}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resumen</h4>
                                                        <p className="text-gray-700 dark:text-gray-300 text-justify leading-relaxed">
                                                            {metadatos.abstract}
                                                        </p>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                                                                <FaTags size={16} />
                                                                <span>Palabras Clave</span>
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {metadatos.keywords.split(', ').map((keyword, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                                                    >
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                                                                <FaDollarSign size={16} />
                                                                <span>Presupuesto</span>
                                                            </h4>
                                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                                S/. {metadatos.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {tramite.sublinea_vri && (
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                                                                <FaBookOpen size={16} />
                                                                <span>Línea de Investigación</span>
                                                            </h4>
                                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {tramite.sublinea_vri.nombre}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    {tramite.sublinea_vri.linea_universidad.nombre} • {tramite.sublinea_vri.area_ocde.nombre}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Archivos */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                            >
                                <div 
                                    className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                    onClick={() => toggleSection('archivos')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                            <FaFileAlt className="text-green-600 dark:text-green-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Documentos Cargados
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} subido{archivos.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {expandedSections.archivos ? <FaChevronUp /> : <FaChevronDown />}
                                </div>

                                <AnimatePresence>
                                    {expandedSections.archivos && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-6"
                                        >
                                            <div className="space-y-4">
                                                {archivos.map((archivo, index) => (
                                                    <motion.div
                                                        key={archivo.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 bg-white dark:bg-gray-600 rounded-lg">
                                                                <FaFileAlt className="text-gray-600 dark:text-gray-300" size={16} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                                    {archivo.tipo_archivo.nombre}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {archivo.nombre_archivo} • {formatFecha(archivo.fecha)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(archivo.estado_archivo)}`}>
                                                                {archivo.estado_archivo === 1 ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            <button
                                                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                                title="Ver archivo"
                                                            >
                                                                <FaEye size={16} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Historial de Acciones */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                            >
                                <div 
                                    className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                    onClick={() => toggleSection('historial')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                            <FaHistory className="text-purple-600 dark:text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Historial de Actividades
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {historialAcciones.length} actividad{historialAcciones.length !== 1 ? 'es' : ''} registrada{historialAcciones.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {expandedSections.historial ? <FaChevronUp /> : <FaChevronDown />}
                                </div>

                                <AnimatePresence>
                                    {expandedSections.historial && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-6"
                                        >
                                            <div className="space-y-4">
                                                {historialAcciones.map((accion, index) => (
                                                    <motion.div
                                                        key={accion.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                    >
                                                        <div className="p-2 bg-white dark:bg-gray-600 rounded-full">
                                                            <FaCheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {accion.accion.nombre}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {accion.mensaje || accion.accion.descripcion}
                                                            </p>
                                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{formatFecha(accion.fecha)}</span>
                                                                <span>•</span>
                                                                <span>{accion.usuario.nombres} {accion.usuario.apellidos}</span>
                                                                <span>•</span>
                                                                <span>Etapa {accion.etapa.id}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Columna Lateral */}
                        <div className="space-y-6">
                            {/* Integrantes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                            >
                                <div 
                                    className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                    onClick={() => toggleSection('integrantes')}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                            <FaUsers className="text-blue-600 dark:text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Integrantes
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {integrantes.length} integrante{integrantes.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {expandedSections.integrantes ? <FaChevronUp /> : <FaChevronDown />}
                                </div>

                                <AnimatePresence>
                                    {expandedSections.integrantes && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-6"
                                        >
                                            <div className="space-y-4">
                                                {integrantes.map((integrante, index) => {
                                                    const tipoInfo = getTipoIntegranteLabel(integrante.tipo_integrante)
                                                    return (
                                                        <motion.div
                                                            key={integrante.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-${tipoInfo.color}-100 dark:bg-${tipoInfo.color}-900/40`}>
                                                                <div className={`text-${tipoInfo.color}-600 dark:text-${tipoInfo.color}-400`}>
                                                                    {tipoInfo.icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                                    {integrante.tesista.usuario.nombres} {integrante.tesista.usuario.apellidos}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {tipoInfo.label} • {integrante.tesista.codigo_estudiante}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Asesor */}
                            {asesor && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                    <div 
                                        className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                        onClick={() => toggleSection('asesor')}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                                <FaUserTie className="text-green-600 dark:text-green-400" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Equipo Asesor
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {asesor.coasesor ? 'Asesor y coasesor' : 'Solo asesor'}
                                                </p>
                                            </div>
                                        </div>
                                        {expandedSections.asesor ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>

                                    <AnimatePresence>
                                        {expandedSections.asesor && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-6"
                                            >
                                                <div className="space-y-4">
                                                    {/* Asesor Principal */}
                                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                                                <FaGraduationCap className="text-green-600 dark:text-green-400" size={20} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-green-900 dark:text-green-100">
                                                                    Asesor Principal
                                                                </h4>
                                                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                                                    {asesor.docente.usuario.nombres} {asesor.docente.usuario.apellidos}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {asesor.docente.especialidad.nombre}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                                    Asignado: {formatFecha(asesor.fecha_asignacion)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Coasesor */}
                                                    {asesor.coasesor && (
                                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                                    <FaUniversity className="text-blue-600 dark:text-blue-400" size={20} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                                                        Coasesor
                                                                    </h4>
                                                                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                                                                        {asesor.coasesor.investigador.usuario.nombres} {asesor.coasesor.investigador.usuario.apellidos}
                                                                    </p>
                                                                    {asesor.coasesor.investigador.nivel_renacyt && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {asesor.coasesor.investigador.nivel_renacyt}
                                                                        </p>
                                                                    )}
                                                                    {asesor.coasesor.investigador.orcid && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                            ORCID: {asesor.coasesor.investigador.orcid}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Info Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
                            >
                                <div className="flex items-start space-x-3">
                                    <FaInfoCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                            Estado Actual
                                        </h4>
                                        <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                                            Tu proyecto está en <strong>Etapa {tramite.etapa.id}</strong>. 
                                            {tramite.etapa.id === 2 && ' El coordinador está revisando el formato de tu proyecto.'}
                                            {tramite.etapa.id > 2 && ' Tu proyecto ha avanzado exitosamente.'}
                                        </p>
                                        <button
                                            onClick={() => navigate('/servicio/tesista')}
                                            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                                        >
                                            <span>Ver panel completo</span>
                                            <FaExternalLinkAlt size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <button
                            onClick={() => navigate('/servicio/tesista')}
                            className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <FaArrowLeft size={16} />
                            <span>Volver al Panel Principal</span>
                        </button>
                    </motion.div>
                </div>
            </Container>
        </motion.div>
    )
}

export default Resumen