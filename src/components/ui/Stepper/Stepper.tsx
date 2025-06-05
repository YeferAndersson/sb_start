// src/components/ui/Stepper/Stepper.tsx
import { motion } from 'motion/react'
import classNames from '@/utils/classNames'
import { PiCheckBold } from 'react-icons/pi'

export interface StepperStep {
    id: string
    title: string
    description?: string
    icon?: React.ReactNode
}

export interface StepperProps {
    steps: StepperStep[]
    currentStep: number
    className?: string
    orientation?: 'horizontal' | 'vertical'
    size?: 'sm' | 'md' | 'lg'
}

const Stepper = ({
    steps,
    currentStep,
    className,
    orientation = 'horizontal',
    size = 'md'
}: StepperProps) => {
    const sizeClasses = {
        sm: {
            circle: 'h-8 w-8',
            icon: 'h-3 w-3',
            title: 'text-sm',
            description: 'text-xs'
        },
        md: {
            circle: 'h-10 w-10',
            icon: 'h-4 w-4',
            title: 'text-sm',
            description: 'text-xs'
        },
        lg: {
            circle: 'h-12 w-12',
            icon: 'h-5 w-5',
            title: 'text-base',
            description: 'text-sm'
        }
    }

    const currentSizeClasses = sizeClasses[size]

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed'
        if (stepIndex === currentStep) return 'active'
        return 'pending'
    }

    const getStepClasses = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    circle: 'bg-green-500 border-green-500 text-white',
                    line: 'bg-green-500',
                    title: 'text-green-600 dark:text-green-400 font-medium',
                    description: 'text-green-500 dark:text-green-400'
                }
            case 'active':
                return {
                    circle: 'bg-blue-500 border-blue-500 text-white shadow-lg ring-4 ring-blue-500/20',
                    line: 'bg-gray-200 dark:bg-gray-700',
                    title: 'text-blue-600 dark:text-blue-400 font-medium',
                    description: 'text-blue-500 dark:text-blue-400'
                }
            default:
                return {
                    circle: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
                    line: 'bg-gray-200 dark:bg-gray-700',
                    title: 'text-gray-500 dark:text-gray-400',
                    description: 'text-gray-400 dark:text-gray-500'
                }
        }
    }

    if (orientation === 'vertical') {
        return (
            <div className={classNames('flex flex-col', className)}>
                {steps.map((step, index) => {
                    const status = getStepStatus(index)
                    const stepClasses = getStepClasses(status)
                    
                    return (
                        <div key={step.id} className="flex">
                            <div className="flex flex-col items-center">
                                {/* Circle */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={classNames(
                                        'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-300',
                                        currentSizeClasses.circle,
                                        stepClasses.circle
                                    )}
                                >
                                    {status === 'completed' ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <PiCheckBold className={currentSizeClasses.icon} />
                                        </motion.div>
                                    ) : step.icon ? (
                                        step.icon
                                    ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    )}
                                </motion.div>
                                
                                {/* Line */}
                                {index < steps.length - 1 && (
                                    <div className="w-px h-12 mt-2 transition-colors duration-300">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: status === 'completed' ? '100%' : '0%' }}
                                            transition={{ delay: index * 0.1 + 0.3 }}
                                            className={classNames('w-full', stepClasses.line)}
                                        />
                                        <div className={classNames('w-full h-full', stepClasses.line)} />
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="ml-4 pb-8">
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.1 }}
                                    className={classNames(
                                        'font-medium transition-colors duration-300',
                                        currentSizeClasses.title,
                                        stepClasses.title
                                    )}
                                >
                                    {step.title}
                                </motion.h3>
                                {step.description && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.2 }}
                                        className={classNames(
                                            'mt-1 transition-colors duration-300',
                                            currentSizeClasses.description,
                                            stepClasses.description
                                        )}
                                    >
                                        {step.description}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={classNames('flex items-center justify-between', className)}>
            {steps.map((step, index) => {
                const status = getStepStatus(index)
                const stepClasses = getStepClasses(status)
                
                return (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center text-center">
                            {/* Circle */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={classNames(
                                    'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-300',
                                    currentSizeClasses.circle,
                                    stepClasses.circle
                                )}
                            >
                                {status === 'completed' ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <PiCheckBold className={currentSizeClasses.icon} />
                                    </motion.div>
                                ) : step.icon ? (
                                    step.icon
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </motion.div>
                            
                            {/* Text */}
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.1 }}
                                className={classNames(
                                    'mt-2 font-medium transition-colors duration-300',
                                    currentSizeClasses.title,
                                    stepClasses.title
                                )}
                            >
                                {step.title}
                            </motion.h3>
                            {step.description && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                    className={classNames(
                                        'mt-1 transition-colors duration-300 max-w-24',
                                        currentSizeClasses.description,
                                        stepClasses.description
                                    )}
                                >
                                    {step.description}
                                </motion.p>
                            )}
                        </div>
                        
                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-px mx-4 transition-colors duration-300 relative">
                                <div className={classNames('w-full h-full', stepClasses.line)} />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: status === 'completed' ? '100%' : '0%' }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className="absolute top-0 left-0 h-full bg-green-500"
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default Stepper