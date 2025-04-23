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
    fechaNacimiento?: Date
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