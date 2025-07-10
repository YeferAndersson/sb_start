// src/views/Servicios/Servicios.tsx - Con animaciones motion (ACTUALIZADO PARA ESTRUCTURAS ACADÉMICAS)
import { useState, useEffect, useCallback } from 'react';
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
import Alert from '@/components/ui/Alert'

import AddServiceModal from '@/components/shared/AddServiceModal/AddServiceModal'
import VerifyStudentModal from '@/components/shared/VerifyStudentModal/VerifyStudentModal'
import CareerSelectorModal from '@/components/shared/CareerSelectorModal/CareerSelectorModal'
import { FaPlus } from 'react-icons/fa'
import {
    addTesistaService,
    checkUserHasTesistaService,
    type AddTesistaServiceData
} from '@/services/TesistaServiceEnhanced'

// ✅ Nueva interfaz para estructuras académicas
interface StructureOption {
    id: number
    tesistaId: number
    codigo_estudiante: string
    dicEstructuraAcademica: string
    idEstructuraAcademica: number
    especialidad?: string
    facultad?: string
    sede?: string
}

// ✅ Interfaz de compatibilidad para CareerSelectorModal (si no quieres cambiar el modal aún)
interface CareerOption {
    id: number
    tesistaId: number
    codigo_estudiante: string
    carrera: {
        id: number
        nombre: string
        facultad?: {
            nombre: string
            abreviatura: string
        }
    }
}

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

    const [showAddServiceModal, setShowAddServiceModal] = useState(false)
    const [showVerifyStudentModal, setShowVerifyStudentModal] = useState(false)

    // ✅ Estados actualizados para estructuras académicas
    const [showStructureSelectorModal, setShowStructureSelectorModal] = useState(false)
    const [availableStructures, setAvailableStructures] = useState<StructureOption[]>([])

    // ✅ Mantener compatibilidad con CareerSelectorModal existente
    const [showCareerSelectorModal, setShowCareerSelectorModal] = useState(false)
    const [availableCareers, setAvailableCareers] = useState<CareerOption[]>([])

    const [isProcessingService, setIsProcessingService] = useState(false)

    // Función fetchServices usando useCallback para poder reutilizarla
    const fetchServices = useCallback(async () => {
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
    }, [user]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleServiceSelectOriginal = (serviceId: number) => {
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

    const handleAddService = () => {
        setShowAddServiceModal(true)
    }

    const handleServiceTypeSelect = (serviceType: string) => {
        setShowAddServiceModal(false)

        if (serviceType === 'tesista') {
            setShowVerifyStudentModal(true)
        }
        // Aquí se pueden agregar otros tipos de servicio en el futuro
    }

    const handleStudentVerificationSuccess = async (studentData: any) => {
        setShowVerifyStudentModal(false)
        setIsProcessingService(true)

        try {
            const addServiceData: AddTesistaServiceData = {
                studentCode: studentData.codigoEstudiante, // ✅ Campo tal como viene de Edge Function
                idEstructuraAcademica: studentData.idEstructuraAcademica,
                nombres: studentData.nombres,
                apellidos: studentData.apellidos,
                numDocIdentidad: studentData.numDocIdentidad,
                semestreActual: studentData.semestreActual,
                totalSemestre: studentData.totalSemestre,
                dicEstructuraAcademica: studentData.dicEstructuraAcademica, // ✅ Ya viene de Edge Function
                correoInstitucional: studentData.correoInstitucional,
                numeroCelular: studentData.numeroCelular
            }

            const result = await addTesistaService(user.id!, addServiceData)

            if (result.success) {
                // Mostrar mensaje de éxito
                console.log('✅ Servicio agregado exitosamente')

                // Refrescar la lista de servicios
                await fetchServices()

            
            }
        } catch (error) {
            console.error('❌ Error agregando servicio:', error)
            alert(`Error: ${(error as Error).message}`)
        } finally {
            setIsProcessingService(false)
        }
    }

    // ✅ Función actualizada para manejar estructuras académicas
    const handleServiceSelect = async (serviceId: number) => {
        // Si es servicio de tesista (ID = 1), verificar si tiene múltiples estructuras académicas
        if (serviceId === 1) {
            try {
                const tesistaInfo = await checkUserHasTesistaService(user.id!)

                if (tesistaInfo.careerCount > 1) {
                    // ✅ Opción 1: Usar modal existente CareerSelectorModal (transformando datos)
                    const transformedCareers: CareerOption[] = tesistaInfo.careers.map(structure => ({
                        id: structure.id,
                        tesistaId: structure.tesistaId,
                        codigo_estudiante: structure.codigo_estudiante,
                        carrera: {
                            id: structure.estructuraAcademica.carrera.id,
                            // ✅ CAMBIAR ESTA LÍNEA:
                            nombre: `${structure.estructuraAcademica.carrera.nombre}${structure.estructuraAcademica.especialidad?.nombre &&
                                    structure.estructuraAcademica.especialidad.id !== 1
                                    ? ` - ${structure.estructuraAcademica.especialidad.nombre}`
                                    : ''
                                }${structure.estructuraAcademica.sede?.nombre ? ` (${structure.estructuraAcademica.sede.nombre})` : ''}`,
                            facultad: structure.estructuraAcademica.facultad ? {
                                nombre: structure.estructuraAcademica.facultad.nombre,
                                abreviatura: structure.estructuraAcademica.facultad.abreviatura
                            } : undefined
                        }
                    }))

                    setAvailableCareers(transformedCareers)
                    setShowCareerSelectorModal(true)
                    return

                    // ✅ Opción 2: Si prefieres crear un nuevo modal para estructuras (comentado por ahora)
                    /*
                    const availableStructuresData: StructureOption[] = tesistaInfo.careers.map(structure => ({
                        id: structure.id,
                        tesistaId: structure.tesistaId,
                        codigo_estudiante: structure.codigo_estudiante,
                        dicEstructuraAcademica: `${structure.estructuraAcademica.carrera.nombre}${structure.estructuraAcademica.especialidad?.nombre ? ` - ${structure.estructuraAcademica.especialidad.nombre}` : ''}`,
                        idEstructuraAcademica: structure.estructuraAcademica.id,
                        especialidad: structure.estructuraAcademica.especialidad?.nombre,
                        facultad: structure.estructuraAcademica.facultad?.nombre,
                        sede: structure.estructuraAcademica.sede?.nombre
                    }))

                    setAvailableStructures(availableStructuresData)
                    setShowStructureSelectorModal(true)
                    return
                    */
                }
            } catch (error) {
                console.error('Error verificando estructuras académicas:', error)
            }
        }

        // Comportamiento original para otros servicios o tesista con una sola estructura académica
        handleServiceSelectOriginal(serviceId)
    }

    // ✅ Función actualizada para manejar selección de estructura académica
    const handleCareerSelection = (careerData: CareerOption) => {
        setShowCareerSelectorModal(false)

        // ✅ Transformar de vuelta para almacenar estructura académica
        const structureData = {
            id: careerData.id,
            tesistaId: careerData.tesistaId,
            codigo_estudiante: careerData.codigo_estudiante,
            estructuraAcademica: {
                id: careerData.carrera.id, // ✅ Agregar
                carrera: {
                    id: careerData.carrera.id,
                    nombre: careerData.carrera.nombre.split(' - ')[0]
                },
                especialidad: {
                    id: 0,
                    nombre: careerData.carrera.nombre.includes(' - ') ? careerData.carrera.nombre.split(' - ')[1]?.split(' (')[0] || 'Sin especialidad' : 'Sin especialidad'
                },
                facultad: {
                    id: 0,
                    nombre: careerData.carrera.facultad?.nombre || 'Sin facultad',
                    abreviatura: careerData.carrera.facultad?.abreviatura || ''
                },
                sede: {
                    id: 0,
                    nombre: careerData.carrera.nombre.includes('(') ? careerData.carrera.nombre.split('(')[1]?.replace(')', '') || 'Sin sede' : 'Sin sede'
                }
            }
        }

        // Almacenar la estructura académica seleccionada en localStorage
        localStorage.setItem('active-tesista-career', JSON.stringify(structureData))

        // Navegar al servicio de tesista
        navigate('/servicio/tesista')
    }

    // ✅ Nueva función para manejar selección de estructura (si usas modal separado)
    const handleStructureSelection = (structureData: StructureOption) => {
        setShowStructureSelectorModal(false)

        // Almacenar la estructura académica seleccionada
        const careerData = {
            id: structureData.id,
            tesistaId: structureData.tesistaId,
            codigo_estudiante: structureData.codigo_estudiante,
            estructuraAcademica: {
                id: structureData.idEstructuraAcademica,
                carrera: {
                    nombre: structureData.dicEstructuraAcademica
                }
            }
        }

        localStorage.setItem('active-tesista-career', JSON.stringify(careerData))

        // Navegar al servicio de tesista
        navigate('/servicio/tesista')
    }

    if (services.length === 0) {
        return (
            <Container>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-4 py-8"
                >
                    {/* AGREGAR: Header con botón de agregar servicio igual que cuando hay servicios */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-between items-center mb-8"
                    >
                        <div>
                            <SectionHeader
                                title="Servicios y Plataformas"
                                subtitle="Selecciona el servicio o plataforma a la que deseas acceder"
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="solid"
                                className="bg-primary hover:bg-primary-deep flex items-center space-x-2"
                                onClick={handleAddService}
                                disabled={isProcessingService}
                            >
                                {isProcessingService ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <Spinner size={16} />
                                    </motion.div>
                                ) : (
                                    <FaPlus className="text-sm" />
                                )}
                                <span>{isProcessingService ? 'Procesando...' : 'Agregar Servicio'}</span>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* CAMBIAR: Mensaje más positivo y con call-to-action */}
                    <motion.div
                        className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="mb-2 text-blue-700 dark:text-blue-400 font-semibold">¡Comienza agregando tu primer servicio!</h3>
                        <p className="text-blue-600 dark:text-blue-300 mb-4">
                            No tienes servicios configurados aún. Haz clic en "Agregar Servicio" para comenzar.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="solid"
                                    className="bg-primary hover:bg-primary-deep"
                                    onClick={handleAddService}
                                    disabled={isProcessingService}
                                >
                                    {isProcessingService ? 'Procesando...' : 'Agregar Servicio'}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="default" onClick={() => navigate('/home')}>
                                    Volver al inicio
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* AGREGAR: Todos los modales también deben estar disponibles */}
                    <AddServiceModal
                        isOpen={showAddServiceModal}
                        onClose={() => setShowAddServiceModal(false)}
                        onSelectService={handleServiceTypeSelect}
                    />

                    <VerifyStudentModal
                        isOpen={showVerifyStudentModal}
                        onClose={() => setShowVerifyStudentModal(false)}
                        onSuccess={handleStudentVerificationSuccess}
                    />

                    <CareerSelectorModal
                        isOpen={showCareerSelectorModal}
                        onClose={() => setShowCareerSelectorModal(false)}
                        careers={availableCareers}
                        onSelectCareer={handleCareerSelection}
                    />
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
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <SectionHeader
                            title="Servicios y Plataformas"
                            subtitle="Selecciona el servicio o plataforma a la que deseas acceder"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="solid"
                            className="bg-primary hover:bg-primary-deep flex items-center space-x-2"
                            onClick={handleAddService}
                            disabled={isProcessingService}
                        >
                            {isProcessingService ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <Spinner size={16} />
                                </motion.div>
                            ) : (
                                <FaPlus className="text-sm" />
                            )}
                            <span>{isProcessingService ? 'Procesando...' : 'Agregar Servicio'}</span>
                        </Button>
                    </motion.div>
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
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                            ¿Necesitas agregar más servicios?
                        </h3>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                            Puedes agregar nuevos servicios en cualquier momento usando el botón "Agregar Servicio".
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modales */}
            <AddServiceModal
                isOpen={showAddServiceModal}
                onClose={() => setShowAddServiceModal(false)}
                onSelectService={handleServiceTypeSelect}
            />

            <VerifyStudentModal
                isOpen={showVerifyStudentModal}
                onClose={() => setShowVerifyStudentModal(false)}
                onSuccess={handleStudentVerificationSuccess}
            />

            <CareerSelectorModal
                isOpen={showCareerSelectorModal}
                onClose={() => setShowCareerSelectorModal(false)}
                careers={availableCareers}
                onSelectCareer={handleCareerSelection}
            />

            {/* ✅ Modal opcional para estructuras académicas (si decides crear uno nuevo) */}
            {/* 
            <StructureSelectorModal
                isOpen={showStructureSelectorModal}
                onClose={() => setShowStructureSelectorModal(false)}
                structures={availableStructures}
                onSelectStructure={handleStructureSelection}
            />
            */}
        </Container>
    );
};

export default Servicios;