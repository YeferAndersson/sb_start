// src/components/shared/FormValidation/FormValidation.tsx
import { motion, AnimatePresence } from 'motion/react'
import { PiWarningCircleBold, PiCheckCircleBold } from 'react-icons/pi'
import classNames from '@/utils/classNames'

interface ValidationFeedbackProps {
    isValid?: boolean
    isInvalid?: boolean
    message?: string
    showSuccess?: boolean
    className?: string
}

export const ValidationFeedback = ({
    isValid = false,
    isInvalid = false,
    message,
    showSuccess = false,
    className
}: ValidationFeedbackProps) => {
    const showValidation = (isInvalid && message) || (isValid && showSuccess)
    
    return (
        <AnimatePresence>
            {showValidation && (
                <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={classNames(
                        'flex items-center gap-2 mt-2 text-sm',
                        isInvalid && 'text-red-600 dark:text-red-400',
                        isValid && 'text-green-600 dark:text-green-400',
                        className
                    )}
                >
                    {isInvalid && <PiWarningCircleBold className="h-4 w-4 flex-shrink-0" />}
                    {isValid && showSuccess && <PiCheckCircleBold className="h-4 w-4 flex-shrink-0" />}
                    <span>{message || (isValid ? 'Campo válido' : '')}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Hook personalizado para validación en tiempo real
import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

export function useRealtimeValidation<T extends Record<string, any>>(
    form: UseFormReturn<T>,
    fieldName: keyof T,
    validationFn?: (value: any) => string | undefined
) {
    const [isValid, setIsValid] = useState(false)
    const [validationMessage, setValidationMessage] = useState<string>('')
    
    const fieldValue = form.watch(fieldName as any)
    const fieldError = form.formState.errors[fieldName as string]
    
    useEffect(() => {
        if (fieldValue && !fieldError) {
            if (validationFn) {
                const customError = validationFn(fieldValue)
                if (customError) {
                    setIsValid(false)
                    setValidationMessage(customError)
                } else {
                    setIsValid(true)
                    setValidationMessage('')
                }
            } else {
                setIsValid(true)
                setValidationMessage('')
            }
        } else if (fieldError) {
            setIsValid(false)
            setValidationMessage(fieldError.message as string || 'Campo inválido')
        } else {
            setIsValid(false)
            setValidationMessage('')
        }
    }, [fieldValue, fieldError, validationFn])
    
    return {
        isValid: isValid && !!fieldValue,
        isInvalid: !!fieldError || (!!validationMessage && !isValid),
        message: fieldError?.message as string || validationMessage
    }
}

// Componente de Input mejorado con validación visual
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

interface EnhancedInputProps<T extends FieldValues> {
    name: FieldPath<T>
    control: Control<T>
    label: string
    placeholder?: string
    type?: string
    disabled?: boolean
    showSuccess?: boolean
    validationFn?: (value: any) => string | undefined
    form: UseFormReturn<T>
    autoComplete?: string
    className?: string
}

export function EnhancedInput<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    type = 'text',
    disabled = false,
    showSuccess = true,
    validationFn,
    form,
    autoComplete,
    className
}: EnhancedInputProps<T>) {
    const { isValid, isInvalid, message } = useRealtimeValidation(form, name, validationFn)
    
    return (
        <FormItem label={label} className={className}>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            disabled={disabled}
                            className={classNames(
                                'transition-all duration-200',
                                isValid && 'border-green-500 focus:ring-green-500',
                                isInvalid && 'border-red-500 focus:ring-red-500'
                            )}
                            {...field}
                        />
                        <ValidationFeedback
                            isValid={isValid}
                            isInvalid={isInvalid}
                            message={message}
                            showSuccess={showSuccess}
                        />
                    </div>
                )}
            />
        </FormItem>
    )
}

// Validaciones personalizadas comunes
export const customValidations = {
    email: (value: string) => {
        if (!value) return undefined
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? undefined : 'Formato de correo inválido'
    },
    
    password: (value: string) => {
        if (!value) return undefined
        if (value.length < 6) return 'Mínimo 6 caracteres'
        if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una minúscula'
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una mayúscula'
        if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número'
        return undefined
    },
    
    phone: (value: string) => {
        if (!value) return undefined
        const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/
        return phoneRegex.test(value) ? undefined : 'Formato de teléfono inválido'
    },
    
    document: (value: string) => {
        if (!value) return undefined
        if (value.length < 8) return 'Mínimo 8 caracteres'
        if (!/^\d+$/.test(value)) return 'Solo se permiten números'
        return undefined
    },
    
    confirmPassword: (password: string) => (confirmValue: string) => {
        if (!confirmValue) return undefined
        return password === confirmValue ? undefined : 'Las contraseñas no coinciden'
    }
}

export default ValidationFeedback