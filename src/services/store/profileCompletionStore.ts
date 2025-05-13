// src/store/profileCompletionStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfileCompletionState {
    pendingCompletion: boolean
    userId: string | null
    temporaryToken: string | null
    email: string | null // Nuevo campo para almacenar el email
    setPendingCompletion: (pending: boolean) => void
    setUserData: (userId: string, token: string, email?: string | null) => void // Email opcional para compatibilidad
    reset: () => void
}

export const useProfileCompletionStore = create<ProfileCompletionState>()(
    persist(
        (set) => ({
            pendingCompletion: false,
            userId: null,
            temporaryToken: null,
            email: null, // Inicializado como null
            setPendingCompletion: (pending) => set(() => ({ pendingCompletion: pending })),
            setUserData: (userId, token, email = null) => {
                // Guardar también en localStorage como respaldo
                if (token) localStorage.setItem('temp-profile-token', token);
                if (email) localStorage.setItem('temp-profile-email', email);
                
                // Establecer en el estado
                set(() => ({ 
                    userId, 
                    temporaryToken: token,
                    email, 
                    pendingCompletion: true 
                }))
            },
            reset: () => set(() => ({ 
                pendingCompletion: false, 
                userId: null, 
                temporaryToken: null,
                email: null // Reseteamos también el email
            })),
        }),
        {
            name: 'profile-completion-status',
        }
    )
)