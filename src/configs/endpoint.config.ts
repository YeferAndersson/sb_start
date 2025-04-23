// src/configs/endpoint.config.ts
export const apiPrefix = '/api'

const endpointConfig = {
    // Endpoints de autenticación
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    signUp: '/auth/sign-up',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyDocIdentity: '/auth/verify-doc-identity',
    
    // Endpoints para usuarios
    getUser: '/users/profile',
    updateUser: '/users/update',
    
    // Otros endpoints de la aplicación
    // ...
}

export default endpointConfig