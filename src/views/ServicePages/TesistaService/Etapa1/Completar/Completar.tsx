// src/views/ServicePages/TesistaService/Etapa1/Completar/Completar.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/auth'
import { useSessionUser } from '@/store/authStore'
import {
    getTramitesByTesista,
    getSublineasByCarrera,
    getDocentesBySublinea,
    getCoasesoresActivos,
    getTiposArchivosEtapa1,
    completarEtapa1,
    type TramiteData,
    type SublineaVRI,
    type DocenteAsesor,
    type CoasesorData,
    type TipoArchivoEtapa1,
    type MetadatosFormData,
    type CompletarEtapa1Data,
} from '@/services/TramiteService'
import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import Container from '@/components/shared/Container'
import {
    FaGraduationCap,
    FaUser,
    FaUsers,
    FaFileAlt,
    FaCloudUploadAlt,
    FaCheck,
    FaSpinner,
    FaTimes,
    FaPlus,
    FaInfoCircle,
    FaExclamationTriangle,
    FaRocket,
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

// Helper function para mostrar nombres completos
const formatNombreCompleto = (
    nombres: string | null,
    apellidos: string | null,
): string => {
    const nom = nombres || 'Sin nombre'
    const ape = apellidos || 'Sin apellidos'
    return `${nom} ${ape}`
}

// Helper function para descripción de archivos
const formatDescripcionArchivo = (descripcion: string | null): string => {
    return descripcion || 'Archivo requerido para el proyecto'
}

const Completar = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const userData = useSessionUser((state) => state.userData)

    const {
        activeCareer,
        isLoading: careerLoading,
        activeCareerName,
    } = useActiveTesistaCareer()

    // Estados principales
    const [loading, setLoading] = useState(true)
    const [tramiteActual, setTramiteActual] = useState<TramiteData | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Estados de datos
    const [sublineas, setSublineas] = useState<SublineaVRI[]>([])
    const [docentes, setDocentes] = useState<DocenteAsesor[]>([])
    const [coasesores, setCoasesores] = useState<CoasesorData[]>([])
    const [tiposArchivos, setTiposArchivos] = useState<TipoArchivoEtapa1[]>([])

    // Estados del formulario
    const [selectedSublinea, setSelectedSublinea] = useState<number | null>(
        null,
    )
    const [selectedAsesor, setSelectedAsesor] = useState<number | null>(null)
    const [selectedCoasesor, setSelectedCoasesor] = useState<number | null>(
        null,
    )
    const [metadatos, setMetadatos] = useState<MetadatosFormData>({
        titulo: '',
        abstract: '',
        keywords: '',
        presupuesto: 0,
    })

    // Estados de keywords
    const [keywordInput, setKeywordInput] = useState('')
    const [keywords, setKeywords] = useState<string[]>([])

    // Estados de archivos
    const [archivos, setArchivos] = useState<
        { file: File; tipoId: number; tipoNombre: string }[]
    >([])
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            if (!activeCareer || !user.id) return

            try {
                setLoading(true)

                // Obtener trámite actual
                const tramites = await getTramitesByTesista(
                    activeCareer.tesistaId,
                )
                if (tramites.length === 0) {
                    navigate('/servicio/tesista')
                    return
                }

                const tramite = tramites[0]
                setTramiteActual(tramite)

                // Verificar que esté en etapa 1
                if (tramite.etapa.id !== 1) {
                    navigate('/servicio/tesista')
                    return
                }

                // Cargar datos paralelos
                const [sublineasData, coasesoresData, tiposArchivosData] =
                    await Promise.all([
                        getSublineasByCarrera(
                            activeCareer.estructuraAcademica.carrera.id,
                        ),
                        getCoasesoresActivos(),
                        getTiposArchivosEtapa1(),
                    ])

                setSublineas(sublineasData)
                setCoasesores(coasesoresData)
                setTiposArchivos(tiposArchivosData)
            } catch (error) {
                console.error('Error cargando datos:', error)
                navigate('/servicio/tesista')
            } finally {
                setLoading(false)
            }
        }

        if (!careerLoading && activeCareer) {
            cargarDatos()
        }
    }, [activeCareer, careerLoading, user.id, navigate])

    // Cargar docentes cuando cambia sublínea
    useEffect(() => {
        const cargarDocentes = async () => {
            if (!selectedSublinea) {
                setDocentes([])
                setSelectedAsesor(null)
                return
            }

            try {
                const docentesData =
                    await getDocentesBySublinea(selectedSublinea)
                setDocentes(docentesData)
                setSelectedAsesor(null) // Reset asesor al cambiar sublínea
            } catch (error) {
                console.error('Error cargando docentes:', error)
                setDocentes([])
            }
        }

        cargarDocentes()
    }, [selectedSublinea])

    // Manejar keywords
    const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault()
            const newKeyword = keywordInput.trim().toLowerCase()

            if (!keywords.includes(newKeyword) && keywords.length < 10) {
                const newKeywords = [...keywords, newKeyword]
                setKeywords(newKeywords)
                setMetadatos((prev) => ({
                    ...prev,
                    keywords: newKeywords.join(', '),
                }))
            }
            setKeywordInput('')
        }
    }

    const removeKeyword = (indexToRemove: number) => {
        const newKeywords = keywords.filter(
            (_, index) => index !== indexToRemove,
        )
        setKeywords(newKeywords)
        setMetadatos((prev) => ({
            ...prev,
            keywords: newKeywords.join(', '),
        }))
    }

    // Manejar upload de archivos
    const handleFileUpload = (file: File, tipoId: number) => {
        const tipoArchivo = tiposArchivos.find((t) => t.id === tipoId)
        if (!tipoArchivo) return

        // Validar tamaño
        const maxSizeMB = tipoArchivo.max_size
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
            return
        }

        // Validar extensión
        const extension = file.name.split('.').pop()?.toLowerCase()
        const validExtensions = tipoId === 1 ? ['doc', 'docx'] : ['pdf']

        if (!extension || !validExtensions.includes(extension)) {
            alert(
                `Tipo de archivo no válido. Use: ${validExtensions.join(', ')}`,
            )
            return
        }

        // Remover archivo anterior del mismo tipo
        setArchivos((prev) => prev.filter((a) => a.tipoId !== tipoId))

        // Agregar nuevo archivo
        setArchivos((prev) => [
            ...prev,
            {
                file,
                tipoId,
                tipoNombre: tipoArchivo.nombre,
            },
        ])
    }

    const removeFile = (tipoId: number) => {
        setArchivos((prev) => prev.filter((a) => a.tipoId !== tipoId))
    }

    // Validar formulario
    const isFormValid = () => {
    const requiredFields = 
        tramiteActual &&
        selectedSublinea &&
        selectedAsesor &&
        metadatos.titulo.trim() &&
        metadatos.abstract.trim() &&
        keywords.length >= 3 &&
        metadatos.presupuesto > 0 &&
        userData?.uuid // ← AGREGAR esta validación

    const requiredFiles = tiposArchivos
        .filter(t => t.obligatorio)
        .every(t => archivos.some(a => a.tipoId === t.id))

    return requiredFields && requiredFiles
}

    // Manejar envío
    const handleSubmit = async () => {
    if (!isFormValid() || !tramiteActual || !user.id || !userData?.uuid) {
        console.error('Datos insuficientes:', { 
            formValid: isFormValid(), 
            tramite: !!tramiteActual, 
            userId: !!user.id, 
            userUuid: !!userData?.uuid 
        })
        return
    }

    try {
        setSubmitting(true)

        const completarData: CompletarEtapa1Data = {
            metadatos,
            sublineaId: selectedSublinea!,
            asesorId: selectedAsesor!,
            coasesorId: selectedCoasesor || undefined,
            archivos: archivos.map(a => ({ file: a.file, tipoId: a.tipoId }))
        }

        console.log('🚀 Usando UUID para storage:', userData.uuid)

        await completarEtapa1(
            tramiteActual.id,
            tramiteActual.codigo_proyecto,
            userData.uuid, // ← CAMBIO CRÍTICO: usar UUID en lugar de user.id
            completarData
        )

        // Redirigir a resumen
        navigate('/pilar/pregrado/estudiantes/etapa1/resumen')

    } catch (error) {
        console.error('Error completando etapa:', error)
        alert('Error al completar la etapa. Intente nuevamente.')
    } finally {
        setSubmitting(false)
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

    if (!tramiteActual) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        No se encontró proyecto activo
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Completar Información del Proyecto
                        </h1>
                        <p className="text-gray-300 dark:text-gray-400 text-lg">
                            Llena todos los campos requeridos para finalizar la
                            Etapa 1
                        </p>
                    </motion.div>

                    {/* Project Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
                    >
                        <div className="flex items-center space-x-3">
                            <FaGraduationCap
                                className="text-blue-600 dark:text-blue-400"
                                size={24}
                            />
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    {tramiteActual.codigo_proyecto} •{' '}
                                    {activeCareerName}
                                </h3>
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    Etapa {tramiteActual.etapa.id}:{' '}
                                    {tramiteActual.etapa.nombre}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-8"
                    >
                        <div className="space-y-8">
                            {/* Sublínea de Investigación */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Línea de Investigación *
                                </label>
                                <select
                                    value={selectedSublinea || ''}
                                    onChange={(e) =>
                                        setSelectedSublinea(
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">
                                        Selecciona una línea de investigación
                                    </option>
                                    {sublineas.map((sublinea) => (
                                        <option
                                            key={sublinea.id}
                                            value={sublinea.id}
                                        >
                                            {sublinea.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Asesor Principal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Asesor Principal *
                                </label>
                                <select
                                    value={selectedAsesor || ''}
                                    onChange={(e) =>
                                        setSelectedAsesor(
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    disabled={!selectedSublinea}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {selectedSublinea
                                            ? 'Selecciona un asesor'
                                            : 'Primero selecciona una línea de investigación'}
                                    </option>
                                    {docentes.map((docente) => (
                                        <option
                                            key={docente.id}
                                            value={docente.id}
                                        >
                                            {formatNombreCompleto(
                                                docente.usuario.nombres,
                                                docente.usuario.apellidos,
                                            )}{' '}
                                            - {docente.especialidad.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Coasesor (Opcional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Coasesor (Opcional)
                                </label>
                                <select
                                    value={selectedCoasesor || ''}
                                    onChange={(e) =>
                                        setSelectedCoasesor(
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Sin coasesor</option>
                                    {coasesores
                                        .filter((c) => c.id !== selectedAsesor) // Excluir asesor seleccionado
                                        .map((coasesor) => (
                                            <option
                                                key={coasesor.id}
                                                value={coasesor.id}
                                            >
                                                {formatNombreCompleto(
                                                    coasesor.investigador
                                                        .usuario.nombres,
                                                    coasesor.investigador
                                                        .usuario.apellidos,
                                                )}
                                                {coasesor.investigador
                                                    .nivel_renacyt &&
                                                    ` - ${coasesor.investigador.nivel_renacyt}`}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Título del Proyecto *
                                </label>
                                <input
                                    type="text"
                                    value={metadatos.titulo}
                                    onChange={(e) =>
                                        setMetadatos((prev) => ({
                                            ...prev,
                                            titulo: e.target.value,
                                        }))
                                    }
                                    placeholder="Ingresa el título de tu proyecto de tesis"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Abstract/Resumen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Resumen (Abstract) *
                                </label>
                                <textarea
                                    value={metadatos.abstract}
                                    onChange={(e) =>
                                        setMetadatos((prev) => ({
                                            ...prev,
                                            abstract: e.target.value,
                                        }))
                                    }
                                    placeholder="Describe brevemente tu proyecto de investigación..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Palabras Clave * (mínimo 3, máximo 10)
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) =>
                                            setKeywordInput(e.target.value)
                                        }
                                        onKeyPress={handleKeywordKeyPress}
                                        placeholder="Escribe una palabra clave y presiona Enter"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                            >
                                                <span>{keyword}</span>
                                                <button
                                                    onClick={() =>
                                                        removeKeyword(index)
                                                    }
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {keywords.length}/10 palabras clave •{' '}
                                        {keywords.length >= 3 ? '✅' : '❌'}{' '}
                                        Mínimo 3 requeridas
                                    </p>
                                </div>
                            </div>

                            {/* Presupuesto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Presupuesto Estimado (S/.) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={metadatos.presupuesto || ''}
                                    onChange={(e) =>
                                        setMetadatos((prev) => ({
                                            ...prev,
                                            presupuesto:
                                                parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Upload de Archivos */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Documentos Requeridos
                                </h3>
                                <div className="space-y-4">
                                    {tiposArchivos.map((tipo) => {
                                        const archivoSubido = archivos.find(
                                            (a) => a.tipoId === tipo.id,
                                        )
                                        return (
                                            <div
                                                key={tipo.id}
                                                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                                                    archivoSubido
                                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                                        : tipo.obligatorio
                                                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                                                          : 'border-gray-300 bg-gray-50 dark:bg-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {tipo.nombre}{' '}
                                                            {tipo.obligatorio &&
                                                                '*'}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {formatDescripcionArchivo(
                                                                tipo.descripcion,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            Tamaño máximo:{' '}
                                                            {tipo.max_size}MB •
                                                            Formato:{' '}
                                                            {tipo.id === 1
                                                                ? 'DOC/DOCX'
                                                                : 'PDF'}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4">
                                                        {archivoSubido ? (
                                                            <div className="flex items-center space-x-2">
                                                                <FaCheck
                                                                    className="text-green-600"
                                                                    size={20}
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        removeFile(
                                                                            tipo.id,
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <FaTimes
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                                                                <FaCloudUploadAlt
                                                                    size={16}
                                                                />
                                                                <span>
                                                                    Subir
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept={
                                                                        tipo.id ===
                                                                        1
                                                                            ? '.doc,.docx'
                                                                            : '.pdf'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const file =
                                                                            e
                                                                                .target
                                                                                .files?.[0]
                                                                        if (
                                                                            file
                                                                        ) {
                                                                            handleFileUpload(
                                                                                file,
                                                                                tipo.id,
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                                {archivoSubido && (
                                                    <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                                                        ✅{' '}
                                                        {
                                                            archivoSubido.file
                                                                .name
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Validación Info */}
                            {!isFormValid() && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                    <div className="flex space-x-3">
                                        <FaExclamationTriangle
                                            className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                            size={16}
                                        />
                                        <div className="text-amber-700 dark:text-amber-300 text-sm">
                                            <p className="font-medium mb-1">
                                                Campos pendientes:
                                            </p>
                                            <ul className="space-y-1 text-xs">
                                                {!selectedSublinea && (
                                                    <li>
                                                        • Línea de investigación
                                                    </li>
                                                )}
                                                {!selectedAsesor && (
                                                    <li>• Asesor principal</li>
                                                )}
                                                {!metadatos.titulo.trim() && (
                                                    <li>
                                                        • Título del proyecto
                                                    </li>
                                                )}
                                                {!metadatos.abstract.trim() && (
                                                    <li>• Resumen</li>
                                                )}
                                                {keywords.length < 3 && (
                                                    <li>
                                                        • Mínimo 3 palabras
                                                        clave
                                                    </li>
                                                )}
                                                {metadatos.presupuesto <= 0 && (
                                                    <li>
                                                        • Presupuesto estimado
                                                    </li>
                                                )}
                                                {tiposArchivos
                                                    .filter(
                                                        (t) => t.obligatorio,
                                                    )
                                                    .some(
                                                        (t) =>
                                                            !archivos.some(
                                                                (a) =>
                                                                    a.tipoId ===
                                                                    t.id,
                                                            ),
                                                    ) && (
                                                    <li>
                                                        • Documentos
                                                        obligatorios
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() =>
                                        navigate('/servicio/tesista')
                                    }
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                                >
                                    ← Volver al Panel
                                </button>

                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={!isFormValid() || submitting}
                                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={16}
                                            />
                                            <span>Procesando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaRocket size={16} />
                                            <span>
                                                Confirmar y Finalizar Etapa
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Modal de Confirmación */}
                <AnimatePresence>
                    {showConfirmModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaCheck
                                            className="text-green-600 dark:text-green-400"
                                            size={24}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Confirmar Finalización
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        ¿Estás seguro de finalizar la Etapa 1?
                                        Esta acción no se puede deshacer y tu
                                        proyecto pasará a revisión de formato.
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() =>
                                                setShowConfirmModal(false)
                                            }
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setShowConfirmModal(false)
                                                await handleSubmit()
                                            }}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </motion.div>
    )
}

export default Completar
