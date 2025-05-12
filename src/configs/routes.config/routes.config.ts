// src/configs/routes.config/routes.config.ts
import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [
    // Landing page como ruta principal
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    // Otras rutas públicas
    ...authRoute
]

export const protectedRoutes: Routes = [
    // Dashboard principal después de iniciar sesión
    {
        key: 'servicios',
        path: '/servicios',
        component: lazy(() => import('@/views/Servicios')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    // Rutas de servicios protegidas
    {
        key: 'servicios.tesista',
        path: '/servicio/tesista',
        component: lazy(() => import('@/views/ServicePages/TesistaService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    {
        key: 'servicios.docente',
        path: '/servicio/docente',
        component: lazy(() => import('@/views/ServicePages/DocenteService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    ...othersRoute,
]

// src/configs/routes.config/routes.config.ts
export const unrestrictedRoutes: Routes = [
    {
        key: 'test',
        path: '/test',
        component: lazy(() => import('@/views/Test')),
        authority: [],
    },
    // Más rutas sin restricciones...
]