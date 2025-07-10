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
    FaUpload,
    FaCheckCircle,
    FaPaperclip,
    FaFileUpload,
    FaArrowLeft,
    FaArrowRight,
    FaEdit,
    FaTags,
    FaCoins,
    FaSearch,
    FaUserGraduate,
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

// Helper functions
const formatNombreCompleto = (
    nombres: string | null,
    apellidos: string | null,
): string => {
    const nom = nombres || 'Sin nombre'
    const ape = apellidos || 'Sin apellidos'
    return `${nom} ${ape}`
}

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
    const [currentStep, setCurrentStep] = useState(1) // Nuevo estado para pasos

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

    // Estados de archivos y drag & drop
    const [archivos, setArchivos] = useState<
        { file: File; tipoId: number; tipoNombre: string }[]
    >([])
    const [dragStates, setDragStates] = useState<Record<number, boolean>>({})
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            if (!activeCareer || !user.id) return

            try {
                setLoading(true)

                const tramites = await getTramitesByTesista(
                    activeCareer.tesistaId,
                )
                if (tramites.length === 0) {
                    navigate('/servicio/tesista')
                    return
                }

                const tramite = tramites[0]
                setTramiteActual(tramite)

                if (tramite.etapa.id !== 1) {
                    navigate('/servicio/tesista')
                    return
                }

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
                setSelectedAsesor(null)
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

    // Drag & Drop handlers
    const handleDragEnter = (e: React.DragEvent, tipoId: number) => {
        e.preventDefault()
        setDragStates((prev) => ({ ...prev, [tipoId]: true }))
    }

    const handleDragLeave = (e: React.DragEvent, tipoId: number) => {
        e.preventDefault()
        setDragStates((prev) => ({ ...prev, [tipoId]: false }))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, tipoId: number) => {
        e.preventDefault()
        setDragStates((prev) => ({ ...prev, [tipoId]: false }))

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0], tipoId)
        }
    }

    // Manejar upload de archivos
    const handleFileUpload = (file: File, tipoId: number) => {
        const tipoArchivo = tiposArchivos.find((t) => t.id === tipoId)
        if (!tipoArchivo) return

        const maxSizeMB = tipoArchivo.max_size
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
            return
        }

        const extension = file.name.split('.').pop()?.toLowerCase()
        const validExtensions = tipoId === 1 ? ['doc', 'docx'] : ['pdf']

        if (!extension || !validExtensions.includes(extension)) {
            alert(
                `Tipo de archivo no válido. Use: ${validExtensions.join(', ')}`,
            )
            return
        }

        setArchivos((prev) => prev.filter((a) => a.tipoId !== tipoId))

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

    // Validar paso 1 (metadatos)
    const isStep1Valid = () => {
        return (
            selectedSublinea &&
            selectedAsesor &&
            metadatos.titulo.trim() &&
            metadatos.abstract.trim() &&
            keywords.length >= 3 &&
            metadatos.presupuesto > 0
        )
    }

    // Validar paso 2 (archivos)
    const isStep2Valid = () => {
        return tiposArchivos
            .filter((t) => t.obligatorio)
            .every((t) => archivos.some((a) => a.tipoId === t.id))
    }

    // Validar formulario completo
    const isFormValid = () => {
        return (
            tramiteActual && userData?.uuid && isStep1Valid() && isStep2Valid()
        )
    }

    // Manejar siguiente paso
    const handleNextStep = () => {
        if (currentStep === 1 && isStep1Valid()) {
            setCurrentStep(2)
        }
    }

    // Manejar paso anterior
    const handlePrevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1)
        }
    }

    // Manejar envío
    const handleSubmit = async () => {
        if (!isFormValid() || !tramiteActual || !user.id || !userData?.uuid) {
            console.error('Datos insuficientes')
            return
        }

        try {
            setSubmitting(true)

            const completarData: CompletarEtapa1Data = {
                metadatos,
                sublineaId: selectedSublinea!,
                asesorId: selectedAsesor!,
                coasesorId: selectedCoasesor || undefined,
                archivos: archivos.map((a) => ({
                    file: a.file,
                    tipoId: a.tipoId,
                })),
            }

            await completarEtapa1(
                tramiteActual.id,
                tramiteActual.codigo_proyecto,
                userData.uuid,
                completarData,
            )

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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size={40} />
                    <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
                        Cargando información...
                    </p>
                </div>
            </div>
        )
    }

    if (!tramiteActual) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto text-center"
                    >
                        <div className="bg-white  dark:bg-gray-800  backdrop-blur-lg rounded-2xl border border-gray-200  dark:border-gray-700  shadow-xl p-8">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900  rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaExclamationTriangle
                                    className="text-red-600 dark:text-red-400"
                                    size={24}
                                />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                No se encontró proyecto activo
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                No tienes ningún proyecto en proceso actualmente
                            </p>
                            <button
                                onClick={() => navigate('/servicio/tesista')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                            >
                                Volver al Panel
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
                    <button
                        onClick={() => navigate('/servicio/tesista')}
                        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <FaArrowLeft size={12} />
                        <span>Panel Principal</span>
                    </button>
                    <span>•</span>
                    <span>Completar Etapa 1</span>
                </div>

                {/* Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">
                            Completar Información del Proyecto
                        </h1>
                        <p className="text-lg text-gray-300">
                            Proporciona toda la información necesaria para
                            finalizar la primera etapa.
                        </p>
                    </div>
                </div>
            </motion.div>
            <Container className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-3xl m-4">
                <div className="max-w-6xl mx-auto py-8">
                    {/* Project Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white  dark:bg-gray-800  backdrop-blur-lg rounded-2xl border border-gray-200  dark:border-gray-700  shadow-xl p-6 mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-500  dark:bg-blue-500  rounded-xl flex items-center justify-center">
                                    <FaGraduationCap
                                        className="text-white dark:text-white"
                                        size={20}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {tramiteActual.codigo_proyecto}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {activeCareerName}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Etapa Actual
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {tramiteActual.etapa.nombre}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-center space-x-4">
                            {/* Step 1 */}
                            <div className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                                        currentStep >= 1
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500 '
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {isStep1Valid() ? (
                                        <FaCheck size={16} />
                                    ) : (
                                        '1'
                                    )}
                                </div>
                                <span
                                    className={`ml-2 font-medium ${
                                        currentStep >= 1
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Información del Proyecto
                                </span>
                            </div>

                            {/* Connector */}
                            <div
                                className={`w-16 h-1 rounded transition-all duration-300 ${
                                    currentStep > 1
                                        ? 'bg-blue-500'
                                        : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                            />

                            {/* Step 2 */}
                            <div className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                                        currentStep >= 2
                                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500 '
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {isStep2Valid() ? (
                                        <FaCheck size={16} />
                                    ) : (
                                        '2'
                                    )}
                                </div>
                                <span
                                    className={`ml-2 font-medium ${
                                        currentStep >= 2
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Documentos
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Content */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white  dark:bg-gray-800  backdrop-blur-lg rounded-2xl border border-gray-200  dark:border-gray-700  shadow-xl overflow-hidden"
                    >
                        {/* Step 1: Información del Proyecto */}
                        {currentStep === 1 && (
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Información del Proyecto
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Completa los metadatos y detalles
                                        académicos de tu proyecto de tesis.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {/* Grid creativo para campos principales */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        {/* Línea de investigación - Span completo en mobile, 2 columnas en desktop */}
                                        <div className="xl:col-span-2">
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaSearch
                                                    className="text-blue-500"
                                                    size={16}
                                                />
                                                <span>
                                                    Línea de Investigación *
                                                </span>
                                            </label>
                                            <select
                                                value={selectedSublinea || ''}
                                                onChange={(e) =>
                                                    setSelectedSublinea(
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    Selecciona una línea de
                                                    investigación
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

                                        {/* Asesor - 1 columna */}
                                        <div>
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaUserGraduate
                                                    className="text-green-500"
                                                    size={16}
                                                />
                                                <span>Asesor Principal *</span>
                                            </label>
                                            <select
                                                value={selectedAsesor || ''}
                                                onChange={(e) =>
                                                    setSelectedAsesor(
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                disabled={!selectedSublinea}
                                                className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 disabled:opacity-50 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    {selectedSublinea
                                                        ? 'Selecciona un asesor'
                                                        : 'Primero selecciona una línea'}
                                                </option>
                                                {docentes.map((docente) => (
                                                    <option
                                                        key={docente.id}
                                                        value={docente.id}
                                                    >
                                                        {formatNombreCompleto(
                                                            docente.usuario
                                                                .nombres,
                                                            docente.usuario
                                                                .apellidos,
                                                        )}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Grid para coasesor y presupuesto */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaUsers
                                                    className="text-purple-500"
                                                    size={16}
                                                />
                                                <span>Coasesor (Opcional)</span>
                                            </label>
                                            <select
                                                value={selectedCoasesor || ''}
                                                onChange={(e) =>
                                                    setSelectedCoasesor(
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="">
                                                    Sin coasesor
                                                </option>
                                                {coasesores
                                                    .filter(
                                                        (c) =>
                                                            c.id !==
                                                            selectedAsesor,
                                                    )
                                                    .map((coasesor) => (
                                                        <option
                                                            key={coasesor.id}
                                                            value={coasesor.id}
                                                        >
                                                            {formatNombreCompleto(
                                                                coasesor
                                                                    .investigador
                                                                    .usuario
                                                                    .nombres,
                                                                coasesor
                                                                    .investigador
                                                                    .usuario
                                                                    .apellidos,
                                                            )}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaCoins
                                                    className="text-yellow-500"
                                                    size={16}
                                                />
                                                <span>
                                                    Presupuesto Estimado (S/.) *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    metadatos.presupuesto || ''
                                                }
                                                onChange={(e) =>
                                                    setMetadatos((prev) => ({
                                                        ...prev,
                                                        presupuesto:
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                    }))
                                                }
                                                placeholder="0.00"
                                                className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Título - Ancho completo */}
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                            <FaEdit
                                                className="text-indigo-500"
                                                size={16}
                                            />
                                            <span>Título del Proyecto *</span>
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
                                            placeholder="Ingresa el título completo de tu proyecto de tesis..."
                                            className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Grid para Abstract y Keywords */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Abstract */}
                                        <div>
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaFileAlt
                                                    className="text-orange-500"
                                                    size={16}
                                                />
                                                <span>
                                                    Resumen (Abstract) *
                                                </span>
                                            </label>
                                            <textarea
                                                value={metadatos.abstract}
                                                onChange={(e) =>
                                                    setMetadatos((prev) => ({
                                                        ...prev,
                                                        abstract:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Describe brevemente tu proyecto: objetivos, metodología y resultados esperados..."
                                                rows={6}
                                                className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        {/* Keywords */}
                                        <div>
                                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                                <FaTags
                                                    className="text-pink-500"
                                                    size={16}
                                                />
                                                <span>
                                                    Palabras Clave * (min. 3,
                                                    máx. 10)
                                                </span>
                                            </label>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={keywordInput}
                                                    onChange={(e) =>
                                                        setKeywordInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyPress={
                                                        handleKeywordKeyPress
                                                    }
                                                    placeholder="Escribe una palabra clave y presiona Enter..."
                                                    className="w-full px-4 py-3 bg-white  dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-gray-900 dark:text-gray-100"
                                                />

                                                {keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        <AnimatePresence>
                                                            {keywords.map(
                                                                (
                                                                    keyword,
                                                                    index,
                                                                ) => (
                                                                    <motion.span
                                                                        key={
                                                                            index
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            scale: 0.8,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            scale: 1,
                                                                        }}
                                                                        exit={{
                                                                            opacity: 0,
                                                                            scale: 0.8,
                                                                        }}
                                                                        className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 border border-blue-200 dark:border-blue-700  text-blue-700 dark:text-white px-3 py-1.5 rounded-full text-sm font-medium"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                keyword
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                removeKeyword(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                        >
                                                                            <FaTimes
                                                                                size={
                                                                                    10
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </motion.span>
                                                                ),
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500 dark:text-gray-300">
                                                        {keywords.length}{' '}
                                                        palabras clave
                                                    </span>
                                                    <span
                                                        className={`font-medium ${keywords.length >= 3 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                                                    >
                                                        {keywords.length >= 3
                                                            ? '✓ Completado'
                                                            : 'Mínimo 3 requeridas'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={() =>
                                            navigate('/servicio/tesista')
                                        }
                                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                                    >
                                        <FaArrowLeft size={14} />
                                        <span>Cancelar</span>
                                    </button>

                                    <button
                                        onClick={handleNextStep}
                                        disabled={!isStep1Valid()}
                                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                                    >
                                        <span>Continuar</span>
                                        <FaArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Documentos */}
                        {currentStep === 2 && (
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Documentos del Proyecto
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Sube los documentos requeridos para
                                        completar tu solicitud.
                                    </p>
                                </div>

                                {/* Grid creativo para archivos */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {tiposArchivos.map((tipo) => {
                                        const archivoSubido = archivos.find(
                                            (a) => a.tipoId === tipo.id,
                                        )
                                        const isDragging = dragStates[tipo.id]

                                        return (
                                            <motion.div
                                                key={tipo.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: tipo.id * 0.1,
                                                }}
                                                className={`group relative overflow-hidden border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                                                    archivoSubido
                                                        ? 'border-green-400 bg-green-50  dark:bg-green-900 '
                                                        : isDragging
                                                          ? 'border-blue-400 bg-blue-50  dark:bg-blue-900  scale-[1.02]'
                                                          : tipo.obligatorio
                                                            ? 'border-orange-300 bg-orange-50  dark:bg-orange-900  hover:border-orange-400'
                                                            : 'border-gray-300 bg-gray-50  dark:bg-gray-700  hover:border-gray-400'
                                                }`}
                                                onDragEnter={(e) =>
                                                    handleDragEnter(e, tipo.id)
                                                }
                                                onDragLeave={(e) =>
                                                    handleDragLeave(e, tipo.id)
                                                }
                                                onDragOver={handleDragOver}
                                                onDrop={(e) =>
                                                    handleDrop(e, tipo.id)
                                                }
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                            archivoSubido
                                                                ? 'bg-green-500  text-green-600 dark:text-green-400'
                                                                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200  group-hover:text-blue-600'
                                                        }`}
                                                    >
                                                        {archivoSubido ? (
                                                            <FaCheckCircle
                                                                size={24}
                                                            />
                                                        ) : (
                                                            <FaCloudUploadAlt
                                                                size={24}
                                                            />
                                                        )}
                                                    </div>

                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                        {tipo.nombre}{' '}
                                                        {tipo.obligatorio && (
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        )}
                                                    </h4>

                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                        {formatDescripcionArchivo(
                                                            tipo.descripcion,
                                                        )}
                                                    </p>

                                                    <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                        <span>
                                                            Máx: {tipo.max_size}
                                                            MB
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {tipo.id === 1
                                                                ? 'DOC/DOCX'
                                                                : 'PDF'}
                                                        </span>
                                                    </div>

                                                    {archivoSubido ? (
                                                        <div className="space-y-3">
                                                            <div className="text-sm font-medium text-green-700 dark:text-green-200">
                                                                ✓{' '}
                                                                {
                                                                    archivoSubido
                                                                        .file
                                                                        .name
                                                                }
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    removeFile(
                                                                        tipo.id,
                                                                    )
                                                                }
                                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm underline transition-colors"
                                                            >
                                                                Eliminar archivo
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg">
                                                                <FaUpload
                                                                    size={14}
                                                                />
                                                                <span>
                                                                    Seleccionar
                                                                    archivo
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
                                                            <div className="text-xs text-gray-500 dark:text-gray-300">
                                                                o arrastra el
                                                                archivo aquí
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {/* Progress indicator */}
                                {tiposArchivos.length > 0 && (
                                    <div className="bg-white  dark:bg-gray-700 rounded-xl p-4 mb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Progreso de documentos
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-300">
                                                {archivos.length}/
                                                {
                                                    tiposArchivos.filter(
                                                        (t) => t.obligatorio,
                                                    ).length
                                                }{' '}
                                                obligatorios
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${(archivos.length / tiposArchivos.filter((t) => t.obligatorio).length) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                                    >
                                        <FaArrowLeft size={14} />
                                        <span>Anterior</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setShowConfirmModal(true)
                                        }
                                        disabled={!isFormValid() || submitting}
                                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                                                <span>Finalizar Etapa</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Validation Alert para Step 1 */}
                    {currentStep === 1 && !isStep1Valid() && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-amber-50  dark:bg-amber-900  backdrop-blur-sm border border-amber-200 dark:border-amber-700 rounded-xl p-4"
                        >
                            <div className="flex space-x-3">
                                <FaInfoCircle
                                    className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                                    size={16}
                                />
                                <div className="text-amber-700 dark:text-amber-200 text-sm">
                                    <p className="font-medium mb-2">
                                        Campos requeridos pendientes:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                                        {!selectedSublinea && (
                                            <div>• Línea de investigación</div>
                                        )}
                                        {!selectedAsesor && (
                                            <div>• Asesor principal</div>
                                        )}
                                        {!metadatos.titulo.trim() && (
                                            <div>• Título del proyecto</div>
                                        )}
                                        {!metadatos.abstract.trim() && (
                                            <div>• Resumen</div>
                                        )}
                                        {keywords.length < 3 && (
                                            <div>• Mínimo 3 palabras clave</div>
                                        )}
                                        {metadatos.presupuesto <= 0 && (
                                            <div>• Presupuesto estimado</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Validation Alert para Step 2 */}
                    {currentStep === 2 && !isStep2Valid() && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-orange-50  dark:bg-orange-900  backdrop-blur-sm border border-orange-200 dark:border-orange-700 rounded-xl p-4"
                        >
                            <div className="flex space-x-3">
                                <FaExclamationTriangle
                                    className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5"
                                    size={16}
                                />
                                <div className="text-orange-700 dark:text-orange-200 text-sm">
                                    <p className="font-medium mb-2">
                                        Documentos obligatorios faltantes:
                                    </p>
                                    <div className="space-y-1 text-xs">
                                        {tiposArchivos
                                            .filter(
                                                (t) =>
                                                    t.obligatorio &&
                                                    !archivos.some(
                                                        (a) =>
                                                            a.tipoId === t.id,
                                                    ),
                                            )
                                            .map((tipo) => (
                                                <div key={tipo.id}>
                                                    • {tipo.nombre}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Modal de Confirmación */}
                <AnimatePresence>
                    {showConfirmModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white  dark:bg-gray-800  backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200  dark:border-gray-700 "
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500  rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaCheck
                                            className="text-green-600 dark:text-green-400"
                                            size={24}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        Confirmar Finalización
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                        ¿Estás seguro de finalizar la{' '}
                                        <strong>Etapa 1</strong>? Esta acción no
                                        se puede deshacer y tu proyecto pasará a
                                        revisión de formato.
                                    </p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() =>
                                                setShowConfirmModal(false)
                                            }
                                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setShowConfirmModal(false)
                                                await handleSubmit()
                                            }}
                                            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
        </div>
    )
}

export default Completar
