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
    /** Example purpose only, please remove */
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
    ...othersRoute,
]
