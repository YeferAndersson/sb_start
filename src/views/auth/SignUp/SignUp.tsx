// src/views/auth/SignUp/SignUp.tsx
import { motion } from 'motion/react'
import Logo from '@/components/template/Logo'
import SignUpFormStepper from './components/SignUpFormStepper'
import ActionLink from '@/components/shared/ActionLink'
import { useThemeStore } from '@/store/themeStore'

type SignUpProps = {
    disableSubmit?: boolean
    signInUrl?: string
}

export const SignUpBase = ({
    signInUrl = '/sign-in',
    disableSubmit,
}: SignUpProps) => {
    const mode = useThemeStore((state) => state.mode)

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <Logo
                        type="streamline"
                        mode={mode}
                        imgClass="mx-auto"
                        logoWidth={60}
                    />
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8 text-center"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Crear Nueva Cuenta
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Complete el proceso de registro paso a paso
                    </p>
                </motion.div>

                {/* Form Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
                >
                    <SignUpFormStepper disableSubmit={disableSubmit} />
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-8 text-center"
                >
                    <span className="text-gray-600 dark:text-gray-400">¿Ya tienes una cuenta? </span>
                    <ActionLink
                        to={signInUrl}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        themeColor={false}
                    >
                        Iniciar sesión
                    </ActionLink>
                </motion.div>
            </motion.div>
        </div>
    )
}

const SignUp = () => {
    return <SignUpBase />
}

export default SignUp