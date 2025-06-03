// src/store/authStore.ts
import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserRole, UserWithRole } from '@/@types/auth'
import type { TblUsuario } from '@/lib/supabase'

type Session = {
    signedIn: boolean
}

type AuthState = {
    session: Session
    user: UserWithRole
    userData: TblUsuario | null
    userRoles: UserRole[]
    isLoading: boolean
}

type AuthAction = {
    setSessionSignedIn: (payload: boolean) => void
    setUser: (payload: User) => void
    setUserData: (payload: TblUsuario) => void
    setUserRoles: (payload: UserRole[]) => void
    setLoading: (payload: boolean) => void
    hasRole: (role: UserRole) => boolean
    canAccessService: (serviceId: number) => boolean
    isOwner: (resourceUserId: number) => boolean
    reset: () => void
}

const getPersistStorage = () => {
    if (appConfig.accessTokenPersistStrategy === 'localStorage') {
        return localStorage
    }

    if (appConfig.accessTokenPersistStrategy === 'sessionStorage') {
        return sessionStorage
    }

    return cookiesStorage
}

const initialState: AuthState = {
    session: {
        signedIn: false,
    },
    user: {
        avatar: '',
        userName: '',
        email: '',
        authority: [],
        roles: []
    },
    userData: null,
    userRoles: [],
    isLoading: false
}

export const useSessionUser = create<AuthState & AuthAction>()(
    persist(
        (set, get) => ({
            ...initialState,
            setSessionSignedIn: (payload) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: payload,
                    },
                })),
            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),
            setUserData: (payload) =>
                set(() => ({
                    userData: payload,
                })),
            setUserRoles: (payload) =>
                set((state) => ({
                    userRoles: payload,
                    user: {
                        ...state.user,
                        roles: payload
                    }
                })),
            setLoading: (payload) =>
                set(() => ({
                    isLoading: payload,
                })),
            hasRole: (role) => {
                const state = get()
                return state.userRoles.includes(role)
            },
            canAccessService: (serviceId) => {
                // Esta función debería verificar en los servicios del usuario
                // Por ahora retorna true, pero debería implementarse con la lógica real
                return true
            },
            isOwner: (resourceUserId) => {
                const state = get()
                return state.userData?.id === resourceUserId
            },
            reset: () =>
                set(() => ({
                    ...initialState
                }))
        }),
        { 
            name: 'sessionUser', 
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                session: state.session,
                user: state.user,
                userData: state.userData,
                userRoles: state.userRoles
            })
        },
    ),
)

export const useToken = () => {
    const storage = getPersistStorage()

    const setToken = (token: string) => {
        storage.setItem(TOKEN_NAME_IN_STORAGE, token)
    }

    const clearToken = () => {
        storage.removeItem(TOKEN_NAME_IN_STORAGE)
    }

    return {
        setToken,
        clearToken,
        token: storage.getItem(TOKEN_NAME_IN_STORAGE),
    }
}