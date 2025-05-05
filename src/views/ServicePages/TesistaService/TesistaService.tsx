// src/views/ServicePages/TesistaService/TesistaService.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import {
    obtenerTramitesPorTesista,
    obtenerTramitePorId,
    obtenerEstadosTramite
} from '@/services/TramiteService';
import { obtenerTesistaPorUsuario } from '@/services/TesistaService';
import { Tramite, Tesista, DicEstadoTramite } from '@/lib/supabase';

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
import { Steps, Button, Badge, Tabs, Spinner } from '@/components/ui';

const TesistaService = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [tesista, setTesista] = useState<Tesista | null>(null);
    const [tramiteActual, setTramiteActual] = useState<Tramite | null>(null);
    const [tramites, setTramites] = useState<Tramite[]>([]);
    const [estadosTramite, setEstadosTramite] = useState<DicEstadoTramite[]>([]);
    const [etapaActual, setEtapaActual] = useState(1);

    // Cargar datos del tesista y sus trámites
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                if (user.id) {
                    // Obtener información del tesista
                    const tesistaData = await obtenerTesistaPorUsuario(user.id);
                    setTesista(tesistaData);

                    // Obtener todos los trámites del tesista
                    const tramitesData = await obtenerTramitesPorTesista(tesistaData.id);
                    setTramites(tramitesData);

                    // Obtener la lista completa de estados de trámite
                    const estadosData = await obtenerEstadosTramite();
                    setEstadosTramite(estadosData);

                    // Establecer el trámite actual (el más reciente)
                    if (tramitesData.length > 0) {
                        const tramiteReciente = tramitesData[0]; // Ya está ordenado por fecha descendente
                        setTramiteActual(tramiteReciente);

                        // Encontrar la etapa actual basada en el estado del trámite
                        const estadoActual = tramiteReciente.estado?.id || 1;
                        setEtapaActual(estadoActual);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del tesista:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [user]);

    // Mensajes específicos según el estado del trámite
    const mensajesEstado = {
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
        },
        8: {
            titulo: "Etapa de borrador habilitada",
            descripcion: "Puedes comenzar a subir tu borrador de tesis cuando lo tengas listo."
        },
        9: {
            titulo: "Carga de borrador pendiente",
            descripcion: "Debes subir tu borrador de tesis para continuar con el proceso."
        },
        10: {
            titulo: "Borrador en revisión de formato",
            descripcion: "El coordinador está revisando el formato de tu borrador. Este proceso puede tomar hasta 3 días hábiles."
        },
        11: {
            titulo: "Borrador en revisión por jurados",
            descripcion: "Los jurados están revisando tu borrador de tesis. Este proceso puede tomar hasta 15 días hábiles."
        },
        12: {
            titulo: "Dictamen de borrador en proceso",
            descripcion: "El presidente del jurado está emitiendo el dictamen sobre tu borrador de tesis."
        },
        13: {
            titulo: "¡Programar sustentación!",
            descripcion: "Tu borrador ha sido aprobado. Debes coordinar la fecha de sustentación."
        },
        14: {
            titulo: "Carga de archivo final pendiente",
            descripcion: "Debes subir la versión final de tu tesis incorporando las observaciones de la sustentación."
        },
        15: {
            titulo: "¡Trámite concluido!",
            descripcion: "¡Felicidades! Has completado exitosamente todo el proceso de tesis."
        }
    };

    // Estadísticas del proceso
    const progressStats = [
        {
            label: "Etapa Actual",
            value: estadosTramite.find(e => e.id === etapaActual)?.nombre || "Carga de proyecto",
            icon: <FaRocket />
        },
        {
            label: "Días en proceso",
            value: tramiteActual ? calcularDiasEnProceso(tramiteActual.fecharegistro) : "-",
            icon: <FaCalendarAlt />
        },
        {
            label: "Estado",
            value: tramiteActual?.estado?.estado === 1 ? "Activo" : tramiteActual?.estado?.estado || "Pendiente",
            icon: <FaClipboardCheck />
        },
        {
            label: "Código",
            value: tramiteActual?.codigo || "Sin asignar",
            icon: <FaShieldAlt />
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
            completed: etapaActual > 7,
            current: etapaActual === 7
        },
        {
            step: 8,
            title: "Borrador habilitado",
            description: "Habilitación para carga de borrador",
            completed: etapaActual > 8,
            current: etapaActual === 8
        },
        {
            step: 9,
            title: "Carga de borrador",
            description: "Subir el borrador de tesis",
            completed: etapaActual > 9,
            current: etapaActual === 9
        },
        {
            step: 10,
            title: "Revisión de formato de borrador",
            description: "Verificación de formato del borrador",
            completed: etapaActual > 10,
            current: etapaActual === 10
        },
        {
            step: 11,
            title: "Revisión por jurados",
            description: "Evaluación del borrador por jurados",
            completed: etapaActual > 11,
            current: etapaActual === 11
        },
        {
            step: 12,
            title: "Dictamen de borrador",
            description: "Dictamen final del borrador de tesis",
            completed: etapaActual > 12,
            current: etapaActual === 12
        },
        {
            step: 13,
            title: "Sustentación",
            description: "Defensa de la tesis ante el jurado",
            completed: etapaActual > 13,
            current: etapaActual === 13
        },
        {
            step: 14,
            title: "Archivo final",
            description: "Carga del documento final de tesis",
            completed: etapaActual > 14,
            current: etapaActual === 14
        },
        {
            step: 15,
            title: "Trámite concluido",
            description: "Proceso de tesis finalizado exitosamente",
            completed: etapaActual >= 15,
            current: etapaActual === 15
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={40} />
            </div>
        );
    }

    return (
        <Container>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Columna izquierda - Steps Verticales */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-6 h-full">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Progreso de Tesis</h3>
                        <Steps vertical current={etapaActual - 1}>
                            <Steps.Item title="Carga de proyecto" />
                            <Steps.Item title="Revisión de formato" />
                            <Steps.Item title="Revisión del Director" />
                            <Steps.Item title="Sorteo de jurados" />
                            <Steps.Item title="Revisión de jurados" />
                            <Steps.Item title="Dictamen" />
                            <Steps.Item title="Proyecto aprobado" />
                            <Steps.Item title="Habilitación borrador" />
                            <Steps.Item title="Carga de borrador" />
                            <Steps.Item title="Revisión de formato" />
                            <Steps.Item title="Revisión por jurados" />
                            <Steps.Item title="Dictamen de borrador" />
                            <Steps.Item title="Sustentación" />
                            <Steps.Item title="Archivo final" />
                            <Steps.Item title="Concluido" />
                        </Steps>
                    </div>
                </div>

                {/* Columna derecha - Contenido principal */}
                <div className="lg:col-span-3">
                    {/* Primera fila: Todo en un solo card (Encabezado, Información importante y Estadísticas) */}
                    <div className="mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
                            {/* Encabezado y badge */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Portal Estudiante - PILAR
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Bienvenido al Sistema de Investigación y Tesis
                                    </p>
                                </div>
                                <Badge
                                    content={`Etapa ${etapaActual}: ${estadosTramite.find(e => e.id === etapaActual)?.nombre || "Carga de proyecto"}`}
                                    className="mt-2 md:mt-0"
                                />
                            </div>

                            {/* Información importante */}
                            {tramiteActual && tramiteActual.estado && mensajesEstado[tramiteActual.estado.id] && (
                                <InfoBanner
                                    title={mensajesEstado[tramiteActual.estado.id].titulo}
                                    description={mensajesEstado[tramiteActual.estado.id].descripcion}
                                    actionText={tramiteActual.estado.id <= 2 ? "Cargar Proyecto" : ""}
                                    actionUrl=""
                                />
                            )}

                            {/* Estadísticas */}
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Estadísticas del Proceso</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {progressStats.map((stat, index) => (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Segunda fila: Solo tabs */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Sección de tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
                            <div className="tabs">
                                <div role="tablist" className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                                    <button
                                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'overview'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        Vista general
                                    </button>
                                    <button
                                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'process'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        onClick={() => setActiveTab('process')}
                                    >
                                        Proceso detallado
                                    </button>
                                    <button
                                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'faq'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        onClick={() => setActiveTab('faq')}
                                    >
                                        Preguntas frecuentes
                                    </button>
                                    <button
                                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'documents'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                        onClick={() => setActiveTab('documents')}
                                    >
                                        Documentos
                                    </button>
                                </div>

                                {/* Vista general */}
                                {activeTab === 'overview' && (
                                    <div className="tab-content">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <InfoCard
                                                icon={<FaFileAlt size={20} />}
                                                title="Mi proyecto actual"
                                                description="Ver detalles de tu proyecto de tesis, estado actual y próximos pasos."
                                                iconBgClass="bg-gray-100 dark:bg-gray-700"
                                                iconTextClass="text-primary dark:text-primary"
                                                onClick={() => navigate('/pilar/pregrado/estudiantes/etapa1/resumen')}
                                            />
                                            <InfoCard
                                                icon={<FaUsers size={20} />}
                                                title="Mis jurados"
                                                description="Información de contacto y perfil de tus jurados asignados."
                                                iconBgClass="bg-indigo-100 dark:bg-indigo-900/40"
                                                iconTextClass="text-indigo-600 dark:text-indigo-400"
                                                onClick={() => etapaActual >= 4 ? navigate('/pilar/pregrado/estudiantes/jurados') : null}
                                                className={etapaActual >= 4 ? '' : 'opacity-60 cursor-not-allowed'}
                                            />
                                            <InfoCard
                                                icon={<FaFileSignature size={20} />}
                                                title="Formatos y plantillas"
                                                description="Descarga formatos oficiales para cada etapa del proceso."
                                                iconBgClass="bg-green-100 dark:bg-green-900/40"
                                                iconTextClass="text-green-600 dark:text-green-400"
                                                onClick={() => setActiveTab('documents')}
                                            />
                                            <InfoCard
                                                icon={<FaCalendarAlt size={20} />}
                                                title="Calendario académico"
                                                description="Fechas importantes del semestre para investigación y tesis."
                                                iconBgClass="bg-orange-100 dark:bg-orange-900/40"
                                                iconTextClass="text-orange-600 dark:text-orange-400"
                                            />
                                            <InfoCard
                                                icon={<FaUserGraduate size={20} />}
                                                title="Asesorías virtuales"
                                                description="Solicita o consulta tus asesorías programadas."
                                                iconBgClass="bg-purple-100 dark:bg-purple-900/40"
                                                iconTextClass="text-purple-600 dark:text-purple-400"
                                            />
                                            <InfoCard
                                                icon={<FaQuestion size={20} />}
                                                title="Centro de ayuda"
                                                description="Resuelve dudas comunes sobre el proceso de tesis."
                                                iconBgClass="bg-gray-100 dark:bg-gray-700"
                                                iconTextClass="text-warning dark:text-warning"
                                                onClick={() => setActiveTab('faq')}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Proceso detallado */}
                                {activeTab === 'process' && (
                                    <div className="tab-content">
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
                                                    {processStages.map((stage) => (
                                                        <ProcessStage
                                                        key={stage.step}
                                                        step={stage.step}
                                                        title={stage.title}
                                                        description={stage.description}
                                                        isActive={stage.current}
                                                        isCompleted={stage.completed}
                                                        tips={[]} // Puedes definir consejos específicos para cada etapa si lo deseas
                                                    />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
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
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preguntas frecuentes */}
                                {activeTab === 'faq' && (
                                    <div className="tab-content">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                                Preguntas frecuentes
                                            </h3>
                                            <FAQ />
                                        </div>
                                    </div>
                                )}

                                {/* Documentos */}
                                {activeTab === 'documents' && (
                                    <div className="tab-content">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                                Documentos y formatos
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {documents.map((doc, idx) => (
                                                    <DownloadableDocument
                                                        key={idx}
                                                        title={doc.title}
                                                        description={doc.description}
                                                        icon={doc.icon}
                                                        iconBgClass={doc.iconBgClass}
                                                        iconTextClass={doc.iconTextClass}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default TesistaService;