// src/App.tsx - Aplicación principal mejorada

import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import { ToastProvider } from '@/components/shared/Toast/ToastProvider'
import ErrorBoundary from '@/components/shared/ErrorBoundary/ErrorBoundary'
import Views from '@/views'

function App() {
    return (
        // 🛡️ CAPA 1: ErrorBoundary - Captura errores no controlados en toda la app
        <ErrorBoundary>
            {/* 🎨 CAPA 2: Theme - Manejo de temas (light/dark) y variables CSS */}
            <Theme>
                {/* 🍞 CAPA 3: ToastProvider - Sistema global de notificaciones toast */}
                <ToastProvider>
                    {/* 🧭 CAPA 4: BrowserRouter - Manejo de rutas de la aplicación */}
                    <BrowserRouter>
                        {/* 🔐 CAPA 5: AuthProvider - Estado global de autenticación */}
                        <AuthProvider>
                            {/* 📐 CAPA 6: Layout - Estructura visual (header, sidebar, etc.) */}
                            <Layout>
                                {/* 📱 CAPA 7: Views - Contenido principal de la aplicación */}
                                <Views />
                            </Layout>
                        </AuthProvider>
                    </BrowserRouter>
                </ToastProvider>
            </Theme>
        </ErrorBoundary>
    )
}

export default App