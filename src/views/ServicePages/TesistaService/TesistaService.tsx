// src/views/ServicePages/TesistaService/TesistaService.tsx - Con animaciones motion
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/auth';
import {
    checkTesistaHasTramite,
    getTramitesByTesista,
    getEtapas,
    createNuevoProyecto,
    getTramitesCanceladosByTesista,
    type TramiteData,
    type CreateProyectoData
} from '@/services/TramiteService';
import type { DicEtapa } from '@/lib/supabase';
import ProyectoConfirmacionModal from '@/components/modals/ProyectoConfirmacionModal';

// Componentes auxiliares
import FAQ from './components/FAQ';
import ProcessStage from './components/ProcessStage';
import InfoCard from './components/InfoCard';
import DownloadableDocument from './components/DownloadableDocument';
import InfoBanner from './components/InfoBanner';

import Container from '@/components/shared/Container';
import {
    FaInfoCircle, FaFileAlt, FaUserGraduate, FaUsers,
    FaCalendarAlt, FaClipboardCheck, FaFileSignature,
    FaChevronDown, FaChevronUp, FaLightbulb, FaQuestion,
    FaDownload, FaBook, FaGraduationCap, FaShieldAlt,
    FaRocket, FaClipboard, FaArrowRight
} from 'react-icons/fa';
import { Badge, Spinner } from '@/components/ui';
import TesisProgress from './components/TesisProgress';

import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import { type TesistaCareerData } from '@/services/TesistaServiceEnhanced' // ✅ AGREGAR ESTA LÍNEA

import CareerSelectorModal from '@/components/shared/CareerSelectorModal/CareerSelectorModal'
import { FaExchangeAlt, FaUniversity, FaIdCard } from 'react-icons/fa'

const TesistaService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [tramites, setTramites] = useState<TramiteData[]>([]);
    const [etapas, setEtapas] = useState<DicEtapa[]>([]);
    const [etapaActual, setEtapaActual] = useState(1);
    // Agregar estos estados en el componente (después de los estados existentes):
    const [hasTramite, setHasTramite] = useState<boolean>(false);
    const [tramiteData, setTramiteData] = useState<TramiteData | null>(null);
    const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
    const [codigoProyectoGenerado, setCodigoProyectoGenerado] = useState<string>('');
    const [creatingProject, setCreatingProject] = useState(false);

    const [showCareerSelector, setShowCareerSelector] = useState(false)
    const {
        activeCareer,
        availableCareers,
        hasMultipleCareers,
        hasCareers,
        changeActiveCareer,
        isLoading: careerLoading,
        activeCareerName,
        activeCareerCode,
        activeFaculty
    } = useActiveTesistaCareer()

    const [tramitesCancelados, setTramitesCancelados] = useState<TramiteData[]>([]);


    // Cargar datos del tesista y sus trámites
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                if (user.id && activeCareer) {
                    // Verificar si el tesista tiene un trámite ACTIVO
                    const tieneTramite = await checkTesistaHasTramite(activeCareer.tesistaId);
                    setHasTramite(tieneTramite);

                    if (tieneTramite) {
                        // Obtener los trámites ACTIVOS del tesista
                        const tramitesData = await getTramitesByTesista(activeCareer.tesistaId);
                        setTramites(tramitesData);

                        // Establecer el trámite actual (el más reciente)
                        if (tramitesData.length > 0) {
                            const tramiteReciente = tramitesData[0];
                            setTramiteData(tramiteReciente);
                            setEtapaActual(tramiteReciente.etapa.id);
                        }
                    } else {
                        // Si no tiene trámites activos, verificar si tiene cancelados
                        const tramitesCanceladosData = await getTramitesCanceladosByTesista(activeCareer.tesistaId);
                        setTramitesCancelados(tramitesCanceladosData);
                    }

                    // Obtener la lista completa de etapas
                    const etapasData = await getEtapas();
                    setEtapas(etapasData);
                }
            } catch (error) {
                console.error('Error al cargar datos del tesista:', error);
            } finally {
                setLoading(false);
            }
        };

        // Solo ejecutar si no está cargando las carreras y existe una carrera activa
        if (!careerLoading && activeCareer) {
            cargarDatos();
        }
    }, [user, activeCareer, careerLoading]);

    // Mensajes específicos según la etapa del trámite
    const mensajesEtapa: Record<number, { titulo: string; descripcion: string; accion?: string }> = {
        1: {
            titulo: "Completa la información de tu proyecto",
            descripcion: "Debes cargar los metadatos, línea de investigación, asesor y documentos requeridos.",
            accion: "Completar Proyecto"
        },
        2: {
            titulo: "Proyecto en revisión de formato",
            descripcion: "El coordinador de investigación está revisando el formato de tu proyecto. Este proceso puede tomar hasta 3 días hábiles."
        },
        3: {
            titulo: "Esperando aprobación del director de tesis",
            descripcion: "Tu asesor está revisando el contenido del proyecto para su aprobación. Este proceso puede tomar hasta 5 días hábiles."
        },
        4: {
            titulo: "Revisión por subdirector de investigación",
            descripcion: "El subdirector de la unidad de investigación está revisando tu proyecto y documentos anexos."
        },
        5: {
            titulo: "Sorteo de jurados en proceso",
            descripcion: "Se está realizando el sorteo de jurados para tu proyecto. Este proceso puede tomar hasta 2 días hábiles."
        },
        6: {
            titulo: "Proyecto en revisión por jurados",
            descripcion: "Los jurados están revisando tu proyecto. Este proceso puede tomar hasta 10 días hábiles."
        },
        7: {
            titulo: "Dictamen en proceso",
            descripcion: "Los jurados están emitiendo su dictamen sobre tu proyecto. Pronto tendrás una respuesta."
        },
        8: {
            titulo: "¡Proyecto aprobado!",
            descripcion: "Tu proyecto ha sido aprobado. Tienes entre 90 días y 2 años para iniciar la etapa de borrador."
        },
        9: {
            titulo: "Etapa de borrador habilitada",
            descripcion: "Puedes iniciar la carga de borrador de tesis. Asegúrate de cumplir con todos los requisitos.",
            accion: "Iniciar Borrador"
        },
        10: {
            titulo: "Carga de borrador de tesis",
            descripcion: "Debes subir tu borrador de tesis para revisión.",
            accion: "Cargar Borrador"
        },
        11: {
            titulo: "Revisión de formato de borrador",
            descripcion: "El coordinador está revisando el formato de tu borrador. Este proceso puede tomar hasta 3 días hábiles."
        },
        12: {
            titulo: "Revisión de borrador por jurados",
            descripcion: "Los jurados están revisando tu borrador de tesis. Este proceso puede tomar hasta 15 días hábiles."
        },
        13: {
            titulo: "Dictamen de borrador en proceso",
            descripcion: "El presidente de jurado está realizando el dictamen de tu borrador."
        },
        14: {
            titulo: "Preparación para sustentación",
            descripcion: "Debes cargar tu tesis final y diapositivas para la sustentación.",
            accion: "Cargar Archivos"
        },
        15: {
            titulo: "Sustentación programada",
            descripcion: "Tu sustentación ha sido programada. Revisa la fecha y hora en tu panel de sustentación."
        },
        16: {
            titulo: "Carga de archivo final",
            descripcion: "Debes cargar la versión final de tu tesis con las observaciones corregidas.",
            accion: "Cargar Final"
        },
        17: {
            titulo: "¡Trámite concluido!",
            descripcion: "¡Felicidades! Has completado exitosamente todo el proceso de tesis."
        }
    };

    // Estadísticas del proceso
    const progressStats = [
        {
            label: "Etapa Actual",
            value: etapas.find(e => e.id === etapaActual)?.nombre || "Carga de proyecto",
            icon: <FaRocket />
        },
        {
            label: "Días en proceso",
            value: tramiteData ? calcularDiasEnProceso(tramiteData.fecha_registro) : "-",
            icon: <FaCalendarAlt />
        },
        {
            label: "Estado",
            value: tramiteData?.estado_tramite === 1 ? "Activo" : tramiteData?.estado_tramite === 0 ? "Inactivo" : "No iniciado",
            icon: <FaClipboardCheck />
        },
        {
            label: "Carrera",
            value: activeCareerName ? activeCareerName.substring(0, 20) + (activeCareerName.length > 20 ? '...' : '') : "Sin seleccionar",
            icon: <FaUniversity />
        }
    ];

    // Calcular días en proceso
    function calcularDiasEnProceso(fechaInicio: string) {
        const inicio = new Date(fechaInicio);
        const hoy = new Date();
        const diferencia = hoy.getTime() - inicio.getTime();
        return Math.floor(diferencia / (1000 * 60 * 60 * 24)) + " días";
    }

    // Definición de las etapas del proceso
    const processStages = [
        {
            step: 1,
            title: "Carga de proyecto",
            description: "Subir metadatos, línea de investigación y documentos",
            completed: etapaActual > 1,
            current: etapaActual === 1
        },
        {
            step: 2,
            title: "Revisión de formato de proyecto",
            description: "Verificación de formato por coordinación",
            completed: etapaActual > 2,
            current: etapaActual === 2
        },
        {
            step: 3,
            title: "Revisión por director de tesis",
            description: "Aprobación del contenido por el asesor",
            completed: etapaActual > 3,
            current: etapaActual === 3
        },
        {
            step: 4,
            title: "Revisión por subdirector",
            description: "Aprobación final de documentos",
            completed: etapaActual > 4,
            current: etapaActual === 4
        },
        {
            step: 5,
            title: "Sorteo de jurados",
            description: "Asignación aleatoria de jurados",
            completed: etapaActual > 5,
            current: etapaActual === 5
        },
        {
            step: 6,
            title: "Revisión de jurados",
            description: "Evaluación del proyecto por los jurados",
            completed: etapaActual > 6,
            current: etapaActual === 6
        },
        {
            step: 7,
            title: "Dictamen de proyecto",
            description: "Emisión de dictamen sobre el proyecto",
            completed: etapaActual > 7,
            current: etapaActual === 7
        },
        {
            step: 8,
            title: "Proyecto aprobado",
            description: "Aprobación oficial del proyecto de tesis",
            completed: etapaActual > 8,
            current: etapaActual === 8
        },
        {
            step: 9,
            title: "Borrador habilitado",
            description: "Habilitación para iniciar borrador",
            completed: etapaActual > 9,
            current: etapaActual === 9
        },
        {
            step: 10,
            title: "Carga de borrador",
            description: "Subir borrador de tesis",
            completed: etapaActual > 10,
            current: etapaActual === 10
        },
        {
            step: 11,
            title: "Revisión formato borrador",
            description: "Verificación de formato del borrador",
            completed: etapaActual > 11,
            current: etapaActual === 11
        },
        {
            step: 12,
            title: "Revisión borrador por jurados",
            description: "Evaluación del borrador por jurados",
            completed: etapaActual > 12,
            current: etapaActual === 12
        },
        {
            step: 13,
            title: "Dictamen de borrador",
            description: "Dictamen final del borrador",
            completed: etapaActual > 13,
            current: etapaActual === 13
        },
        {
            step: 14,
            title: "Archivos para sustentación",
            description: "Cargar tesis final y diapositivas",
            completed: etapaActual > 14,
            current: etapaActual === 14
        },
        {
            step: 15,
            title: "Sustentación",
            description: "Defensa oral de la tesis",
            completed: etapaActual > 15,
            current: etapaActual === 15
        },
        {
            step: 16,
            title: "Archivo final",
            description: "Cargar versión final corregida",
            completed: etapaActual > 16,
            current: etapaActual === 16
        },
        {
            step: 17,
            title: "Trámite concluido",
            description: "Proceso de tesis finalizado",
            completed: etapaActual >= 17,
            current: etapaActual === 17
        }
    ];

    // Documentos descargables
    const documents = [
        {
            title: "Plantilla de proyecto de tesis",
            description: "Formato oficial para la presentación del proyecto de tesis",
            icon: <FaFileAlt size={20} />,
            iconBgClass: "bg-blue-100 dark:bg-blue-900/40",
            iconTextClass: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Guía para la redacción de tesis",
            description: "Manual con pautas y recomendaciones para la redacción",
            icon: <FaBook size={20} />,
            iconBgClass: "bg-green-100 dark:bg-green-900/40",
            iconTextClass: "text-green-600 dark:text-green-400"
        },
        {
            title: "Plantilla de borrador de tesis",
            description: "Formato oficial para la presentación del borrador",
            icon: <FaFileAlt size={20} />,
            iconBgClass: "bg-purple-100 dark:bg-purple-900/40",
            iconTextClass: "text-purple-600 dark:text-purple-400"
        },
        {
            title: "Reglamento de grados y títulos",
            description: "Normativa vigente para el proceso de titulación",
            icon: <FaGraduationCap size={20} />,
            iconBgClass: "bg-red-100 dark:bg-red-900/40",
            iconTextClass: "text-red-600 dark:text-red-400"
        },
        {
            title: "Plantilla de presentación",
            description: "Formato para diapositivas de sustentación",
            icon: <FaFileSignature size={20} />,
            iconBgClass: "bg-yellow-100 dark:bg-yellow-900/40",
            iconTextClass: "text-yellow-600 dark:text-yellow-400"
        },
        {
            title: "Guía de citación APA",
            description: "Manual de citación según normas APA 7ma edición",
            icon: <FaClipboard size={20} />,
            iconBgClass: "bg-indigo-100 dark:bg-indigo-900/40",
            iconTextClass: "text-indigo-600 dark:text-indigo-400"
        }
    ];

    if (loading || careerLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-screen"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Spinner size={40} />
                </motion.div>
            </motion.div>
        );
    }
    const handleCareerChange = (careerData: any) => {
        setShowCareerSelector(false)

        // ✅ Buscar la carrera real desde availableCareers para obtener el ID correcto
        const realCareer = availableCareers.find(career =>
            career.tesistaId === careerData.tesistaId &&
            career.codigo_estudiante === careerData.codigo_estudiante
        )

        if (realCareer) {
            // ✅ Usar los datos reales con IDs correctos
            changeActiveCareer(realCareer)
            console.log('🔄 Carrera cambiada a:', realCareer.estructuraAcademica.carrera.nombre)
        } else {
            console.error('❌ No se encontró la carrera real en availableCareers')
        }
    }

    const handleEmpezarProyecto = async () => {
        if (!activeCareer || !user.id) {
            console.error('Datos insuficientes para crear proyecto');
            return;
        }

        try {
            setCreatingProject(true);

            const createData: CreateProyectoData = {
                tesistaId: activeCareer.tesistaId,
                usuarioId: user.id,
                codigoEstudiante: activeCareer.codigo_estudiante,
                carreraId: activeCareer.estructuraAcademica.carrera.id,
                especialidadId: activeCareer.estructuraAcademica.especialidad.id
            };

            const result = await createNuevoProyecto(createData);

            if (result.success) {
                setCodigoProyectoGenerado(result.codigoProyecto);
                setShowConfirmacionModal(true);

                // ✅ ELIMINAR el setTimeout con window.location.reload()
                // El refresh se hará cuando el usuario haga clic en "Continuar"
            }
        } catch (error) {
            console.error('Error al crear proyecto:', error);
            // Aquí podrías agregar un toast de error
        } finally {
            setCreatingProject(false);
        }
    };

    const refrescarDatosTramite = async () => {
        if (!user.id || !activeCareer) return;

        try {
            // Verificar si ahora tiene trámite activo
            const tieneTramite = await checkTesistaHasTramite(activeCareer.tesistaId);
            setHasTramite(tieneTramite);

            if (tieneTramite) {
                // Obtener los trámites activos actualizados
                const tramitesData = await getTramitesByTesista(activeCareer.tesistaId);
                setTramites(tramitesData);

                // Establecer el trámite actual
                if (tramitesData.length > 0) {
                    const tramiteReciente = tramitesData[0];
                    setTramiteData(tramiteReciente);
                    setEtapaActual(tramiteReciente.etapa.id);
                }

                // Limpiar trámites cancelados si ahora tiene activos
                setTramitesCancelados([]);
            } else {
                // Si no tiene activos, cargar cancelados
                const tramitesCanceladosData = await getTramitesCanceladosByTesista(activeCareer.tesistaId);
                setTramitesCancelados(tramitesCanceladosData);

                // Limpiar datos de trámites activos
                setTramiteData(null);
                setTramites([]);
                setEtapaActual(1);
            }
        } catch (error) {
            console.error('Error al refrescar datos:', error);
        }
    };

    // Función para manejar acciones según la etapa
    const handleEtapaAction = (etapa: number) => {
        switch (etapa) {
            case 1:
                // Navegar a la página de completar proyecto
                navigate('/pilar/pregrado/estudiantes/etapa1/completar');
                break;
            case 9:
                // Navegar a iniciar borrador
                navigate('/pilar/pregrado/estudiantes/borrador/iniciar');
                break;
            case 10:
                // Navegar a cargar borrador
                navigate('/pilar/pregrado/estudiantes/borrador/cargar');
                break;
            case 14:
                // Navegar a cargar archivos de sustentación
                navigate('/pilar/pregrado/estudiantes/sustentacion/archivos');
                break;
            case 16:
                // Navegar a cargar archivo final
                navigate('/pilar/pregrado/estudiantes/final/cargar');
                break;
            default:
                console.log('No hay acción disponible para esta etapa');
        }
    };

    // Adaptador para convertir TramiteData al formato esperado por TesisProgress
    const adaptTramiteForProgress = (tramite: TramiteData | null) => {
        if (!tramite) return null;

        return {
            id: tramite.id,
            codigo_proyecto: tramite.codigo_proyecto,
            estado_tramite: tramite.estado_tramite,
            fecha_registro: tramite.fecha_registro,
            id_antiguo: null, // Siempre null según tu especificación
            id_denominacion: tramite.denominacion.id,
            id_etapa: tramite.etapa.id,
            id_modalidad: tramite.modalidad.id,
            id_sublinea_vri: null, // Puede ser null según tu base de datos
            id_tipo_trabajo: tramite.tipo_trabajo.id
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Columna izquierda - Steps Verticales */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <TesisProgress
                            etapaActual={etapaActual}
                            tramiteActual={adaptTramiteForProgress(tramiteData)}
                            estadosTramite={etapas}
                        />
                    </motion.div>

                    {/* Columna derecha - Contenido principal */}
                    <div className="lg:col-span-3">
                        {/* Primera fila: Todo en un solo card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mb-6"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
                                {/* Encabezado y badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-4 border-b border-gray-200 dark:border-gray-700"
                                >
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Portal Estudiante - PILAR
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Bienvenido al Sistema de Investigación y Tesis
                                        </p>
                                    </div>

                                    {/* Indicador de Carrera Activa */}
                                    {hasCareers && activeCareer && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="mt-4 md:mt-0"
                                        >
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                                        <FaUniversity size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                                                                Carrera Activa
                                                            </h3>
                                                            {hasMultipleCareers && (
                                                                <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                                    {availableCareers?.length || 0} carreras
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-blue-800 dark:text-blue-200 text-sm font-medium truncate">
                                                            {activeCareerName || 'Sin carrera seleccionada'}
                                                        </p>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            {activeFaculty && (
                                                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                    {activeFaculty}
                                                                </span>
                                                            )}
                                                            {activeCareerCode && (
                                                                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                                                                    <FaIdCard size={10} />
                                                                    <span>{activeCareerCode}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {hasMultipleCareers && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setShowCareerSelector(true)}
                                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                            title="Cambiar carrera"
                                                        >
                                                            <FaExchangeAlt size={14} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Información importante */}
                                {(!hasTramite || (tramiteData && mensajesEtapa[etapaActual])) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        {!hasTramite ? (
                                            // Sin trámite activo - Mostrar botón para empezar proyecto
                                            <div className="space-y-4">
                                                {/* Información de trámites cancelados (si existen) */}
                                                {tramitesCancelados.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <FaInfoCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                                                            <div>
                                                                <h4 className="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-1">
                                                                    Proyectos anteriores
                                                                </h4>
                                                                <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                                                                    Tienes {tramitesCancelados.length} proyecto{tramitesCancelados.length > 1 ? 's' : ''} anterior{tramitesCancelados.length > 1 ? 'es' : ''} que {tramitesCancelados.length > 1 ? 'fueron cancelados' : 'fue cancelado'}:
                                                                </p>
                                                                <div className="space-y-1">
                                                                    {tramitesCancelados.slice(0, 3).map((tramite, index) => (
                                                                        <div key={index} className="flex items-center space-x-2 text-xs">
                                                                            <span className="font-mono bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                                                                                {tramite.codigo_proyecto}
                                                                            </span>
                                                                            <span className="text-amber-600 dark:text-amber-400">
                                                                                {new Date(tramite.fecha_registro).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    {tramitesCancelados.length > 3 && (
                                                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                                                            y {tramitesCancelados.length - 3} más...
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Botón para empezar nuevo proyecto */}
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                                                            <FaRocket size={24} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-2">
                                                                {tramitesCancelados.length > 0 ? '¡Inicia un nuevo proyecto de tesis!' : '¡Comienza tu proyecto de tesis!'}
                                                            </h3>
                                                            <p className="text-blue-800 dark:text-blue-200 mb-4">
                                                                {tramitesCancelados.length > 0
                                                                    ? 'Puedes iniciar un nuevo proyecto de tesis. Se generará automáticamente un código único actualizado para tu nuevo proyecto.'
                                                                    : 'Estás listo para iniciar tu proyecto de tesis. Se generará automáticamente un código único para tu proyecto y podrás comenzar con la carga de información.'
                                                                }
                                                            </p>
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={handleEmpezarProyecto}
                                                                disabled={creatingProject}
                                                                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                                            >
                                                                {creatingProject ? (
                                                                    <>
                                                                        <Spinner size={16} />
                                                                        <span>Generando proyecto...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaRocket size={16} />
                                                                        <span>{tramitesCancelados.length > 0 ? 'Iniciar Nuevo Proyecto' : 'Empezar Proyecto'}</span>
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Con trámite - Mostrar información de la etapa actual
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                                <div className="flex items-start space-x-4">
                                                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                                                        <FaInfoCircle size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                                                                {mensajesEtapa[etapaActual]?.titulo}
                                                            </h3>
                                                            {tramiteData && (
                                                                <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                                                                    {tramiteData.codigo_proyecto}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-green-800 dark:text-green-200 mb-4">
                                                            {mensajesEtapa[etapaActual]?.descripcion}
                                                        </p>
                                                        {mensajesEtapa[etapaActual]?.accion && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => handleEtapaAction(etapaActual)}
                                                                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                                            >
                                                                <FaArrowRight size={16} />
                                                                <span>{mensajesEtapa[etapaActual].accion}</span>
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Estadísticas */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Estadísticas del Proceso</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {progressStats.map((stat, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + index * 0.1 }}
                                                whileHover={{ y: -2 }}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                        {stat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Segunda fila: Solo tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="grid grid-cols-1 gap-6"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
                                <div className="tabs">
                                    <div role="tablist" className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                                        {[
                                            { id: 'overview', label: 'Vista general' },
                                            { id: 'process', label: 'Proceso detallado' },
                                            { id: 'faq', label: 'Preguntas frecuentes' },
                                            { id: 'documents', label: 'Documentos' }
                                        ].map((tab, index) => (
                                            <motion.button
                                                key={tab.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`py-2 px-4 font-medium text-sm focus:outline-none transition-colors ${activeTab === tab.id
                                                    ? 'text-primary border-b-2 border-primary'
                                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                    }`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                {tab.label}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {/* Vista general */}
                                        {activeTab === 'overview' && (
                                            <motion.div
                                                key="overview"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="tab-content"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[
                                                        {
                                                            icon: <FaFileAlt size={20} />,
                                                            title: "Mi proyecto actual",
                                                            description: "Ver detalles de tu proyecto de tesis, estado actual y próximos pasos.",
                                                            iconBgClass: "bg-gray-100 dark:bg-gray-700",
                                                            iconTextClass: "text-primary dark:text-primary",
                                                            onClick: () => navigate('/pilar/pregrado/estudiantes/etapa1/resumen')
                                                        },
                                                        {
                                                            icon: <FaUsers size={20} />,
                                                            title: "Mis jurados",
                                                            description: "Información de contacto y perfil de tus jurados asignados.",
                                                            iconBgClass: "bg-indigo-100 dark:bg-indigo-900/40",
                                                            iconTextClass: "text-indigo-600 dark:text-indigo-400",
                                                            onClick: () => etapaActual >= 4 ? navigate('/pilar/pregrado/estudiantes/jurados') : null,
                                                            className: etapaActual >= 4 ? '' : 'opacity-60 cursor-not-allowed'
                                                        },
                                                        {
                                                            icon: <FaFileSignature size={20} />,
                                                            title: "Formatos y plantillas",
                                                            description: "Descarga formatos oficiales para cada etapa del proceso.",
                                                            iconBgClass: "bg-green-100 dark:bg-green-900/40",
                                                            iconTextClass: "text-green-600 dark:text-green-400",
                                                            onClick: () => setActiveTab('documents')
                                                        },
                                                        {
                                                            icon: <FaCalendarAlt size={20} />,
                                                            title: "Calendario académico",
                                                            description: "Fechas importantes del semestre para investigación y tesis.",
                                                            iconBgClass: "bg-orange-100 dark:bg-orange-900/40",
                                                            iconTextClass: "text-orange-600 dark:text-orange-400"
                                                        },
                                                        {
                                                            icon: <FaUserGraduate size={20} />,
                                                            title: "Asesorías virtuales",
                                                            description: "Solicita o consulta tus asesorías programadas.",
                                                            iconBgClass: "bg-purple-100 dark:bg-purple-900/40",
                                                            iconTextClass: "text-purple-600 dark:text-purple-400"
                                                        },
                                                        {
                                                            icon: <FaQuestion size={20} />,
                                                            title: "Centro de ayuda",
                                                            description: "Resuelve dudas comunes sobre el proceso de tesis.",
                                                            iconBgClass: "bg-gray-100 dark:bg-gray-700",
                                                            iconTextClass: "text-warning dark:text-warning",
                                                            onClick: () => setActiveTab('faq')
                                                        }
                                                    ].map((card, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{ y: -4 }}
                                                        >
                                                            <InfoCard
                                                                icon={card.icon}
                                                                title={card.title}
                                                                description={card.description}
                                                                iconBgClass={card.iconBgClass}
                                                                iconTextClass={card.iconTextClass}
                                                                onClick={card.onClick}
                                                                className={card.className}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Proceso detallado */}
                                        {activeTab === 'process' && (
                                            <motion.div
                                                key="process"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="tab-content"
                                            >
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                                            Proceso completo de tesis
                                                        </h3>
                                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                                            Aquí encontrarás el detalle de cada etapa del proceso de investigación y tesis.
                                                            Actualmente te encuentras en la <strong>Etapa {etapaActual}</strong>. Las etapas
                                                            marcadas en verde ya han sido completadas.
                                                        </p>

                                                        <div className="space-y-2">
                                                            {processStages.map((stage, index) => (
                                                                <motion.div
                                                                    key={stage.step}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: index * 0.1 }}
                                                                >
                                                                    <ProcessStage
                                                                        step={stage.step}
                                                                        title={stage.title}
                                                                        description={stage.description}
                                                                        isActive={stage.current}
                                                                        isCompleted={stage.completed}
                                                                        tips={[]}
                                                                    />
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                                                    >
                                                        <div className="flex space-x-3">
                                                            <FaLightbulb className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                                                            <div>
                                                                <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                                                                    Consideración importante
                                                                </h3>
                                                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                                    Recuerda que desde la fecha de emisión del acta de aprobación de proyecto,
                                                                    tienes un plazo mínimo de 90 días y un máximo de 2 años para iniciar el
                                                                    proceso de Borrador de tesis.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Preguntas frecuentes */}
                                        {activeTab === 'faq' && (
                                            <motion.div
                                                key="faq"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="tab-content"
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                                        Preguntas frecuentes
                                                    </h3>
                                                    <FAQ />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Documentos */}
                                        {activeTab === 'documents' && (
                                            <motion.div
                                                key="documents"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="tab-content"
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                                        Documentos y formatos
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {documents.map((doc, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                            >
                                                                <DownloadableDocument
                                                                    title={doc.title}
                                                                    description={doc.description}
                                                                    icon={doc.icon}
                                                                    iconBgClass={doc.iconBgClass}
                                                                    iconTextClass={doc.iconTextClass}
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Modal Selector de Carrera */}
                <CareerSelectorModal
                    isOpen={showCareerSelector}
                    onClose={() => setShowCareerSelector(false)}
                    careers={availableCareers.map(career => ({
                        id: career.id,
                        tesistaId: career.tesistaId,
                        codigo_estudiante: career.codigo_estudiante,
                        carrera: {
                            id: career.estructuraAcademica.carrera.id,
                            // ✅ CAMBIAR ESTA LÍNEA:
                            nombre: `${career.estructuraAcademica.carrera.nombre}${career.estructuraAcademica.especialidad?.nombre &&
                                career.estructuraAcademica.especialidad.id !== 1
                                ? ` - ${career.estructuraAcademica.especialidad.nombre}`
                                : ''
                                }${career.estructuraAcademica.sede?.nombre ? ` (${career.estructuraAcademica.sede.nombre})` : ''}`,
                            facultad: career.estructuraAcademica.facultad ? {
                                nombre: career.estructuraAcademica.facultad.nombre,
                                abreviatura: career.estructuraAcademica.facultad.abreviatura
                            } : undefined
                        }
                    }))}
                    onSelectCareer={handleCareerChange}
                />
                {/* Modal de Confirmación de Proyecto Creado */}
                <ProyectoConfirmacionModal
                    isOpen={showConfirmacionModal}
                    onClose={() => {
                        setShowConfirmacionModal(false);
                        // Refrescar datos cuando se cierra el modal
                        refrescarDatosTramite();
                    }}
                    codigoProyecto={codigoProyectoGenerado}
                    onContinuar={() => {
                        // Refrescar datos antes de navegar
                        refrescarDatosTramite();
                        // Opcional: navegar a la página de completar proyecto
                        navigate('/pilar/pregrado/estudiantes/etapa1/completar');
                    }}
                />
            </Container>
        </motion.div>
    );
};

export default TesistaService;