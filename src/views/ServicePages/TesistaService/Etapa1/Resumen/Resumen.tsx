// src/views/ServicePages/TesistaService/Etapa1/Resumen/Resumen.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/auth'
import {
    getTramitesByTesista,
    getTramiteResumenCompleto,
    downloadArchiveTramite,
    type TramiteData,
    type TramiteResumenData,
} from '@/services/TramiteService'
import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import { useSessionUser } from '@/store/authStore'

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
    FaChevronUp,
    FaPlay,
    FaPause,
    FaCheck,
    FaSpinner,
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

const Resumen = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { activeCareer, isLoading: careerLoading, activeCareerName } = useActiveTesistaCareer()
    const userData = useSessionUser(state => state.userData)
    const [loading, setLoading] = useState(true)
    const [tramiteActual, setTramiteActual] = useState<TramiteData | null>(null)
    const [resumenData, setResumenData] = useState<TramiteResumenData | null>(null)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        metadatos: true,
        integrantes: true,
        asesor: true,
        archivos: true,
        historial: false,
    })
    const [downloadingFiles, setDownloadingFiles] = useState<Record<number, boolean>>({})

    // Cargar datos
    useEffect(() => {
        const cargarDatos = async () => {
            if (!activeCareer || !user.id) return

            try {
                setLoading(true)

                const tramites = await getTramitesByTesista(activeCareer.tesistaId)
                if (tramites.length === 0) {
                    navigate('/servicio/tesista')
                    return
                }

                const tramite = tramites[0]
                setTramiteActual(tramite)

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
            [section]: !prev[section],
        }))
    }

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleDownloadFile = async (archivo: any) => {
        if (!userData?.uuid) {
            alert('Error: No se pudo obtener la información del usuario')
            return
        }

        try {
            // Activar loading para este archivo específico
            setDownloadingFiles(prev => ({ ...prev, [archivo.id]: true }))

            await downloadArchiveTramite(archivo.nombre_archivo, userData.uuid)
        } catch (error) {
            console.error('Error descargando archivo:', error)
            alert('Error al descargar el archivo. Intente nuevamente.')
        } finally {
            // Desactivar loading
            setDownloadingFiles(prev => ({ ...prev, [archivo.id]: false }))
        }
    }
    const calcularDiasEnProceso = (fechaInicio: string) => {
        const inicio = new Date(fechaInicio)
        const hoy = new Date()
        const diferencia = hoy.getTime() - inicio.getTime()
        return Math.floor(diferencia / (1000 * 60 * 60 * 24))
    }

    const getEstadoColor = (estado: number) => {
        switch (estado) {
            case 1:
                return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400'
            case 0:
                return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getTipoIntegranteLabel = (tipo: number) => {
        switch (tipo) {
            case 1:
                return {
                    label: 'Autor Principal',
                    icon: <FaUser size={16} />,
                    color: 'blue',
                }
            case 2:
                return {
                    label: 'Compañero',
                    icon: <FaUsers size={16} />,
                    color: 'purple',
                }
            default:
                return {
                    label: 'Integrante',
                    icon: <FaUser size={16} />,
                    color: 'gray',
                }
        }
    }

    if (loading || careerLoading) {
        return (
            <div  >
                <div className='text-center'>
                    <Spinner size={40} />
                    <p className='mt-4 text-gray-600 dark:text-gray-300 font-medium'>Cargando información...</p>
                </div>
            </div>
        )
    }

    if (!tramiteActual || !resumenData) {
        return (
            <div  >
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='max-w-md mx-auto text-center'>
                        <div className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8'>
                            <div className='w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6'>
                                <FaExternalLinkAlt className='text-red-600 dark:text-red-400' size={24} />
                            </div>
                            <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                No se encontró información del proyecto
                            </h1>
                            <p className='text-gray-600 dark:text-gray-300 mb-6'>
                                No se pudo cargar la información del proyecto
                            </p>
                            <button
                                onClick={() => navigate('/servicio/tesista')}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg'>
                                Volver al Panel
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </div>
        )
    }

    const { tramite, metadatos, integrantes, asesor, archivos, historialAcciones } = resumenData

    return (
        <div>
            

            <Container >
                {/* Header fuera del container */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className=' max-w-6xl mx-auto mb-8 '>
                {/* Breadcrumb */}
                <div className='flex items-center space-x-2 text-sm text-gray-300 mb-6'>
                    <button
                        onClick={() => navigate('/servicio/tesista')}
                        className='flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                        <FaArrowLeft size={12} />
                        <span>Panel Principal</span>
                    </button>
                    <span>•</span>
                    <span>Resumen del Proyecto</span>
                </div>

                {/* Title */}
                <h1 className='text-3xl font-bold text-gray-100 mb-4'>Resumen del Proyecto de Tesis</h1>
                <p className='text-lg text-gray-300'>Información completa y estado actual de tu proyecto</p>
            </motion.div>
                <div className='max-w-6xl mx-auto py-8'>
                    {/* Project Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8 mb-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 items-center'>
                            {/* Información principal */}
                            <div className='lg:col-span-3'>
                                <div className='flex items-center space-x-4 mb-4'>
                                    <div className='w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-xl flex items-center justify-center'>
                                        <FaRocket className='text-blue-600 dark:text-blue-400' size={20} />
                                    </div>
                                    <div>
                                        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                                            {tramite.codigo_proyecto}
                                        </h2>
                                        <p className='text-gray-600 dark:text-gray-300'>{activeCareerName}</p>
                                    </div>
                                </div>

                                {metadatos && (
                                    <h3 className='text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200'>
                                        {metadatos.titulo}
                                    </h3>
                                )}

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300'>
                                    <div className='flex items-center space-x-2'>
                                        <FaCalendarAlt className='text-blue-500' size={14} />
                                        <span>Iniciado: {formatFecha(tramite.fecha_registro)}</span>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <FaClock className='text-green-500' size={14} />
                                        <span>{calcularDiasEnProceso(tramite.fecha_registro)} días en proceso</span>
                                    </div>
                                </div>
                            </div>

                            {/* Estado de etapa */}
                            <div className='lg:col-span-1'>
                                <div className='bg-blue-50 dark:bg-blue-900 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-700'>
                                    <div className='text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2'>
                                        {tramite.etapa.id}
                                    </div>
                                    <div className='text-sm text-gray-600 dark:text-gray-300 mb-1'>Etapa Actual</div>
                                    <div className='font-semibold text-gray-900 dark:text-gray-100'>
                                        {tramite.etapa.nombre}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Grid Creativo */}
                    <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
                        {/* Columna Principal - 8 columnas */}
                        <div className='xl:col-span-8 space-y-6'>
                            {/* Metadatos del Proyecto */}
                            {metadatos && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg'>
                                    <div
                                        className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                        onClick={() => toggleSection('metadatos')}>
                                        <div className='flex items-center space-x-3'>
                                            <div className='w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                                                <FaFileAlt className='text-blue-600 dark:text-blue-400' size={18} />
                                            </div>
                                            <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                                                Información del Proyecto
                                            </h3>
                                        </div>
                                        <div className='text-gray-400 dark:text-gray-500'>
                                            {expandedSections.metadatos ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedSections.metadatos && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className='p-6'>
                                                <div className='space-y-6'>
                                                    {/* Grid para título y resumen */}
                                                    <div className='grid grid-cols-1 gap-6'>
                                                        <div>
                                                            <h4 className='flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                                                <FaBookOpen className='text-indigo-500' size={16} />
                                                                <span>Título</span>
                                                            </h4>
                                                            <p className='text-gray-700 dark:text-gray-200 leading-relaxed'>
                                                                {metadatos.titulo}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className='flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                                                <FaFileAlt className='text-purple-500' size={16} />
                                                                <span>Resumen</span>
                                                            </h4>
                                                            <p className='text-gray-700 dark:text-gray-200 text-justify leading-relaxed'>
                                                                {metadatos.abstract}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Grid para keywords y presupuesto */}
                                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                                        <div>
                                                            <h4 className='flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                                                <FaTags className='text-pink-500' size={16} />
                                                                <span>Palabras Clave</span>
                                                            </h4>
                                                            <div className='flex flex-wrap gap-2'>
                                                                {metadatos.keywords
                                                                    .split(', ')
                                                                    .map((keyword, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className='bg-blue-50 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium'>
                                                                            {keyword}
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className='flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                                                <FaDollarSign className='text-green-500' size={16} />
                                                                <span>Presupuesto</span>
                                                            </h4>
                                                            <div className='bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4'>
                                                                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                                                                    S/.{' '}
                                                                    {metadatos.presupuesto.toLocaleString('es-PE', {
                                                                        minimumFractionDigits: 2,
                                                                    })}
                                                                </p>
                                                                <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                                                                    Presupuesto estimado
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Línea de investigación */}
                                                    {tramite.sublinea_vri && (
                                                        <div>
                                                            <h4 className='flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                                                                <FaUniversity className='text-orange-500' size={16} />
                                                                <span>Línea de Investigación</span>
                                                            </h4>
                                                            <div className='bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4'>
                                                                <p className='font-semibold text-gray-900 dark:text-gray-100 mb-1'>
                                                                    {tramite.sublinea_vri.nombre}
                                                                </p>
                                                                <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                                    {tramite.sublinea_vri.linea_universidad.nombre} •{' '}
                                                                    {tramite.sublinea_vri.area_ocde.nombre}
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
                                transition={{ delay: 0.3 }}
                                className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg'>
                                <div
                                    className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                    onClick={() => toggleSection('archivos')}>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-10 h-10 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center'>
                                            <FaFileAlt className='text-green-600 dark:text-green-400' size={18} />
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                                                Documentos Cargados
                                            </h3>
                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                {archivos.length} archivo
                                                {archivos.length !== 1 ? 's' : ''} subido
                                                {archivos.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-gray-400 dark:text-gray-500'>
                                        {expandedSections.archivos ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedSections.archivos && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className='p-6'>
                                            <div className='grid gap-4'>
                                                {archivos.map((archivo, index) => (
                                                    <motion.div
                                                        key={archivo.id}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.1,
                                                        }}
                                                        className='flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600'>
                                                        <div className='flex items-center space-x-4'>
                                                            <div className='w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center'>
                                                                <FaFileAlt
                                                                    className='text-gray-600 dark:text-gray-300'
                                                                    size={16}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                                    {archivo.tipo_archivo.nombre}
                                                                </h4>
                                                                <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                                    {archivo.nombre_archivo}
                                                                </p>
                                                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                                    {formatFecha(archivo.fecha)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center space-x-3'>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(archivo.estado_archivo)}`}>
                                                                {archivo.estado_archivo === 1 ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDownloadFile(archivo)}
                                                                disabled={downloadingFiles[archivo.id]}
                                                                className='p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                                                title={
                                                                    downloadingFiles[archivo.id]
                                                                        ? 'Descargando...'
                                                                        : 'Descargar archivo'
                                                                }>
                                                                {downloadingFiles[archivo.id] ? (
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

                            {/* Historial de Acciones */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg'>
                                <div
                                    className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                    onClick={() => toggleSection('historial')}>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-10 h-10 bg-purple-50 dark:bg-purple-900 rounded-lg flex items-center justify-center'>
                                            <FaHistory className='text-purple-600 dark:text-purple-400' size={18} />
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                                                Historial de Actividades
                                            </h3>
                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                {historialAcciones.length} actividad
                                                {historialAcciones.length !== 1 ? 'es' : ''} registrada
                                                {historialAcciones.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-gray-400 dark:text-gray-500'>
                                        {expandedSections.historial ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedSections.historial && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className='p-6'>
                                            <div className='space-y-4'>
                                                {historialAcciones.map((accion, index) => (
                                                    <motion.div
                                                        key={accion.id}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.1,
                                                        }}
                                                        className='flex items-start space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600'>
                                                        <div className='w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
                                                            <FaCheckCircle
                                                                className='text-green-600 dark:text-green-400'
                                                                size={14}
                                                            />
                                                        </div>
                                                        <div className='flex-1'>
                                                            <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                                {accion.accion.nombre}
                                                            </h4>
                                                            <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
                                                                {accion.mensaje || accion.accion.descripcion}
                                                            </p>
                                                            <div className='flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400'>
                                                                <span>{formatFecha(accion.fecha)}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    {accion.usuario.nombres} {accion.usuario.apellidos}
                                                                </span>
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

                        {/* Columna Lateral - 4 columnas */}
                        <div className='xl:col-span-4 space-y-6'>
                            {/* Integrantes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg'>
                                <div
                                    className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                    onClick={() => toggleSection('integrantes')}>
                                    <div className='flex items-center space-x-3'>
                                        <div className='w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                                            <FaUsers className='text-blue-600 dark:text-blue-400' size={18} />
                                        </div>
                                        <div>
                                            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                                Integrantes
                                            </h3>
                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                {integrantes.length} integrante
                                                {integrantes.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-gray-400 dark:text-gray-500 text-sm'>
                                        {expandedSections.integrantes ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedSections.integrantes && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className='p-6'>
                                            <div className='space-y-4'>
                                                {integrantes.map((integrante, index) => {
                                                    const tipoInfo = getTipoIntegranteLabel(integrante.tipo_integrante)
                                                    return (
                                                        <motion.div
                                                            key={integrante.id}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay: index * 0.1,
                                                            }}
                                                            className='flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600'>
                                                            <div className='w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                                                                <div className='text-blue-600 dark:text-blue-400'>
                                                                    {tipoInfo.icon}
                                                                </div>
                                                            </div>
                                                            <div className='flex-1'>
                                                                <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                                    {integrante.tesista.usuario.nombres}{' '}
                                                                    {integrante.tesista.usuario.apellidos}
                                                                </h4>
                                                                <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                                    {tipoInfo.label}
                                                                </p>
                                                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                                    {integrante.tesista.codigo_estudiante}
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
                                    transition={{ delay: 0.3 }}
                                    className='bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg'>
                                    <div
                                        className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                        onClick={() => toggleSection('asesor')}>
                                        <div className='flex items-center space-x-3'>
                                            <div className='w-10 h-10 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center'>
                                                <FaUserTie className='text-green-600 dark:text-green-400' size={18} />
                                            </div>
                                            <div>
                                                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                                    Equipo Asesor
                                                </h3>
                                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                    {asesor.coasesor ? 'Asesor y coasesor' : 'Solo asesor'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='text-gray-400 dark:text-gray-500'>
                                            {expandedSections.asesor ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedSections.asesor && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: 'auto',
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className='p-6'>
                                                <div className='space-y-4'>
                                                    {/* Asesor Principal */}
                                                    <div className='p-4 bg-green-50 dark:bg-green-900 rounded-lg'>
                                                        <div className='flex items-start space-x-3'>
                                                            <div className='w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center'>
                                                                <FaGraduationCap
                                                                    className='text-green-600 dark:text-green-400'
                                                                    size={18}
                                                                />
                                                            </div>
                                                            <div className='flex-1'>
                                                                <h4 className='font-semibold text-green-900 dark:text-green-100'>
                                                                    Asesor Principal
                                                                </h4>
                                                                <p className='font-medium text-gray-900 dark:text-gray-100 mt-1'>
                                                                    {asesor.docente.usuario.nombres}{' '}
                                                                    {asesor.docente.usuario.apellidos}
                                                                </p>
                                                                <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                                    {asesor.docente.especialidad.nombre}
                                                                </p>
                                                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                                                                    Asignado: {formatFecha(asesor.fecha_asignacion)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Coasesor */}
                                                    {asesor.coasesor && (
                                                        <div className='p-4 bg-blue-50 dark:bg-blue-900 rounded-lg'>
                                                            <div className='flex items-start space-x-3'>
                                                                <div className='w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center'>
                                                                    <FaUniversity
                                                                        className='text-blue-600 dark:text-blue-400'
                                                                        size={18}
                                                                    />
                                                                </div>
                                                                <div className='flex-1'>
                                                                    <h4 className='font-semibold text-blue-900 dark:text-blue-100'>
                                                                        Coasesor
                                                                    </h4>
                                                                    <p className='font-medium text-gray-900 dark:text-gray-100 mt-1'>
                                                                        {asesor.coasesor.investigador.usuario.nombres}{' '}
                                                                        {asesor.coasesor.investigador.usuario.apellidos}
                                                                    </p>
                                                                    {asesor.coasesor.investigador.nivel_renacyt && (
                                                                        <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                                            {asesor.coasesor.investigador.nivel_renacyt}
                                                                        </p>
                                                                    )}
                                                                    {asesor.coasesor.investigador.orcid && (
                                                                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
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
                                transition={{ delay: 0.4 }}
                                className='bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6'>
                                <div className='flex items-start space-x-3'>
                                    <FaInfoCircle
                                        className='text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1'
                                        size={20}
                                    />
                                    <div>
                                        <h4 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                                            Estado Actual
                                        </h4>
                                        <p className='text-blue-800 dark:text-blue-200 text-sm mb-4'>
                                            Tu proyecto está en <strong>Etapa {tramite.etapa.id}</strong>.
                                            {tramite.etapa.id === 2 &&
                                                ' El coordinador está revisando el formato de tu proyecto.'}
                                            {tramite.etapa.id > 2 && ' Tu proyecto ha avanzado exitosamente.'}
                                        </p>
                                        <button
                                            onClick={() => navigate('/servicio/tesista')}
                                            className='inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium'>
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
                        className='mt-8 text-center'>
                        <button
                            onClick={() => navigate('/servicio/tesista')}
                            className='inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'>
                            <FaArrowLeft size={16} />
                            <span>Volver al Panel Principal</span>
                        </button>
                    </motion.div>
                </div>
            </Container>
        </div>
    )
}

export default Resumen
