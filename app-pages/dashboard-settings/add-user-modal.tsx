'use client'

import React, { useState } from 'react'
import {
    Dialog,
    Button,
    Flex,
    Stack,
    Input,
    Text,
    Heading,
    IconButton,
    Field,
} from '@chakra-ui/react'
import { Select, createListCollection } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { UserType } from '@/models/user'
import { createUser } from './actions'
import { FiX } from 'react-icons/fi'

const roles = createListCollection({
    items: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Модератор', value: 'moderator' },
    ],
})

type FormValues = {
    username: string
    password: string
    name: string
    surname?: string
    patronymic?: string
    role: string
}

type AddUserModalProps = {
    isOpen: boolean
    onClose: () => void
    onUserAdded: (user: UserType) => void
}

export const AddUserModal = ({ isOpen, onClose, onUserAdded }: AddUserModalProps) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            username: '',
            password: '',
            name: '',
            surname: '',
            patronymic: '',
            role: 'moderator',
        },
    })

    const onSubmit = async (data: FormValues) => {
        setLoading(true)
        setError(null)

        try {
            const newUser = await createUser(data)
            onUserAdded(newUser)
            onClose()
            reset()
        } catch (e: any) {
            setError(e?.message || 'Ошибка при создании пользователя')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(8px)" />

            <Dialog.Positioner>
                <Dialog.Content
                    maxW="420px"
                    w="full"
                    bg="gray.900"
                    borderRadius="xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor="gray.700"
                    color="white"
                    p={0}
                    overflow="hidden"
                >
                    {/* Заголовок с хорошим внутренним отступом */}
                    <Dialog.Header py={5} px={7} bg="gray.800">
                        <Flex justify="space-between" align="center">
                            <Heading size="md" fontWeight="semibold">
                                Добавить пользователя
                            </Heading>

                            <Dialog.CloseTrigger asChild>
                                <IconButton
                                    aria-label="Закрыть"
                                    size="sm"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ color: 'white', bg: 'gray.700' }}
                                >
                                    <FiX size={18} />
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>
                    </Dialog.Header>

                    {/* Основное тело с комфортными отступами */}
                    <Dialog.Body px={7} pt={6} pb={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack gap={5}>   {/* Увеличил gap для "воздуха" между полями */}
                                {/* Глобальная ошибка */}
                                {error && (
                                    <Text color="red.400" fontSize="sm" textAlign="center">
                                        {error}
                                    </Text>
                                )}

                                {/* Логин */}
                                <Field.Root invalid={!!errors.username}>
                                    <Field.Label fontSize="sm">Логин</Field.Label>
                                    <Input
                                        px={4}   /* Внутренний padding инпута — текст не прижат к краю */
                                        py={3}
                                        bg="gray.800"
                                        border="none"
                                        _placeholder={{ color: 'gray.500' }}
                                        _focus={{
                                            bg: 'gray.700',
                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                        }}
                                        {...register('username', { required: 'Логин обязателен' })}
                                    />
                                    <Field.ErrorText fontSize="xs">{errors.username?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Пароль */}
                                <Field.Root invalid={!!errors.password}>
                                    <Field.Label fontSize="sm">Пароль</Field.Label>
                                    <Input
                                        px={4}
                                        py={3}
                                        type="password"
                                        bg="gray.800"
                                        border="none"
                                        _placeholder={{ color: 'gray.500' }}
                                        _focus={{
                                            bg: 'gray.700',
                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                        }}
                                        {...register('password', {
                                            required: 'Пароль обязателен',
                                            minLength: { value: 6, message: 'Минимум 6 символов' },
                                        })}
                                    />
                                    <Field.ErrorText fontSize="xs">{errors.password?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Имя */}
                                <Field.Root invalid={!!errors.name}>
                                    <Field.Label fontSize="sm">Имя</Field.Label>
                                    <Input
                                        px={4}
                                        py={3}
                                        bg="gray.800"
                                        border="none"
                                        _placeholder={{ color: 'gray.500' }}
                                        _focus={{
                                            bg: 'gray.700',
                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                        }}
                                        {...register('name', { required: 'Имя обязательно' })}
                                    />
                                    <Field.ErrorText fontSize="xs">{errors.name?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Фамилия и Отчество */}
                                <Flex gap={4}>
                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="sm">Фамилия</Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.800"
                                            border="none"
                                            _placeholder={{ color: 'gray.500' }}
                                            _focus={{
                                                bg: 'gray.700',
                                                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                            }}
                                            {...register('surname')}
                                        />
                                    </Field.Root>

                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="sm">Отчество</Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.800"
                                            border="none"
                                            _placeholder={{ color: 'gray.500' }}
                                            _focus={{
                                                bg: 'gray.700',
                                                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                            }}
                                            {...register('patronymic')}
                                        />
                                    </Field.Root>
                                </Flex>

                                {/* Роль */}
                                <Field.Root>
                                    <Field.Label fontSize="sm">Роль</Field.Label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                            <Select.Root
                                                collection={roles}
                                                value={[field.value]}
                                                onValueChange={(details) => field.onChange(details.value[0])}
                                            >
                                                <Select.Control>
                                                    <Select.Trigger
                                                        px={4}
                                                        py={3}
                                                        bg="gray.800"
                                                        border="none"
                                                        _hover={{ bg: 'gray.700' }}
                                                        _focus={{
                                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.4)',
                                                        }}
                                                    >
                                                        <Select.ValueText placeholder="Выберите роль" />
                                                        <Select.IndicatorGroup>
                                                            <Select.Indicator />
                                                        </Select.IndicatorGroup>
                                                    </Select.Trigger>
                                                </Select.Control>

                                                <Select.Positioner>
                                                    <Select.Content bg="gray.800" borderColor="gray.700">
                                                        {roles.items.map((item) => (
                                                            <Select.Item key={item.value} item={item}>
                                                                <Select.ItemText>{item.label}</Select.ItemText>
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                        )}
                                    />
                                </Field.Root>
                            </Stack>

                            <Flex gap={4} mt={8} justify="flex-end">
                                <Button
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ bg: 'gray.700', color: 'white' }}
                                    onClick={onClose}
                                    disabled={loading}
                                    p={2}
                                >
                                    Отмена
                                </Button>

                                <Button
                                    p={2}
                                    type="submit"
                                    colorScheme="teal"
                                    loading={loading}
                                >
                                    Добавить
                                </Button>
                            </Flex>
                        </form>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}