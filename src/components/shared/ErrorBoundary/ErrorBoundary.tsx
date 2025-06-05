// src/components/shared/ErrorBoundary/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'motion/react'
import Button from '@/components/ui/Button'
import { PiWarningOctagonBold, PiArrowClockwiseBold } from 'react-icons/pi'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    }

    private handleReload = () => {
        window.location.reload()
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined })
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex justify-center mb-6"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <PiWarningOctagonBold className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        </motion.div>
                        
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            ¡Ups! Algo salió mal
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Ha ocurrido un error inesperado. Puedes intentar recargar la página o reintentar la operación.
                        </p>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                                    Detalles técnicos
                                </summary>
                                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="default"
                                onClick={this.handleReset}
                                className="flex items-center gap-2"
                            >
                                <PiArrowClockwiseBold className="w-4 h-4" />
                                Reintentar
                            </Button>
                            <Button
                                variant="solid"
                                onClick={this.handleReload}
                            >
                                Recargar Página
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
