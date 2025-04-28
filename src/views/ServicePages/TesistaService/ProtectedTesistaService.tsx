// src/views/ServicePages/TesistaService/ProtectedTesistaService.tsx
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { getUserAvailableServices } from '@/services/ServiceAccess'
import Loading from '@/components/shared/Loading'
import TesistaService from './TesistaService'

const ProtectedTesistaService = () => {
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
                    (service) => service.servicio.id === 1 // ID del servicio Tesista
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
    }, [authenticated, user])

    if (loading) {
        return <Loading loading={true} />
    }

    if (!authenticated) {
        return <Navigate to="/sign-in" state={{ from: location }} />
    }

    return access ? <TesistaService /> : <Navigate to="/access-denied" state={{ from: location }} />
}

export default ProtectedTesistaService