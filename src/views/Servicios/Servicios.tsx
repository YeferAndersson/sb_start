// src/views/Servicios/Servicios.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import { getUserAvailableServices } from '@/services/ServiceAccess';
import { DicServicio, UsuarioServicio } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Container from '@/components/shared/Container'
import SectionHeader from '@/components/shared/SectionHeader'

interface ServiceCardProps {
    service: DicServicio;
    onSelect: (serviceId: number) => void;
}

const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
    return (
        <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect(service.id)}
        >
            <div className="p-4">
                <h4 className="font-semibold mb-2">{service.nombre}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {service.descripcion}
                </p>
                <Button
                    block
                    variant="solid"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(service.id);
                    }}
                >
                    Acceder
                </Button>
            </div>
        </Card>
    );
};

const Servicios = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState<(UsuarioServicio & { servicio: DicServicio })[]>([]);
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
            case 4: // PILAR PREGADO ADMINISTRACIONVRI
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
            <div className="flex justify-center items-center h-full">
                <Spinner size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <Container>´
                <SectionHeader
                    title="Servicios y Plataformas"
                    subtitle="Selecciona el servicio o plataforma a la que desea acceder"
                />
                <div className="text-center">
                    <h3 className="mb-2">Error</h3>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <Button className="mt-4" onClick={() => navigate('/home')}>
                        Volver al inicio
                    </Button>
                </div>
            </Container>
        );
    }

    if (services.length === 0) {
        return (
            <Container>
                <SectionHeader
                    title="Servicios y Plataformas"
                    subtitle="Selecciona el servicio o plataforma a la que desea acceder"
                />
                <div className="text-center">
                    <h3 className="mb-2">Sin servicios disponibles</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No tienes servicios disponibles en este momento.
                    </p>
                    <Button className="mt-4" onClick={() => navigate('/home')}>
                        Volver al inicio
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="container mx-auto px-4 py-8">
                <SectionHeader
                    title="Servicios y Plataformas"
                    subtitle="Selecciona el servicio o plataforma a la que desea acceder"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((userService) => (
                        <ServiceCard
                            key={userService.id}
                            service={userService.servicio}
                            onSelect={handleServiceSelect}
                        />
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default Servicios;