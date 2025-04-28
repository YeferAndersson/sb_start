// src/components/route/ServiceAuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getUserAvailableServices } from '@/services/ServiceAccess'
import { useAuth } from '@/auth'
import Loading from '@/components/shared/Loading'

type ServiceAuthGuardProps = {
    serviceId: number
    children: React.ReactNode
}

const ServiceAuthGuard = ({ serviceId, children }: ServiceAuthGuardProps) => {
    const { authenticated, user } = useAuth()
    const location = useLocation()
    const [access, setAccess] = useState<boolean | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const checkAccess = async () => {
            if (!authenticated || !user.id) {
                setAccess(false)
                setLoading(false)
                return
            }

            try {
                const services = await getUserAvailableServices(user.id)
                const hasAccess = services.some(
                    (service) => service.servicio.id === serviceId
                )
                setAccess(hasAccess)
            } catch (error) {
                console.error('Error verificando acceso al servicio:', error)
                setAccess(false)
            } finally {
                setLoading(false)
            }
        }

        checkAccess()
    }, [authenticated, user, serviceId])

    if (loading) {
        return <Loading loading={true} />
    }

    if (!authenticated) {
        return <Navigate to="/sign-in" state={{ from: location }} />
    }

    return access ? (
        <>{children}</>
    ) : (
        <Navigate to="/access-denied" state={{ from: location }} />
    )
}

export default ServiceAuthGuard