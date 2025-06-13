// src/views/Servicios/Servicios.tsx - Con animaciones motion
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/auth';
import { getUserAvailableServices, type UsuarioServicioConServicio } from '@/services/ServiceAccess';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Container from '@/components/shared/Container'
import SectionHeader from '@/components/shared/SectionHeader'
import { 
    FaUserGraduate, 
    FaChalkboardTeacher, 
    FaCog, 
    FaBuilding, 
    FaUniversity,
    FaUsers,
    FaArrowRight
} from 'react-icons/fa';

interface ServiceCardProps {
    service: UsuarioServicioConServicio;
    onSelect: (serviceId: number) => void;
    index: number;
}

const ServiceCard = ({ service, onSelect, index }: ServiceCardProps) => {
    // Iconos según el tipo de servicio
    const getServiceIcon = (serviceId: number) => {
        switch (serviceId) {
            case 1: return <FaUserGraduate className="text-2xl" />;
            case 2: return <FaChalkboardTeacher className="text-2xl" />;
            case 3: return <FaCog className="text-2xl" />;
            case 4: return <FaBuilding className="text-2xl" />;
            case 5: return <FaUniversity className="text-2xl" />;
            case 6: return <FaUsers className="text-2xl" />;
            default: return <FaCog className="text-2xl" />;
        }
    };

    // Colores según el tipo de servicio
    const getServiceColors = (serviceId: number) => {
        switch (serviceId) {
            case 1: return {
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-200 dark:border-blue-800',
                hover: 'hover:border-blue-300 dark:hover:border-blue-700'
            };
            case 2: return {
                bg: 'bg-green-50 dark:bg-green-900/20',
                text: 'text-green-600 dark:text-green-400',
                border: 'border-green-200 dark:border-green-800',
                hover: 'hover:border-green-300 dark:hover:border-green-700'
            };
            case 3: return {
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-200 dark:border-purple-800',
                hover: 'hover:border-purple-300 dark:hover:border-purple-700'
            };
            case 4: return {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                text: 'text-orange-600 dark:text-orange-400',
                border: 'border-orange-200 dark:border-orange-800',
                hover: 'hover:border-orange-300 dark:hover:border-orange-700'
            };
            case 5: return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                text: 'text-red-600 dark:text-red-400',
                border: 'border-red-200 dark:border-red-800',
                hover: 'hover:border-red-300 dark:hover:border-red-700'
            };
            case 6: return {
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                text: 'text-indigo-600 dark:text-indigo-400',
                border: 'border-indigo-200 dark:border-indigo-800',
                hover: 'hover:border-indigo-300 dark:hover:border-indigo-700'
            };
            default: return {
                bg: 'bg-gray-50 dark:bg-gray-900/20',
                text: 'text-gray-600 dark:text-gray-400',
                border: 'border-gray-200 dark:border-gray-700',
                hover: 'hover:border-gray-300 dark:hover:border-gray-600'
            };
        }
    };

    const colors = getServiceColors(service.servicio.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
            }}
            whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
            }}
            className="group"
        >
            <Card
                className={`
                    cursor-pointer transition-all duration-300 h-full
                    border-2 ${colors.border} ${colors.hover}
                    hover:shadow-xl hover:shadow-blue-500/10
                    group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-50
                    dark:group-hover:from-gray-800 dark:group-hover:to-gray-900
                `}
                onClick={() => onSelect(service.servicio.id)}
            >
                <div className="p-6">
                    {/* Icono y título */}
                    <div className="flex items-start space-x-4 mb-4">
                        <motion.div
                            className={`
                                p-3 rounded-xl ${colors.bg} ${colors.text}
                                group-hover:scale-110 transition-transform duration-200
                            `}
                            whileHover={{ rotate: 5 }}
                        >
                            {getServiceIcon(service.servicio.id)}
                        </motion.div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                {service.servicio.nombre}
                            </h4>
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                                className={`h-1 ${colors.bg} rounded-full`}
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        {service.servicio.descripcion}
                    </p>

                    {/* Información adicional */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Fecha de acceso: {new Date(service.fecha_asignacion || '').toLocaleDateString()}
                        </span>
                        <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${service.estado === 1 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }
                        `}>
                            {service.estado === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* Botón de acceso */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            block
                            variant="solid"
                            className="bg-gradient-to-r from-primary to-primary-deep hover:from-primary-deep hover:to-primary group"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(service.servicio.id);
                            }}
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <span>Acceder al servicio</span>
                                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
};

const Servicios = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState<UsuarioServicioConServicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                if (user.id) {
                    const userServices = await getUserAvailableServices(user.id);
                    setServices(userServices);
                } else {
                    setError('No se pudo identificar al usuario');
                }
            } catch (err) {
                console.error('Error al cargar servicios:', err);
                setError('Error al cargar los servicios disponibles');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [user]);

    const handleServiceSelect = (serviceId: number) => {
        // Redirigir según el ID del servicio
        switch (serviceId) {
            case 1: // PILAR PREGRADO TESISTA
                navigate('/servicio/tesista');
                break;
            case 2: // PILAR PREGRADO DOCENTE
                navigate('/servicio/docente');
                break;
            case 3: // PILAR PREGRADO COORDINADOR
                navigate('/servicio/coordinador');
                break;
            case 4: // PILAR PREGRADO ADMINISTRACIONVRI
                navigate('/servicio/administracion');
                break;
            case 5: // Director de Facultad
                navigate('/servicio/director-facultad');
                break;
            case 6: // Director-Subdirector de Investigacion de Escuela
                navigate('/servicio/director-escuela');
                break;
            default:
                navigate('/servicios');
                break;
        }
    };

    if (loading) {
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

    if (error) {
        return (
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader
                        title="Servicios y Plataformas"
                        subtitle="Selecciona el servicio o plataforma a la que deseas acceder"
                    />
                    <motion.div 
                        className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="mb-2 text-red-700 dark:text-red-400 font-semibold">Error</h3>
                        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="mt-4" onClick={() => navigate('/home')}>
                                Volver al inicio
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </Container>
        );
    }

    if (services.length === 0) {
        return (
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader
                        title="Servicios y Plataformas"
                        subtitle="Selecciona el servicio o plataforma a la que deseas acceder"
                    />
                    <motion.div 
                        className="text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="mb-2 text-yellow-700 dark:text-yellow-400 font-semibold">Sin servicios disponibles</h3>
                        <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                            No tienes servicios disponibles en este momento.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="mt-4" onClick={() => navigate('/home')}>
                                Volver al inicio
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 py-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionHeader
                        title="Servicios y Plataformas"
                        subtitle="Selecciona el servicio o plataforma a la que deseas acceder"
                    />
                </motion.div>

                <AnimatePresence>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {services.map((userService, index) => (
                            <ServiceCard
                                key={userService.id}
                                service={userService}
                                onSelect={handleServiceSelect}
                                index={index}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Información adicional */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center"
                >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            ¿Necesitas acceso a más servicios?
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 text-sm">
                            Contacta al administrador del sistema para solicitar acceso a servicios adicionales.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </Container>
    );
};

export default Servicios;