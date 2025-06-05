
// Toast System para notificaciones
// src/components/shared/Toast/ToastProvider.tsx
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PiCheckCircleBold, PiWarningCircleBold, PiXCircleBold, PiInfoBold, PiXBold } from 'react-icons/pi'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void
    hideToast: (id: string) => void
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider')
    }
    return context
}

const iconMap = {
    success: PiCheckCircleBold,
    error: PiXCircleBold,
    warning: PiWarningCircleBold,
    info: PiInfoBold
}

const colorMap = {
    success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500',
        title: 'text-green-800 dark:text-green-200',
        message: 'text-green-600 dark:text-green-300'
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-500',
        title: 'text-red-800 dark:text-red-200',
        message: 'text-red-600 dark:text-red-300'
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-500',
        title: 'text-amber-800 dark:text-amber-200',
        message: 'text-amber-600 dark:text-amber-300'
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500',
        title: 'text-blue-800 dark:text-blue-200',
        message: 'text-blue-600 dark:text-blue-300'
    }
}

interface ToastItemProps {
    toast: Toast
    onRemove: (id: string) => void
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
    const Icon = iconMap[toast.type]
    const colors = colorMap[toast.type]

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`
                max-w-sm w-full border rounded-lg shadow-lg backdrop-blur-sm
                ${colors.bg} ${colors.border}
            `}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium ${colors.title}`}>
                            {toast.title}
                        </p>
                        {toast.message && (
                            <p className={`mt-1 text-sm ${colors.message}`}>
                                {toast.message}
                            </p>
                        )}
                        {toast.action && (
                            <div className="mt-3">
                                <button
                                    onClick={toast.action.onClick}
                                    className={`
                                        text-sm font-medium underline hover:no-underline
                                        ${colors.title}
                                    `}
                                >
                                    {toast.action.label}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onRemove(toast.id)}
                            className={`
                                inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${colors.icon} hover:opacity-75
                            `}
                        >
                            <PiXBold className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000
        }

        setToasts(prev => [...prev, newToast])

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                hideToast(id)
            }, newToast.duration)
        }
    }, [])

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const success = useCallback((title: string, message?: string) => {
        showToast({ type: 'success', title, message })
    }, [showToast])

    const error = useCallback((title: string, message?: string) => {
        showToast({ type: 'error', title, message })
    }, [showToast])

    const warning = useCallback((title: string, message?: string) => {
        showToast({ type: 'warning', title, message })
    }, [showToast])

    const info = useCallback((title: string, message?: string) => {
        showToast({ type: 'info', title, message })
    }, [showToast])

    return (
        <ToastContext.Provider value={{
            showToast,
            hideToast,
            success,
            error,
            warning,
            info
        }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
                    <AnimatePresence>
                        {toasts.map(toast => (
                            <div key={toast.id} className="pointer-events-auto">
                                <ToastItem
                                    toast={toast}
                                    onRemove={hideToast}
                                />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    )
}