'use client'

import React, {useState} from 'react'
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
import {Select, createListCollection} from '@chakra-ui/react'
import {useForm, Controller} from 'react-hook-form'
import {UserType} from '@/models/user'
import {createUser} from './actions'
import {FiX, FiEye, FiEyeOff} from 'react-icons/fi'

const roles = createListCollection({
    items: [
        {label: 'Администратор', value: 'admin'},
        {label: 'Модератор', value: 'moderator'},
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

export const AddUserModal = ({isOpen, onClose, onUserAdded}: AddUserModalProps) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
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
            const res = await createUser(data)

            if (res.success) {
                onUserAdded(res.data!)
                reset()
                onClose()
            } else {
                setError(res.message || 'Ошибка при создании пользователя')
            }
        } catch (e: any) {
            setError(e?.message || 'Ошибка при создании пользователя')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Backdrop
                bg="blackAlpha.600"
                backdropFilter="blur(10px)"
                transition="all 0.3s"
            />

            <Dialog.Positioner>
                <Dialog.Content
                    maxW="480px"
                    w="full"
                    bg="gray.900"
                    borderRadius="2xl"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="gray.700"
                    color="white"
                    overflow="hidden"
                    transition="transform 0.3s, opacity 0.3s"
                >
                    <Dialog.Header py={6} px={8} bg="gray.800">
                        <Flex justify="space-between" align="center">
                            <Heading size="md" fontWeight="bold">
                                Добавить пользователя
                            </Heading>

                            <Dialog.CloseTrigger asChild>
                                <IconButton
                                    aria-label="Закрыть"
                                    size="sm"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{color: 'white', bg: 'gray.700'}}
                                >
                                    <FiX size={20}/>
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>
                    </Dialog.Header>

                    <Dialog.Body px={8} pt={6} pb={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack gap={5}>
                                {error && (
                                    <Text
                                        color="red.400"
                                        fontSize="sm"
                                        textAlign="center"
                                        fontWeight="medium"
                                    >
                                        {error}
                                    </Text>
                                )}

                                {/* Логин */}
                                <Field.Root invalid={!!errors.username}>
                                    <Field.Label fontSize="sm" fontWeight="medium">
                                        Логин
                                    </Field.Label>
                                    <Input
                                        px={4}
                                        py={3}
                                        bg="gray.800"
                                        border="1px solid"
                                        borderColor="gray.700"
                                        borderRadius="lg"
                                        _placeholder={{color: 'gray.500'}}
                                        _hover={{bg: 'gray.700'}}
                                        _focus={{
                                            bg: 'gray.700',
                                            borderColor: 'teal.400',
                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                        }}
                                        transition="all 0.2s"
                                        {...register('username', {required: 'Логин обязателен'})}
                                    />
                                    <Field.ErrorText fontSize="xs">{errors.username?.message}</Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.password}>
                                    <Field.Label fontSize="sm" fontWeight="medium">
                                        Пароль
                                    </Field.Label>
                                    <Flex position="relative" w="full">
                                        <Input
                                            px={4}
                                            py={3}
                                            type={showPassword ? 'text' : 'password'}
                                            bg="gray.800"
                                            border="1px solid"
                                            borderColor="gray.700"
                                            borderRadius="lg"
                                            _placeholder={{color: 'gray.500'}}
                                            _hover={{bg: 'gray.700'}}
                                            _focus={{
                                                bg: 'gray.700',
                                                borderColor: 'teal.400',
                                                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                            }}
                                            transition="all 0.2s"
                                            flex={1}
                                            {...register('password', {
                                                required: 'Пароль обязателен',
                                                minLength: {value: 6, message: 'Минимум 6 символов'},
                                            })}
                                        />
                                        <IconButton
                                            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                                            size="sm"
                                            variant="ghost"
                                            color="gray.400"
                                            _hover={{color: 'white', bg: 'gray.700'}}
                                            position="absolute"
                                            right="2"
                                            top="50%"
                                            transform="translateY(-50%)"
                                            onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <FiEyeOff/> : <FiEye/>}
                                        </IconButton>
                                    </Flex>
                                    <Field.ErrorText fontSize="xs">{errors.password?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Имя */}
                                <Field.Root invalid={!!errors.name}>
                                    <Field.Label fontSize="sm" fontWeight="medium">
                                        Имя
                                    </Field.Label>
                                    <Input
                                        px={4}
                                        py={3}
                                        bg="gray.800"
                                        border="1px solid"
                                        borderColor="gray.700"
                                        borderRadius="lg"
                                        _placeholder={{color: 'gray.500'}}
                                        _hover={{bg: 'gray.700'}}
                                        _focus={{
                                            bg: 'gray.700',
                                            borderColor: 'teal.400',
                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                        }}
                                        transition="all 0.2s"
                                        {...register('name', {required: 'Имя обязательно'})}
                                    />
                                    <Field.ErrorText fontSize="xs">{errors.name?.message}</Field.ErrorText>
                                </Field.Root>

                                {/* Фамилия и Отчество */}
                                <Flex gap={4}>
                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="sm" fontWeight="medium">Фамилия</Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.800"
                                            border="1px solid"
                                            borderColor="gray.700"
                                            borderRadius="lg"
                                            _placeholder={{color: 'gray.500'}}
                                            _hover={{bg: 'gray.700'}}
                                            _focus={{
                                                bg: 'gray.700',
                                                borderColor: 'teal.400',
                                                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                            }}
                                            transition="all 0.2s"
                                            {...register('surname')}
                                        />
                                    </Field.Root>

                                    <Field.Root flex={1}>
                                        <Field.Label fontSize="sm" fontWeight="medium">Отчество</Field.Label>
                                        <Input
                                            px={4}
                                            py={3}
                                            bg="gray.800"
                                            border="1px solid"
                                            borderColor="gray.700"
                                            borderRadius="lg"
                                            _placeholder={{color: 'gray.500'}}
                                            _hover={{bg: 'gray.700'}}
                                            _focus={{
                                                bg: 'gray.700',
                                                borderColor: 'teal.400',
                                                boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                            }}
                                            transition="all 0.2s"
                                            {...register('patronymic')}
                                        />
                                    </Field.Root>
                                </Flex>

                                {/* Роль */}
                                <Field.Root>
                                    <Field.Label fontSize="sm" fontWeight="medium">Роль</Field.Label>
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
                                                        bg="gray.800"
                                                        border="1px solid"
                                                        borderColor="gray.700"
                                                        borderRadius="lg"
                                                        _hover={{bg: 'gray.700'}}
                                                        _focus={{
                                                            boxShadow: '0 0 0 2px rgba(56, 178, 172, 0.3)',
                                                        }}
                                                        transition="all 0.2s"
                                                    >
                                                        <Select.ValueText placeholder="Выберите роль"/>
                                                        <Select.Indicator/>
                                                    </Select.Trigger>
                                                </Select.Control>

                                                <Select.Positioner>
                                                    <Select.Content bg="gray.800" borderColor="gray.700" p={1}>
                                                        {roles.items.map((item) => (
                                                            <Select.Item key={item.value} item={item} p={2}>
                                                                <Select.ItemText>{item.label}</Select.ItemText>
                                                                <Select.ItemIndicator/>
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                        )}
                                    />
                                </Field.Root>
                            </Stack>

                            <Flex gap={4} mt={10} justify="flex-end">
                                <Button
                                    variant="outline"
                                    borderColor="gray.500"
                                    color="gray.400"
                                    _hover={{bg: 'gray.700', color: 'white', borderColor: 'teal.400'}}
                                    onClick={onClose}
                                    disabled={loading}
                                    px={6}
                                    py={3}
                                    borderRadius="lg"
                                >
                                    Отмена
                                </Button>

                                <Button
                                    px={6}
                                    py={3}
                                    type="submit"
                                    colorScheme="teal"
                                    loading={loading}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="teal.500"
                                    boxShadow="md"
                                    _hover={{boxShadow: 'lg'}}
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
