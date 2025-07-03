// src/views/ServicePages/TesistaService/TesistaService.tsx - Con animaciones motion
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/auth';
import {
    obtenerTramitesPorTesista,
    obtenerTramitePorId,
    obtenerEtapas
} from '@/services/TramiteService';
import type { TblTramite, TblTesista, DicEtapa } from '@/lib/supabase';

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
    const [tesista, setTesista] = useState<TblTesista | null>(null);
    const [tramiteActual, setTramiteActual] = useState<TblTramite | null>(null);
    const [tramites, setTramites] = useState<TblTramite[]>([]);
    const [etapas, setEtapas] = useState<DicEtapa[]>([]);
    const [etapaActual, setEtapaActual] = useState(1);


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

    // Cargar datos del tesista y sus trámites
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                if (user.id && activeCareer) {
                    // ✅ Transformar TesistaCareerData al formato que espera setTesista
                    const tesistaData = {
                        id: activeCareer.tesistaId,
                        codigo_estudiante: activeCareer.codigo_estudiante,
                        id_estructura_academica: activeCareer.estructuraAcademica.id,
                        id_usuario: user.id,
                        estado: 1
                    };

                    setTesista(tesistaData);

                    // Obtener todos los trámites del tesista usando el tesistaId de la carrera activa
                    const tramitesData = await obtenerTramitesPorTesista(activeCareer.tesistaId);
                    setTramites(tramitesData);

                    // Obtener la lista completa de etapas
                    const etapasData = await obtenerEtapas();
                    setEtapas(etapasData);

                    // Establecer el trámite actual (el más reciente)
                    if (tramitesData.length > 0) {
                        const tramiteReciente = tramitesData[0]; // Ya está ordenado por fecha descendente
                        setTramiteActual(tramiteReciente);

                        // Encontrar la etapa actual basada en la etapa del trámite
                        const etapaActualId = tramiteReciente.id_etapa || 1;
                        setEtapaActual(etapaActualId);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del tesista:', error);
            } finally {
                setLoading(false);
            }
        };

        // ✅ Solo ejecutar si no está cargando las carreras y existe una carrera activa
        if (!careerLoading && activeCareer) {
            cargarDatos();
        }
    }, [user, activeCareer, careerLoading]);

    // Mensajes específicos según la etapa del trámite
    const mensajesEtapa: Record<number, { titulo: string; descripcion: string }> = {
        1: {
            titulo: "Carga de proyecto pendiente",
            descripcion: "Debes subir tu proyecto de tesis para iniciar el proceso."
        },
        2: {
            titulo: "Proyecto en revisión de formato",
            descripcion: "El coordinador está revisando el formato de tu proyecto. Este proceso puede tomar hasta 3 días hábiles."
        },
        3: {
            titulo: "Esperando aprobación del director",
            descripcion: "Tu proyecto está siendo revisado por el director de tesis. Este proceso puede tomar hasta 5 días hábiles."
        },
        4: {
            titulo: "Sorteo de jurados en proceso",
            descripcion: "Se está realizando el sorteo de jurados para tu proyecto. Este proceso puede tomar hasta 2 días hábiles."
        },
        5: {
            titulo: "Proyecto en revisión por jurados",
            descripcion: "Los jurados están revisando tu proyecto. Este proceso puede tomar hasta 10 días hábiles."
        },
        6: {
            titulo: "Dictamen en proceso",
            descripcion: "Los jurados están emitiendo su dictamen sobre tu proyecto. Pronto tendrás una respuesta."
        },
        7: {
            titulo: "¡Proyecto aprobado!",
            descripcion: "Tu proyecto ha sido aprobado. Ahora puedes continuar con el desarrollo de tu tesis."
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
            value: tramiteActual ? calcularDiasEnProceso(tramiteActual.fecha_registro) : "-",
            icon: <FaCalendarAlt />
        },
        {
            label: "Estado",
            value: tramiteActual?.estado_tramite === 1 ? "Activo" : tramiteActual?.estado_tramite === 0 ? "Inactivo" : "No iniciado",
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
            description: "Subir el proyecto de tesis para revisión",
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
            title: "Aprobación del director",
            description: "Revisión por el director de tesis",
            completed: etapaActual > 3,
            current: etapaActual === 3
        },
        {
            step: 4,
            title: "Sorteo de jurados",
            description: "Asignación aleatoria de jurados",
            completed: etapaActual > 4,
            current: etapaActual === 4
        },
        {
            step: 5,
            title: "Revisión de jurados",
            description: "Evaluación del proyecto por los jurados",
            completed: etapaActual > 5,
            current: etapaActual === 5
        },
        {
            step: 6,
            title: "Dictamen",
            description: "Emisión de dictamen sobre el proyecto",
            completed: etapaActual > 6,
            current: etapaActual === 6
        },
        {
            step: 7,
            title: "Proyecto aprobado",
            description: "Aprobación oficial del proyecto de tesis",
            completed: etapaActual >= 7,
            current: etapaActual === 7
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
                            tramiteActual={tramiteActual}
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
                                {tramiteActual && mensajesEtapa[etapaActual] && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <InfoBanner
                                            title={mensajesEtapa[etapaActual].titulo}
                                            description={mensajesEtapa[etapaActual].descripcion}
                                            actionText={etapaActual <= 2 ? "Cargar Proyecto" : ""}
                                            actionUrl=""
                                        />
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
            </Container>
        </motion.div>
    );
};

export default TesistaService;