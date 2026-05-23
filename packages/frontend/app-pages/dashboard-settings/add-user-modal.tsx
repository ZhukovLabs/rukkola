'use client'

import React, {useState} from 'react'
import {
    Dialog,
    Button,
    Flex,
    Stack,
    VStack,
    Input,
    Text,
    Heading,
    IconButton,
    Field,
    Alert,
    Portal,
} from '@chakra-ui/react'
import {Select, createListCollection} from '@chakra-ui/react'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {createUser} from './actions'
import {FiX, FiEye, FiEyeOff} from 'react-icons/fi'
import {useToast} from '@/components/toast-container'
import {userSchema, type UserFormData} from './validation'

const roles = createListCollection({
    items: [
        {label: 'Администратор', value: 'admin'},
        {label: 'Модератор', value: 'moderator'},
    ],
})

type FormValues = UserFormData

type AddUserModalProps = {
    isOpen: boolean
    onClose: () => void
    onUserAdded: () => void
}

export const AddUserModal = ({isOpen, onClose, onUserAdded}: AddUserModalProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const toast = useToast()
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            password: '',
            name: '',
            surname: '',
            patronymic: '',
            role: 'moderator',
        },
    })

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({queryKey: ['users']})
                reset()
                onClose()
                onUserAdded()
                toast.showSuccess('Пользователь успешно создан')
            } else {
                toast.showError(res.message || 'Ошибка при создании пользователя')
            }
        },
        onError: (e: unknown) => {
            const message = e instanceof Error ? e.message : 'Ошибка при создании пользователя'
            toast.showError(message)
        },
    })

    const onSubmit = (data: FormValues) => {
        createMutation.mutate(data)
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose} size="lg">
            <Dialog.Backdrop
                bg="blackAlpha.800"
                backdropFilter="blur(12px)"
            />

            <Dialog.Positioner>
                <Dialog.Content
                    bg="gray.950"
                    borderRadius="3xl"
                    shadow="dark-lg"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    color="white"
                    overflow="hidden"
                >
                    <Dialog.Header py={6} px={8} bg="whiteAlpha.50" borderBottom="1px solid" borderColor="whiteAlpha.100">
                        <Flex justify="space-between" align="center">
                            <VStack align="start" gap={0}>
                                <Dialog.Title fontSize="xl" fontWeight="extrabold" color="white" letterSpacing="tight">
                                    Новый пользователь
                                </Dialog.Title>
                                <Text fontSize="xs" color="gray.400">
                                    Заполните данные для создания аккаунта
                                </Text>
                            </VStack>

                            <Dialog.CloseTrigger asChild>
                                <IconButton
                                    aria-label="Закрыть"
                                    size="sm"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{color: 'white', bg: 'whiteAlpha.100'}}
                                    borderRadius="xl"
                                >
                                    <FiX size={20}/>
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>
                    </Dialog.Header>

                    <Dialog.Body px={8} pt={8} pb={10}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack gap={6}>
                                {createMutation.isError && (
                                    <Alert.Root status="error" borderRadius="xl" bg="red.950/30" border="1px solid" borderColor="red.900/50">
                                        <Alert.Content>
                                            <Alert.Description color="red.300/80" fontSize="sm">
                                                {createMutation.error instanceof Error ? createMutation.error.message : 'Ошибка при создании пользователя'}
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert.Root>
                                )}

                                <Flex gap={6}>
                                    {/* Логин */}
                                    <Field.Root invalid={!!errors.username} flex={1}>
                                        <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>
                                            Логин
                                        </Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.900"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                            borderRadius="xl"
                                            _placeholder={{color: 'gray.600'}}
                                            _hover={{borderColor: 'whiteAlpha.300'}}
                                            _focus={{
                                                borderColor: 'white',
                                                boxShadow: '0 0 0 1px white',
                                            }}
                                            transition="all 0.2s"
                                            {...register('username')}
                                            onChange={(e) => {
                                                e.target.value = e.target.value.toLowerCase()
                                                register('username').onChange(e)
                                            }}
                                        />
                                        <Field.ErrorText fontSize="xs" color="red.400">{errors.username?.message}</Field.ErrorText>
                                    </Field.Root>

                                    <Field.Root invalid={!!errors.password} flex={1}>
                                        <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>
                                            Пароль
                                        </Field.Label>
                                        <Flex position="relative" w="full">
                                            <Input
                                                px={4}
                                                py={3}
                                                type={showPassword ? 'text' : 'password'}
                                                bg="gray.900"
                                                border="1px solid"
                                                borderColor="whiteAlpha.200"
                                                borderRadius="xl"
                                                _placeholder={{color: 'gray.600'}}
                                                _hover={{borderColor: 'whiteAlpha.300'}}
                                                _focus={{
                                                    borderColor: 'white',
                                                    boxShadow: '0 0 0 1px white',
                                                }}
                                                transition="all 0.2s"
                                                flex={1}
                                                {...register('password')}
                                            />
                                            <IconButton
                                                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                                size="sm"
                                                variant="ghost"
                                                color="gray.400"
                                                _hover={{color: 'white', bg: 'whiteAlpha.100'}}
                                                position="absolute"
                                                right="2"
                                                top="50%"
                                                transform="translateY(-50%)"
                                                onClick={() => setShowPassword(!showPassword)}
                                                borderRadius="lg"
                                            >
                                                {showPassword ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                                            </IconButton>
                                        </Flex>
                                        <Field.ErrorText fontSize="xs" color="red.400">{errors.password?.message}</Field.ErrorText>
                                    </Field.Root>
                                </Flex>

                                {/* Имя */}
                                <Field.Root invalid={!!errors.name}>
                                    <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>
                                        Имя / Название
                                    </Field.Label>
                                    <Input
                                        px={4}
                                        py={3}
                                        bg="gray.900"
                                        border="1px solid"
                                        borderColor="whiteAlpha.200"
                                        borderRadius="xl"
                                        _placeholder={{color: 'gray.600'}}
                                        _hover={{borderColor: 'whiteAlpha.300'}}
                                        _focus={{
                                            borderColor: 'white',
                                            boxShadow: '0 0 0 1px white',
                                        }}
                                        transition="all 0.2s"
                                        {...register('name')}
                                    />
                                    <Field.ErrorText fontSize="xs" color="red.400">{errors.name?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Фамилия и Отчество */}
                                <Flex gap={6}>
                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>
                                            Фамилия <Text as="span" textTransform="none" letterSpacing="normal" fontWeight="normal" opacity={0.6}>(необязательно)</Text>
                                        </Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.900"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                            borderRadius="xl"
                                            _placeholder={{color: 'gray.600'}}
                                            _hover={{borderColor: 'whiteAlpha.300'}}
                                            _focus={{
                                                borderColor: 'white',
                                                boxShadow: '0 0 0 1px white',
                                            }}
                                            transition="all 0.2s"
                                            {...register('surname')}
                                        />
                                    </Field.Root>

                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>
                                            Отчество <Text as="span" textTransform="none" letterSpacing="normal" fontWeight="normal" opacity={0.6}>(необязательно)</Text>
                                        </Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.900"
                                            border="1px solid"
                                            borderColor="whiteAlpha.200"
                                            borderRadius="xl"
                                            _placeholder={{color: 'gray.600'}}
                                            _hover={{borderColor: 'whiteAlpha.300'}}
                                            _focus={{
                                                borderColor: 'white',
                                                boxShadow: '0 0 0 1px white',
                                            }}
                                            transition="all 0.2s"
                                            {...register('patronymic')}
                                        />
                                    </Field.Root>
                                </Flex>

                                {/* Роль */}
                                <Field.Root>
                                    <Field.Label fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={2}>Роль</Field.Label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({field}) => (
                                            <Select.Root
                                                collection={roles}
                                                value={[field.value]}
                                                onValueChange={(details) => field.onChange(details.value[0])}
                                            >
                                                <Select.Control>
                                                    <Select.Trigger
                                                        px={4}
                                                        py={3}
                                                        bg="gray.900"
                                                        border="1px solid"
                                                        borderColor="whiteAlpha.200"
                                                        borderRadius="xl"
                                                        _hover={{borderColor: 'whiteAlpha.300'}}
                                                        _focus={{
                                                            borderColor: 'white',
                                                            boxShadow: '0 0 0 1px white',
                                                        }}
                                                        transition="all 0.2s"
                                                    >
                                                        <Select.ValueText placeholder="Выберите роль" fontSize="sm"/>
                                                        <Select.Indicator/>
                                                    </Select.Trigger>
                                                </Select.Control>

                                                <Portal>
                                                    <Select.Positioner>
                                                        <Select.Content bg="gray.950" borderColor="whiteAlpha.200" borderRadius="xl" shadow="2xl">
                                                            {roles.items.map((item) => (
                                                                <Select.Item key={item.value} item={item} px={3} py={2} _hover={{ bg: 'whiteAlpha.100' }} cursor="pointer">
                                                                    <Select.ItemText fontSize="sm">{item.label}</Select.ItemText>
                                                                    <Select.ItemIndicator/>
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                            </Select.Root>
                                        )}
                                    />
                                </Field.Root>
                            </Stack>

                            <Flex gap={4} mt={12} justify="flex-end">
                                <Button
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{bg: 'whiteAlpha.100', color: 'white'}}
                                    onClick={onClose}
                                    disabled={createMutation.isPending}
                                    px={8}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                >
                                    Отмена
                                </Button>

                                <Button
                                    px={10}
                                    type="submit"
                                    bg="white"
                                    color="gray.950"
                                    loading={createMutation.isPending}
                                    borderRadius="xl"
                                    fontWeight="bold"
                                    _hover={{
                                        bg: 'gray.100',
                                        shadow: '0 0 20px rgba(255,255,255,0.2)',
                                        transform: 'translateY(-1px)'
                                    }}
                                    _active={{ transform: 'scale(0.98)' }}
                                >
                                    Создать аккаунт
                                </Button>
                            </Flex>
                        </form>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}
