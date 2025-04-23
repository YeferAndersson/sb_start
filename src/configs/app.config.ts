// src/configs/app.config.ts
export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean
    supabaseUrl: string
    supabaseAnonKey: string
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'es',  // Cambiado a español
    accessTokenPersistStrategy: 'localStorage',  // Cambiado para compatibilidad con Supabase
    enableMock: false,  // Desactivamos mock para usar Supabase real
    activeNavTranslation: false,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
}

export default appConfig