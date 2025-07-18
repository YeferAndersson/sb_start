// src/views/ServicePages/ProtectedServiceWrapper.tsx
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '@/auth'
import { getUserAvailableServices } from '@/services/ServiceAccess'
import Spinner from '@/components/ui/Spinner'

interface ProtectedServiceWrapperProps {
    serviceId: number
    ServiceComponent: React.ComponentType
    accessDeniedPath?: string
    signInPath?: string
}

const ProtectedServiceWrapper: React.FC<ProtectedServiceWrapperProps> = ({
    serviceId,
    ServiceComponent,
    accessDeniedPath = '/access-denied',
    signInPath = '/sign-in'
}) => {
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
                    (userService) => userService.servicio.id === serviceId
                )
                setAccess(hasAccess)
            } catch (error) {
                console.error(`Error verificando acceso al servicio ${serviceId}:`, error)
                setAccess(false)
            } finally {
                setLoading(false)
            }
        }

        checkAccess()
    }, [authenticated, user, serviceId])

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
        )
    }

    if (!authenticated) {
        return <Navigate to={signInPath} state={{ from: location }} />
    }

    if (!access) {
        return <Navigate to={accessDeniedPath} state={{ from: location }} />
    }

    return <ServiceComponent />
}

export default ProtectedServiceWrapper