// src/views/ServicePages/TesistaService/ProtectedTesistaService.tsx - Corregido
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '@/auth'
import { getUserAvailableServices } from '@/services/ServiceAccess'
import Spinner from '@/components/ui/Spinner'
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
                // Verificar si tiene acceso al servicio de Tesista (ID = 1)
                const hasAccess = services.some(
                    (userService) => userService.servicio.id === 1
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
        return <Navigate to="/sign-in" state={{ from: location }} />
    }

    if (!access) {
        return <Navigate to="/access-denied" state={{ from: location }} />
    }

    return <TesistaService />
}

export default ProtectedTesistaService