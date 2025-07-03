// src/hooks/useActiveTesistaCareer.ts
import { useState, useEffect, useCallback } from 'react'
import { 
    getActiveTesistaCareer, 
    setActiveTesistaCareer, 
    clearActiveTesistaCareer,
    getTesistaCareersByUser,
    type TesistaCareerData 
} from '@/services/TesistaServiceEnhanced'
import { useSessionUser } from '@/store/authStore'

export const useActiveTesistaCareer = () => {
    const [activeCareer, setActiveCareerState] = useState<TesistaCareerData | null>(null)
    const [availableCareers, setAvailableCareers] = useState<TesistaCareerData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { userData } = useSessionUser()

    // Cargar carrera activa y carreras disponibles
    const loadCareerData = useCallback(async () => {
        if (!userData?.id) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)

            // Obtener todas las carreras disponibles
            const careers = await getTesistaCareersByUser(userData.id)
            setAvailableCareers(careers)

            // Obtener carrera activa del localStorage
            const storedActiveCareer = getActiveTesistaCareer()
            if (storedActiveCareer) {
                const freshCareer = careers.find(c => c.id === storedActiveCareer.id)
                
                if (freshCareer) {
                    setActiveTesistaCareer(freshCareer) // ✅ Actualizar localStorage con datos frescos
                    setActiveCareerState(freshCareer)   // ✅ Usar datos frescos
                } else {
                    // Si no existe, limpiar y usar la primera
                    clearActiveTesistaCareer()
                    if (careers.length > 0) {
                        const firstCareer = careers[0]
                        setActiveTesistaCareer(firstCareer)
                        setActiveCareerState(firstCareer)
                    }
                }
            } else if (careers.length > 0) {
                // Si no hay carrera activa pero hay carreras disponibles, usar la primera
                const firstCareer = careers[0]
                setActiveTesistaCareer(firstCareer)
                setActiveCareerState(firstCareer)
            }

        } catch (error) {
            console.error('Error loading career data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [userData?.id])

    // Cambiar carrera activa
    const changeActiveCareer = useCallback((career: TesistaCareerData) => {
    console.log('🔍 DEBUG - Career recibido:', career) // ✅ Agregar esta línea
    console.log('🔍 DEBUG - Estructura:', career.estructuraAcademica) // ✅ Agregar esta línea
    setActiveTesistaCareer(career)
    setActiveCareerState(career)
    console.log('🔄 Carrera activa cambiada a:', career.estructuraAcademica.carrera.nombre)
    }, [])

    // Limpiar carrera activa
    const clearActiveCareer = useCallback(() => {
        clearActiveTesistaCareer()
        setActiveCareerState(null)
        console.log('🧹 Carrera activa limpiada')
    }, [])

    // Refrescar datos
    const refreshCareerData = useCallback(() => {
        loadCareerData()
    }, [loadCareerData])

    // Verificar si tiene múltiples carreras
    const hasMultipleCareers = availableCareers.length > 1

    // Verificar si tiene al menos una carrera
    const hasCareers = availableCareers.length > 0

    // Escuchar cambios en la carrera activa (eventos personalizados)
    useEffect(() => {
        const handleCareerChange = (event: CustomEvent) => {
            const newCareer = event.detail
            setActiveCareerState(newCareer)
        }

        window.addEventListener('tesista-career-changed', handleCareerChange as EventListener)

        return () => {
            window.removeEventListener('tesista-career-changed', handleCareerChange as EventListener)
        }
    }, [])

    // Cargar datos iniciales
    useEffect(() => {
        loadCareerData()
    }, [loadCareerData])

    return {
        // Estado
        activeCareer,
        availableCareers,
        isLoading,
        
        // Propiedades derivadas
        hasMultipleCareers,
        hasCareers,
        
        // Acciones
        changeActiveCareer,
        clearActiveCareer,
        refreshCareerData,
        
        // Información útil
        careerCount: availableCareers.length,
        activeCareerName: activeCareer?.estructuraAcademica?.carrera?.nombre || null,
        activeCareerCode: activeCareer?.codigo_estudiante || null,
        activeFaculty: activeCareer?.estructuraAcademica?.facultad?.nombre || null
    }
}