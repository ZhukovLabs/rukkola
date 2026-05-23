'use client'

import React, { useState } from 'react'
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
import { useMutation } from '@tanstack/react-query'
import { updatePassword } from './actions'
import { useSession } from '@/lib/auth/auth-context'
import { passwordSchema, type PasswordFormData } from './validation'
import { useToast } from '@/components/toast-container'

import { InputField } from '@/components/input-field'

export const PasswordChangeForm = () => {
    const { data } = useSession()
    const [serverError, setServerError] = useState('')
    const [serverSuccess, setServerSuccess] = useState('')
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const toast = useToast()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema)
    })

    const updateMutation = useMutation({
        mutationFn: (values: PasswordFormData) => {
            if (!data) throw new Error('Пользователь не авторизован')
            return updatePassword(data.user.id, values.oldPassword, values.newPassword)
        },
        onSuccess: (res) => {
            if (res?.success) {
                setServerSuccess(res.message ?? 'Пароль успешно изменён')
                toast.showSuccess(res.message ?? 'Пароль успешно изменён')
                reset()
            } else {
                setServerError(res?.message ?? 'Ошибка при изменении пароля')
                toast.showError(res?.message ?? 'Ошибка при изменении пароля')
            }
        },
        onError: (e) => {
            const message = (e as { message?: string })?.message ?? 'Ошибка при изменении пароля'
            setServerError(message)
            toast.showError(message)
        },
    })

    const onSubmit = (values: PasswordFormData) => {
        setServerError('')
        setServerSuccess('')

        if (!data) {
            setServerError('Пользователь не авторизован')
            toast.showError('Пользователь не авторизован')
            return
        }

        updateMutation.mutate(values)
    }

    const renderInput = (label: string, field: keyof PasswordFormData, show: boolean, setShow: (b: boolean) => void) => (
        <Box>
            <Text mb={2} color="gray.400" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                {label}
            </Text>
            <InputField
                icon={<FiLock />}
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                register={register(field)}
                error={errors[field]}
                rightElement={
                    <IconButton
                        size="xs"
                        aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
                        variant="ghost"
                        onClick={() => setShow(!show)}
                        color="gray.400"
                        _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                        borderRadius="md"
                    >
                        {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </IconButton>
                }
            />
        </Box>
    )

    return (
        <Box>
            <Flex align="center" gap={4} mb={10}>
                <Box 
                    bg="whiteAlpha.100" 
                    p={3.5} 
                    rounded="2xl" 
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    shadow="inner"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <FiLock size={24} color="white" />
                </Box>
                <VStack align="start" gap={0}>
                    <Text fontSize="2xl" color="white" fontWeight="extrabold" letterSpacing="tight">
                        Безопасность
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Обновите пароль для защиты вашего аккаунта
                    </Text>
                </VStack>
            </Flex>

            <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={6} align="stretch" maxW={500}>
                    {renderInput('Текущий пароль', 'oldPassword', showOld, setShowOld)}
                    {renderInput('Новый пароль', 'newPassword', showNew, setShowNew)}
                    {renderInput('Подтвердите новый пароль', 'confirmPassword', showConfirm, setShowConfirm)}

                    {serverError && (
                        <Alert.Root status="error" borderRadius="xl" bg="red.950/30" border="1px solid" borderColor="red.900/50">
                            <Alert.Indicator color="red.400">
                                <FiAlertTriangle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title color="red.200" fontWeight="bold">Ошибка</Alert.Title>
                                <Alert.Description color="red.300/80">{serverError}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    {serverSuccess && (
                        <Alert.Root status="success" borderRadius="xl" bg="green.950/30" border="1px solid" borderColor="green.900/50">
                            <Alert.Indicator color="green.400">
                                <FiCheckCircle />
                            </Alert.Indicator>
                            <Alert.Content>
                                <Alert.Title color="green.200" fontWeight="bold">Успех</Alert.Title>
                                <Alert.Description color="green.300/80">{serverSuccess}</Alert.Description>
                            </Alert.Content>
                        </Alert.Root>
                    )}

                    <Button
                        mt={4}
                        size="lg"
                        type="submit"
                        loading={updateMutation.isPending}
                        loadingText="Сохранение..."
                        bg="white"
                        color="gray.950"
                        _hover={{ 
                            bg: 'gray.100', 
                            shadow: '0 0 30px rgba(255,255,255,0.2)',
                            transform: 'translateY(-1px)'
                        }}
                        _active={{ transform: 'scale(0.98)' }}
                        borderRadius="2xl"
                        fontWeight="bold"
                        transition="all 0.2s ease"
                        w="full"
                    >
                        Обновить пароль
                    </Button>
                </VStack>
            </form>
        </Box>
    )
}
