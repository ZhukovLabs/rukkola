'use client'

import React, { useState, useTransition } from 'react'
import {
    Alert,
    Box,
    Input,
    Button,
    Text,
    VStack,
    Flex,
    IconButton,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiAlertTriangle, FiCheckCircle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import { updatePassword } from './actions'
import { useSession } from '@/lib/auth/auth-context'
import { passwordSchema, type PasswordFormData } from './validation'
import { useToast } from '@/components/toast-container'

export const PasswordChangeForm = () => {
    const { data } = useSession()
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState('')
    const [serverSuccess, setServerSuccess] = useState('')
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const toast = useToast()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema)
    })

    const onSubmit = (values: PasswordFormData) => {
        setServerError('')
        setServerSuccess('')

        startTransition(() => {
            (async () => {
                if (!data) {
                    setServerError('Пользователь не авторизован')
                    toast.showError('Пользователь не авторизован')
                    return
                }

                try {
                    const res = await updatePassword(data.user.id, values.oldPassword, values.newPassword)

                    if (res?.success) {
                        setServerSuccess(res.message ?? 'Пароль успешно изменён')
                        toast.showSuccess(res.message ?? 'Пароль успешно изменён')
                        reset()
                    } else {
                        setServerError(res?.message ?? 'Ошибка при изменении пароля')
                        toast.showError(res?.message ?? 'Ошибка при изменении пароля')
                    }
                } catch (e) {
                    const message = (e as { message?: string })?.message ?? 'Ошибка при изменении пароля'
                    setServerError(message)
                    toast.showError(message)
                }
            })()
        })
    }

    const fieldErrorText = (fieldName: keyof PasswordFormData) =>
        errors[fieldName] ? String(errors[fieldName]?.message) : ''

    const renderInput = (label: string, field: keyof PasswordFormData, show: boolean, setShow: (b: boolean) => void) => (
        <Box>
            <Text mb={2} color="gray.200" fontWeight="medium">{label}</Text>
            <Box position="relative">
                <Input
                    p={2}
                    type={show ? 'text' : 'password'}
                    bg="gray.900"
                    color="gray.200"
                    borderColor={fieldErrorText(field) ? 'red.700' : 'gray.700'}
                    _focus={{
                        borderColor: fieldErrorText(field) ? 'red.600' : 'gray.400',
                        boxShadow: fieldErrorText(field) ? '0 0 8px rgba(255,90,90,0.14)' : '0 0 10px rgba(128,128,128,0.4)'
                    }}
                    _hover={{ borderColor: 'gray.600' }}
                    rounded="lg"
                    size="md"
                    {...register(field)}
                />
                <IconButton
                    size="sm"
                    aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
                    variant="ghost"
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={() => setShow(!show)}
                    color="gray.200"
                    _hover={{ bg: 'blackAlpha.400' }}>
                    {show ? <FiEyeOff /> : <FiEye />}
                </IconButton>
            </Box>
            {fieldErrorText(field) && (
                <Text mt={2} color="red.300" fontSize="sm">{fieldErrorText(field)}</Text>
            )}
        </Box>
    )

    return (
        <Box>
            <Flex align="center" gap={3} mb={6}>
                <Box bg="gray.700" p={3} rounded="full" boxShadow="0 0 15px rgba(128,128,128,0.6)">
                    <FiLock size={20} color="white" />
                </Box>
                <Text fontSize="2xl" fontWeight="bold" bgGradient="linear(to-r, gray.300, gray.100)">
                    Настройки безопасности
                </Text>
            </Flex>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={5} align="stretch" maxW={600}>
                    {renderInput('Текущий пароль', 'oldPassword', showOld, setShowOld)}
                    {renderInput('Новый пароль', 'newPassword', showNew, setShowNew)}
                    {renderInput('Подтвердите новый пароль', 'confirmPassword', showConfirm, setShowConfirm)}

                    {serverError && (
                        <Alert.Root>
                            <Alert.Indicator>
                                <FiAlertTriangle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title fontWeight="bold">Ошибка</Alert.Title>
                                <Alert.Description>{serverError}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    {serverSuccess && (
                        <Alert.Root>
                            <Alert.Indicator>
                                <FiCheckCircle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title fontWeight="bold">Успех</Alert.Title>
                                <Alert.Description>{serverSuccess}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    <Button
                        mt={2}
                        size="md"
                        type="submit"
                        loading={isPending}
                        loadingText="Сохранение..."
                        bg="gray.500"
                        color="whitesmoke"
                        _hover={{ bg: 'gray.400', boxShadow: '0 0 20px rgba(128,128,128,0.4)' }}
                        _active={{ transform: 'scale(0.98)' }}
                        rounded="xl"
                        transition="all 0.2s ease"
                    >
                        Сохранить изменения
                    </Button>
                </VStack>
            </form>
        </Box>
    )
}
