// src/@types/auth.ts
import { TblUsuario } from '@/lib/supabase'

export type SignInCredential = {
    email: string
    password: string
}

export type UserDetails = {
    tipoDocIdentidad?: string
    numDocIdentidad?: string
    apellido?: string
    pais?: string
    direccion?: string
    sexo?: string
    telefono?: string
    fechaNacimiento?: Date | string
    existingUserId?: number
}

export type SignUpCredential = {
    userName: string
    email: string
    password: string
    userDetails?: UserDetails
}

export type VerifyDocIdentityRequest = {
    tipoDocIdentidad: string
    numDocIdentidad: string
}

export type VerifyDocIdentityResponse = {
    exists: boolean
    singleUser?: boolean
    user?: TblUsuario
    users?: TblUsuario[]
    message: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type Token = {
    accessToken: string
}

export type User = {
    userId?: string
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
    id?: number
}

export type SignInResponse = {
    token: string
    user: User
}

export type SignUpResponse = {
    token: string
    user: User
}

export type AuthResult = Promise<{
    status: 'success' | 'failed'
    message: string
}>

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}

// Nuevos tipos para roles específicos
export type UserRole = 'tesista' | 'docente' | 'coordinador' | 'admin'

export type UserWithRole = User & {
    roles: UserRole[]
    userData?: TblUsuario
}

// Tipos para verificación de permisos
export type PermissionCheck = {
    hasRole: (role: UserRole) => boolean
    canAccessService: (serviceId: number) => boolean
    isOwner: (resourceUserId: number) => boolean
}

// Constantes para tipos de documento
export const TIPOS_DOCUMENTO = {
    DNI: 'DNI',
    CE: 'CE',
    PASSPORT: 'PASSPORT'
} as const

export type TipoDocumento = keyof typeof TIPOS_DOCUMENTO

// Constantes para sexo/género
export const SEXOS = {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro'
} as const

export type Sexo = keyof typeof SEXOS