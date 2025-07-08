// src/views/Pilar/Pregrado/Estudiantes/Etapa1/TipoProyecto.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/auth'
import {
    getTramitesByTesista,
    agregarCompaneroProyecto,
    registrarProyectoIndividual,
    type TramiteData,
    type CompaneroValidado
} from '@/services/TramiteService'
import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import ValidarCompaneroModal from '@/components/modals/ValidarCompaneroModal'
import Container from '@/components/shared/Container'
import {
    FaUser,
    FaUsers,
    FaArrowRight,
    FaRocket,
    FaCheck,
    FaSpinner,
    FaInfoCircle
} from 'react-icons/fa'
import { Spinner } from '@/components/ui'

const TipoProyecto = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const {
        activeCareer,
        isLoading: careerLoading,
        activeCareerName
    } = useActiveTesistaCareer()

    const [loading, setLoading] = useState(true)
    const [tramiteActual, setTramiteActual] = useState<TramiteData | null>(null)
    const [tipoSeleccionado, setTipoSeleccionado] = useState<'individual' | 'grupal' | null>(null)
    const [showCompaneroModal, setShowCompaneroModal] = useState(false)
    const [procesando, setProcesando] = useState(false)
    const [companeroAgregado, setCompaneroAgregado] = useState<CompaneroValidado | null>(null)

    const [proyectoIndividualRegistrado, setProyectoIndividualRegistrado] = useState(false)


    // Cargar datos del trámite actual
    useEffect(() => {
        const cargarTramite = async () => {
            if (!activeCareer || !user.id) return

            try {
                setLoading(true)
                const tramites = await getTramitesByTesista(activeCareer.tesistaId)

                if (tramites.length > 0) {
                    setTramiteActual(tramites[0]) // El más reciente
                } else {
                    // Si no tiene trámite, redirigir al panel principal
                    navigate('/servicio/tesista')
                    return
                }
            } catch (error) {
                console.error('Error cargando trámite:', error)
                navigate('/servicio/tesista')
            } finally {
                setLoading(false)
            }
        }

        if (!careerLoading && activeCareer) {
            cargarTramite()
        }
    }, [activeCareer, careerLoading, user.id, navigate])

    const handleTipoSeleccion = async (tipo: 'individual' | 'grupal') => {
        setTipoSeleccionado(tipo)

        if (tipo === 'grupal') {
            setShowCompaneroModal(true)
            setProyectoIndividualRegistrado(false) // Reset estado individual
        } else if (tipo === 'individual') {
            setCompaneroAgregado(null) // Reset estado grupal

            // Registrar proyecto como individual
            if (tramiteActual && user.id) {
                try {
                    setProcesando(true)
                    await registrarProyectoIndividual(tramiteActual.id, user.id)
                    setProyectoIndividualRegistrado(true)
                    console.log('✅ Proyecto registrado como individual')
                } catch (error) {
                    console.error('Error registrando proyecto individual:', error)
                    setTipoSeleccionado(null) // Reset en caso de error
                } finally {
                    setProcesando(false)
                }
            }
        }
    }

    const handleCompaneroValidado = async (companeroData: CompaneroValidado) => {
        if (!tramiteActual || !user.id) return

        try {
            setProcesando(true)

            await agregarCompaneroProyecto(
                tramiteActual.id,
                companeroData.tesistaId,
                user.id
            )

            setCompaneroAgregado(companeroData)
            // ✅ AGREGAR: Asegurarse de que el tipo sigue siendo 'grupal'
            setTipoSeleccionado('grupal')

            console.log('✅ Compañero agregado exitosamente al proyecto')

        } catch (error) {
            console.error('Error agregando compañero:', error)
            // En caso de error, resetear estados
            setTipoSeleccionado(null)
            setCompaneroAgregado(null)
            // Aquí podrías agregar un toast de error
        } finally {
            setProcesando(false)
        }
    }

    const handleContinuar = () => {
        navigate('/pilar/pregrado/estudiantes/etapa1/completar')
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
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Debes tener un proyecto de tesis creado para continuar.
                    </p>
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
                            Tipo de Proyecto de Tesis
                        </h1>
                        <p className="text-gray-300 dark:text-gray-400 text-lg">
                            Selecciona si desarrollarás tu proyecto de forma individual o en grupo
                        </p>
                    </motion.div>

                    {/* Project Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <FaRocket className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Proyecto: {tramiteActual.codigo_proyecto}
                                </h3>
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    {activeCareerName} • {new Date(tramiteActual.fecha_registro).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Options */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Individual */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -4 }}
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${tipoSeleccionado === 'individual'
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => handleTipoSeleccion('individual')}
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${tipoSeleccionado === 'individual'
                                    ? 'bg-green-100 dark:bg-green-900/40'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    {tipoSeleccionado === 'individual' ? (
                                        <FaCheck className="text-green-600 dark:text-green-400" size={24} />
                                    ) : (
                                        <FaUser className="text-gray-600 dark:text-gray-400" size={24} />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Proyecto Individual
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Desarrolla tu proyecto de tesis de forma independiente
                                </p>

                                <div className="text-left space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>Control total del proyecto</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>Flexibilidad de horarios</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>Responsabilidad individual</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Grupal */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -4 }}
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${tipoSeleccionado === 'grupal'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => handleTipoSeleccion('grupal')}
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${tipoSeleccionado === 'grupal'
                                    ? 'bg-purple-100 dark:bg-purple-900/40'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    {tipoSeleccionado === 'grupal' ? (
                                        <FaCheck className="text-purple-600 dark:text-purple-400" size={24} />
                                    ) : (
                                        <FaUsers className="text-gray-600 dark:text-gray-400" size={24} />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Proyecto Grupal
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Desarrolla tu proyecto junto con un compañero (máximo 2 personas)
                                </p>

                                <div className="text-left space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>Trabajo colaborativo</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>División de tareas</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FaCheck size={12} className="text-green-500" />
                                        <span>Múltiples perspectivas</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Confirmación de tipo seleccionado */}
                    {(companeroAgregado || proyectoIndividualRegistrado) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-xl p-6 mb-8 ${companeroAgregado
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <FaCheck className={`${companeroAgregado
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                    }`} size={20} />
                                <div>
                                    <h4 className={`font-semibold ${companeroAgregado
                                        ? 'text-green-900 dark:text-green-100'
                                        : 'text-blue-900 dark:text-blue-100'
                                        }`}>
                                        {companeroAgregado
                                            ? 'Compañero agregado exitosamente'
                                            : 'Proyecto registrado como individual'
                                        }
                                    </h4>
                                    <p className={`text-sm ${companeroAgregado
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-blue-700 dark:text-blue-300'
                                        }`}>
                                        {companeroAgregado
                                            ? `${companeroAgregado.nombres} ${companeroAgregado.apellidos} • Código: ${companeroAgregado.codigoEstudiante}`
                                            : 'Desarrollarás tu proyecto de tesis de forma independiente'
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Info Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8"
                    >
                        <div className="flex space-x-3">
                            <FaInfoCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-amber-700 dark:text-amber-300 text-sm">
                                <p className="font-medium mb-1">Importante:</p>
                                <p>
                                    Una vez seleccionado el tipo de proyecto, no podrás modificarlo posteriormente.
                                    Si eliges proyecto grupal, tu compañero debe estar registrado en el sistema y
                                    cumplir con todos los requisitos académicos.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-between items-center"
                    >
                        <button
                            onClick={() => navigate('/servicio/tesista')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                        >
                            ← Volver al Panel
                        </button>

                        <button
                            onClick={handleContinuar}
                            disabled={
                                !tipoSeleccionado ||
                                procesando ||
                                (tipoSeleccionado === 'grupal' && !companeroAgregado) ||
                                (tipoSeleccionado === 'individual' && !proyectoIndividualRegistrado)
                            }
                            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {procesando ? (
                                <>
                                    <FaSpinner className="animate-spin" size={16} />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continuar</span>
                                    <FaArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </motion.div>
                </div>

                {/* Modal Validar Compañero */}
                <ValidarCompaneroModal
                    isOpen={showCompaneroModal}
                    onClose={() => {
                        setShowCompaneroModal(false)
                        setTipoSeleccionado(null) // Reset tipo seleccionado si cancela
                        setProyectoIndividualRegistrado(false) // Reset estado individual
                    }}
                    onSuccess={handleCompaneroValidado}
                    idEstructuraAcademica={activeCareer?.estructuraAcademica.id || 0}
                />
            </Container>
        </motion.div>
    )
}

export default TipoProyecto