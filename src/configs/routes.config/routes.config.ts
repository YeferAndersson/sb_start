// src/configs/routes.config/routes.config.ts
import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [
    // Landing page como ruta principal
    {
        key: 'home_anterior',
        path: '/home_anterior',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'landing',
        path: `/home`,
        component: lazy(() => import('@/views/others/Landing')),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
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
    {
        key: 'servicios.coordinador',
        path: '/servicio/coordinador',
        component: lazy(() => import('@/views/ServicePages/CoordinadorService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    {
        key: 'servicios.admin',
        path: '/servicio/admin',
        component: lazy(() => import('@/views/ServicePages/AdminService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    {
        key: 'servicios.director',
        path: '/servicio/director',
        component: lazy(() => import('@/views/ServicePages/DirectorService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    {
        key: 'servicios.subdirector',
        path: '/servicio/subdirector',
        component: lazy(() => import('@/views/ServicePages/SubDirectorService')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },

    {
    key: 'pilar.pregrado.estudiantes.etapa1.tipo-proyecto',
    path: '/pilar/pregrado/estudiantes/etapa1/tipo-proyecto',
    component: lazy(() => import('@/views/ServicePages/TesistaService/Etapa1/TipoProyecto')),
    authority: [],
    meta: {
        pageContainerType: 'contained',
        footer: false,
    }
    },
    {
        key: 'pilar.pregrado.estudiantes.etapa1.completar',
        path: '/pilar/pregrado/estudiantes/etapa1/completar',
        component: lazy(() => import('@/views/ServicePages/TesistaService/Etapa1/Completar')),
        authority: [],
        meta: {
            pageContainerType: 'contained',
            footer: false,
        }
    },
    {
        key: 'pilar.pregrado.estudiantes.etapa1.resumen',
        path: '/pilar/pregrado/estudiantes/etapa1/resumen',
        component: lazy(() => import('@/views/ServicePages/TesistaService/Etapa1/Resumen')),
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
    {
        key: 'support',
        path: '/support/*',
        component: lazy(() => import('@/views/support/SupportRouter')),
        authority: [], // Sin restricciones de autoridad
        meta: {
            pageContainerType: 'gutterless',
            layout: 'topBarClassic',
            footer: false,
        }
    },
    // Más rutas sin restricciones...
]