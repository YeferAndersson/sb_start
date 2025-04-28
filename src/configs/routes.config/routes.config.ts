// src/configs/routes.config/routes.config.ts
import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
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