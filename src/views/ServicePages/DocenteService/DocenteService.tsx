// src/views/ServicePages/DocenteService/DocenteService.tsx - Con animaciones motion
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import Container from '@/components/shared/Container'
import { 
    FaChalkboardTeacher, 
    FaUsers, 
    FaClipboardList, 
    FaFileAlt, 
    FaCalendarAlt,
    FaBell,
    FaCog,
    FaGraduationCap,
    FaComment,
    FaBook
} from 'react-icons/fa'

const DocenteService = () => {
    const setCurrentRouteKey = useRouteKeyStore(
        (state) => state.setCurrentRouteKey
    )

    useEffect(() => {
        setCurrentRouteKey('servicios.docente')
    }, [setCurrentRouteKey])

    // Datos de las funcionalidades disponibles
    const features = [
        {
            icon: <FaUsers className="text-2xl" />,
            title: "Gestión de Tesistas",
            description: "Administra y supervisa a tus tesistas asignados, revisa avances y proporciona retroalimentación.",
            status: "Próximamente",
            color: "blue"
        },
        {
            icon: <FaClipboardList className="text-2xl" />,
            title: "Evaluación de Proyectos",
            description: "Revisa y evalúa proyectos de tesis, emite dictámenes y gestiona el proceso de aprobación.",
            status: "En desarrollo",
            color: "green"
        },
        {
            icon: <FaFileAlt className="text-2xl" />,
            title: "Revisión de Borradores",
            description: "Accede a los borradores de tesis para revisión, comentarios y aprobación final.",
            status: "Próximamente",
            color: "purple"
        },
        {
            icon: <FaCalendarAlt className="text-2xl" />,
            title: "Programación de Sustentaciones",
            description: "Programa y gestiona las fechas de sustentación de tesis de tus tesistas.",
            status: "Próximamente",
            color: "orange"
        },
        {
            icon: <FaBell className="text-2xl" />,
            title: "Notificaciones",
            description: "Recibe alertas sobre nuevas asignaciones, fechas límite y actualizaciones importantes.",
            status: "Próximamente",
            color: "red"
        },
        {
            icon: <FaComment className="text-2xl" />,
            title: "Comunicación con Tesistas",
            description: "Sistema de mensajería para mantener comunicación directa con tus tesistas.",
            status: "Próximamente",
            color: "indigo"
        }
    ];

    const quickActions = [
        {
            icon: <FaGraduationCap className="text-xl" />,
            title: "Mis Tesistas",
            description: "Ver lista de tesistas asignados",
            action: () => console.log("Navegar a tesistas")
        },
        {
            icon: <FaBook className="text-xl" />,
            title: "Proyectos Pendientes",
            description: "Revisar proyectos por evaluar",
            action: () => console.log("Navegar a proyectos")
        },
        {
            icon: <FaCog className="text-xl" />,
            title: "Configuración",
            description: "Ajustar preferencias de notificaciones",
            action: () => console.log("Navegar a configuración")
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800'
            },
            green: {
                bg: 'bg-green-50 dark:bg-green-900/20',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800'
            },
            purple: {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-200 dark:border-purple-800'
            },
            orange: {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                text: 'text-orange-600 dark:text-orange-400',
                border: 'border-orange-200 dark:border-orange-800'
            },
            red: {
                bg: 'bg-red-50 dark:bg-red-900/20',
                text: 'text-red-600 dark:text-red-400',
                border: 'border-red-200 dark:border-red-800'
            },
            indigo: {
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                text: 'text-indigo-600 dark:text-indigo-400',
                border: 'border-indigo-200 dark:border-indigo-800'
            }
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <Container>
                <div className="container mx-auto p-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <motion.div
                                className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400"
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                <FaChalkboardTeacher className="text-3xl" />
                            </motion.div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Portal Docente - PILAR
                                </h2>
                                <p className="text-gray-400">
                                    Gestiona tu trabajo como director de tesis y miembro de jurado
                                </p>
                            </div>
                        </div>
                        
                        {/* Barra de progreso decorativa */}
                        <motion.div
                            className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </motion.div>

                    {/* Información de desarrollo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-xl mb-8"
                    >
                        <div className="flex space-x-3">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <FaBell className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                    Portal en Desarrollo Activo
                                </h3>
                                <p className="text-blue-600 dark:text-blue-300 mb-4 leading-relaxed">
                                    Estamos trabajando en las funcionalidades específicas para docentes. 
                                    Próximamente tendrás acceso completo a herramientas para gestionar 
                                    tesistas, evaluar proyectos y participar en el proceso de tesis.
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                                    />
                                    <span>Desarrollo en progreso...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Acciones rápidas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Acciones Rápidas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickActions.map((action, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="group cursor-pointer"
                                    onClick={action.action}
                                >
                                    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                                {action.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {action.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Funcionalidades próximas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Funcionalidades en Desarrollo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {features.map((feature, index) => {
                                    const colorClasses = getColorClasses(feature.color);
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.7 + index * 0.1 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            className="group"
                                        >
                                            <div className={`p-6 bg-white dark:bg-gray-800 border ${colorClasses.border} rounded-xl hover:shadow-xl transition-all duration-300 h-full`}>
                                                <div className="flex items-start space-x-4 mb-4">
                                                    <motion.div
                                                        className={`p-3 ${colorClasses.bg} ${colorClasses.text} rounded-xl group-hover:scale-110`}
                                                        whileHover={{ rotate: 5 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {feature.icon}
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                            {feature.title}
                                                        </h4>
                                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                                                            {feature.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Footer informativo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-12 text-center"
                    >
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                ¿Tienes sugerencias o necesitas ayuda?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Contacta al equipo de desarrollo para compartir tus ideas o reportar problemas.
                                Tu feedback es valioso para mejorar la plataforma.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </motion.div>
    )
}

export default DocenteService