// src/views/ServicePages/DocenteService/DocenteService.tsx
import { useEffect } from 'react'
import { useRouteKeyStore } from '@/store/routeKeyStore'

const DocenteService = () => {
    const setCurrentRouteKey = useRouteKeyStore(
        (state) => state.setCurrentRouteKey
    )

    useEffect(() => {
        setCurrentRouteKey('servicios.docente')
    }, [setCurrentRouteKey])

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Servicio para Docentes</h2>
            <p className="mb-4">
                Bienvenido al servicio de PILAR PREGRADO DOCENTE. Desde aquí podrás gestionar tus actividades como docente.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="font-medium">
                    Esta página está actualmente en desarrollo. Pronto tendrás acceso a todas las funcionalidades.
                </p>
            </div>
        </div>
    )
}

export default DocenteService