// src/views/ServicePages/TesistaService/Etapa1/ProtectedEtapa1.tsx
import { useEffect, useState, ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '@/auth'
import { getUserAvailableServices } from '@/services/ServiceAccess'
import { checkTesistaHasTramite } from '@/services/TramiteService'
import { useActiveTesistaCareer } from '@/hooks/useActiveTesistaCareer'
import Spinner from '@/components/ui/Spinner'

interface ProtectedEtapa1State {
    hasServiceAccess: boolean | null
    hasTramite: boolean | null
    loading: boolean
}

const withEtapa1Protection = <P extends object>(Component: ComponentType<P>) => {
    const ProtectedComponent = (props: P) => {
        const { authenticated, user } = useAuth()
        const location = useLocation()
        const { activeCareer, isLoading: careerLoading } = useActiveTesistaCareer()
        
        const [state, setState] = useState<ProtectedEtapa1State>({
            hasServiceAccess: null,
            hasTramite: null,
            loading: true
        })

        useEffect(() => {
            const checkAccess = async () => {
                if (!authenticated || !user.id) {
                    setState({
                        hasServiceAccess: false,
                        hasTramite: null,
                        loading: false
                    })
                    return
                }

                try {
                    // 1. Verificar acceso al servicio de Tesista
                    const services = await getUserAvailableServices(user.id)
                    const hasServiceAccess = services.some(
                        (userService) => userService.servicio.id === 1
                    )

                    if (!hasServiceAccess) {
                        setState({
                            hasServiceAccess: false,
                            hasTramite: null,
                            loading: false
                        })
                        return
                    }

                    // 2. Verificar que tenga carrera activa y trámite
                    if (!careerLoading && activeCareer) {
                        const hasTramite = await checkTesistaHasTramite(activeCareer.tesistaId)
                        
                        setState({
                            hasServiceAccess: true,
                            hasTramite,
                            loading: false
                        })
                    } else if (!careerLoading) {
                        // No tiene carrera activa
                        setState({
                            hasServiceAccess: true,
                            hasTramite: false,
                            loading: false
                        })
                    }
                } catch (error) {
                    console.error('Error verificando acceso a Etapa1:', error)
                    setState({
                        hasServiceAccess: false,
                        hasTramite: null,
                        loading: false
                    })
                }
            }

            if (!careerLoading) {
                checkAccess()
            }
        }, [authenticated, user, activeCareer, careerLoading])

        // Loading state
        if (state.loading || careerLoading) {
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

        // Authentication check
        if (!authenticated) {
            return <Navigate to="/sign-in" state={{ from: location }} />
        }

        // Service access check
        if (!state.hasServiceAccess) {
            return <Navigate to="/access-denied" state={{ from: location }} />
        }

        // Tramite check - redirect to tesista service if no tramite
        if (!state.hasTramite) {
            return <Navigate to="/servicio/tesista" state={{ from: location }} />
        }

        // All checks passed, render component
        return <Component {...props} />
    }

    ProtectedComponent.displayName = `withEtapa1Protection(${Component.displayName || Component.name})`
    
    return ProtectedComponent
}

export default withEtapa1Protection