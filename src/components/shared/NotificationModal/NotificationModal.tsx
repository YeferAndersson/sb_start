// src/components/shared/NotificationModal/NotificationModal.tsx
import { motion } from 'motion/react'
import Modal from '@/components/ui/Modal/Modal'
import Button from '@/components/ui/Button'
import { PiEnvelopeBold, PiUserBold } from 'react-icons/pi'
import type { ReactNode } from 'react'

export interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string | ReactNode
    variant?: 'success' | 'warning' | 'error' | 'info'
    actionLabel?: string
    onAction?: () => void
    showCloseButton?: boolean
}

const NotificationModal = ({
    isOpen,
    onClose,
    title,
    message,
    variant = 'info',
    actionLabel = 'Entendido',
    onAction,
    showCloseButton = true
}: NotificationModalProps) => {
    const handleAction = () => {
        if (onAction) {
            onAction()
        }
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            variant={variant}
            size="md"
            showCloseButton={showCloseButton}
        >
            <div className="space-y-6">
                <div className="text-gray-600 dark:text-gray-300">
                    {typeof message === 'string' ? (
                        <p className="leading-relaxed">{message}</p>
                    ) : (
                        message
                    )}
                </div>
                
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="solid"
                        size="md"
                        onClick={handleAction}
                        className="min-w-24"
                    >
                        {actionLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

// Componente específico para verificación de email
export const EmailVerificationModal = ({ 
    isOpen, 
    onClose, 
    email 
}: { 
    isOpen: boolean
    onClose: () => void
    email: string 
}) => {
    return (
        <NotificationModal
            isOpen={isOpen}
            onClose={onClose}
            title="¡Registro Exitoso!"
            variant="success"
            actionLabel="Ir a mi correo"
            onAction={() => {
                // Intenta abrir el cliente de correo predeterminado
                window.open(`mailto:${email}`, '_blank')
            }}
            message={
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                                type: "spring", 
                                damping: 15, 
                                stiffness: 300,
                                delay: 0.2 
                            }}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                        >
                            <PiEnvelopeBold className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </motion.div>
                    </div>
                    
                    <div className="text-center space-y-2">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                            Tu cuenta ha sido creada exitosamente
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Hemos enviado un enlace de verificación a:
                        </p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                            {email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.
                        </p>
                    </div>
                </div>
            }
        />
    )
}

// Componente específico para errores de correo existente
export const ExistingEmailModal = ({ 
    isOpen, 
    onClose, 
    email,
    onSignIn
}: { 
    isOpen: boolean
    onClose: () => void
    email: string
    onSignIn?: () => void
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Correo ya registrado"
            variant="warning"
            size="md"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring", 
                            damping: 15, 
                            stiffness: 300,
                            delay: 0.2 
                        }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
                    >
                        <PiUserBold className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                </div>
                
                <div className="text-center space-y-3">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                        Ya existe una cuenta con este correo electrónico
                    </p>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                        {email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        Si esta es tu cuenta, intenta iniciar sesión. Si olvidaste tu contraseña, puedes restablecerla.
                    </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="default"
                        size="md"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="solid"
                        size="md"
                        onClick={() => {
                            if (onSignIn) onSignIn()
                            onClose()
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default NotificationModal