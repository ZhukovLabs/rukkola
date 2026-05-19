'use client'

import React, {useState} from 'react'
import {
    Flex,
    Table,
    Text,
    Input,
    IconButton,
    Portal,
    Badge,
    HStack,
    VStack
} from '@chakra-ui/react'
import {FiEdit, FiTrash2, FiCheck, FiX, FiLogOut, FiShieldOff, FiShield} from 'react-icons/fi'
import {updateUser, deleteUser, toggleBlockUser, logoutUserSessions} from './actions'
import {Tooltip} from '@/components/tooltip'
import {Select, createListCollection} from '@chakra-ui/react'
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog'
import {useToast} from '@/components/toast-container'
import {editUserSchema} from './validation'
import type {SerializedUser, UserRowProps} from './types'

type EditableUserFields = Pick<SerializedUser, 'username' | 'name' | 'surname' | 'patronymic' | 'role'>;

const roles = createListCollection({
    items: [
        {label: 'Администратор', value: 'admin'},
        {label: 'Модератор', value: 'moderator'},
    ],
})

export const UserRow = ({user, onUserUpdate, onUserDelete, isOwnAccount}: UserRowProps) => {
    const [editing, setEditing] = useState(false)
    const [tempUser, setTempUser] = useState<EditableUserFields>({
        username: user.username,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        role: user.role,
    })
    const [error, setError] = useState<string | null>(null)
    const toast = useToast()

    const {openDialog, confirmationDialog} = useConfirmationDialog<string>({
        onConfirm: async (id) => {
            setError(null)
            try {
                const res = await deleteUser(id)
                if (res.success) {
                    onUserDelete(id)
                    toast.showSuccess('Пользователь удалён')
                } else {
                    setError(res.message || 'Не удалось удалить пользователя')
                    toast.showError(res.message || 'Не удалось удалить пользователя')
                }
            } catch {
                setError('Не удалось удалить пользователя')
                toast.showError('Не удалось удалить пользователя')
            }
        },
        title: 'Удалить пользователя?',
        description: 'Это действие невозможно будет отменить.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
    })

    const handleToggleBlock = async () => {
        setError(null)
        try {
            const res = await toggleBlockUser(user._id.toString())
            if (res.success && res.data) {
                onUserUpdate(res.data)
                toast.showSuccess(res.data.isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован')
            } else {
                toast.showError(res.message || 'Ошибка')
            }
        } catch {
            toast.showError('Не удалось изменить статус')
        }
    }

    const handleLogoutSessions = async () => {
        setError(null)
        try {
            const res = await logoutUserSessions(user._id.toString())
            if (res.success) {
                toast.showSuccess(res.message || 'Сессии завершены')
            } else {
                toast.showError(res.message || 'Ошибка')
            }
        } catch {
            toast.showError('Не удалось завершить сессии')
        }
    }

    const handleSave = async () => {
        setError(null)
        const result = editUserSchema.safeParse(tempUser)
        if (!result.success) {
            const firstError = result.error.issues[0]
            setError(firstError?.message || 'Проверьте введённые данные')
            return
        }
        try {
            const res = await updateUser(user._id.toString(), tempUser)
            if (res.success) {
                onUserUpdate(res.data!)
                setEditing(false)
                toast.showSuccess('Данные пользователя обновлены')
            } else {
                setError(res.message || 'Не удалось обновить пользователя')
                toast.showError(res.message || 'Не удалось обновить пользователя')
            }
        } catch {
            setError('Не удалось обновить пользователя')
            toast.showError('Не удалось обновить пользователя')
        }
    }

    const handleCancel = () => {
        setEditing(false)
        setTempUser({
            username: user.username,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            role: user.role,
        })
        setError(null)
    }

    const handleFieldChange = (field: keyof Pick<EditableUserFields, 'name' | 'surname' | 'patronymic'>, value: string) => {
        setTempUser(prev => ({...prev, [field]: value}));
    }

    const getFieldValue = (userData: EditableUserFields, field: keyof Pick<EditableUserFields, 'name' | 'surname' | 'patronymic'>) => {
        return userData[field] || '';
    }

    return (
        <>
            <Table.Row
                bg={user.isActive ? 'transparent' : 'red.500/5'}
                borderBottom="1px solid"
                borderColor={user.isActive ? 'whiteAlpha.100' : 'red.500/20'}
                _hover={{ bg: user.isActive ? 'whiteAlpha.50' : 'red.500/10' }}
                transition="all 0.2s ease"
            >
                <Table.Cell py={3} px={4} verticalAlign="middle">
                    <HStack gap={3} align="center">
                        {editing ? (
                            <Input
                                px={2}
                                size="sm"
                                value={tempUser.username ?? ''}
                                onChange={(e) => setTempUser({...tempUser, username: e.target.value.toLowerCase()})}
                                bg="gray.900"
                                color="white"
                                borderColor="whiteAlpha.200"
                                height="32px"
                                _focus={{borderColor: 'white', boxShadow: '0 0 0 1px white'}}
                                borderRadius="lg"
                                fontSize="xs"
                            />
                        ) : (
                            <VStack align="start" gap={0}>
                                <Text color="white" fontWeight="bold" fontSize="xs">
                                    {user.username}
                                </Text>
                                <Text color="gray.500" fontSize="2xs">
                                    ID: {user._id.toString().slice(-6)}
                                </Text>
                            </VStack>
                        )}
                    </HStack>
                </Table.Cell>

                {(['name', 'surname', 'patronymic'] as const).map((field) => (
                    <Table.Cell key={field} py={3} px={4} verticalAlign="middle" textAlign="center">
                        {editing ? (
                            <Input
                                px={2}
                                size="sm"
                                value={getFieldValue(tempUser, field)}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                bg="gray.900"
                                color="white"
                                borderColor="whiteAlpha.200"
                                height="32px"
                                _focus={{borderColor: 'white', boxShadow: '0 0 0 1px white'}}
                                borderRadius="lg"
                                fontSize="xs"
                            />
                        ) : (
                            <Text color="gray.300" fontSize="xs">
                                {getFieldValue({username: user.username, name: user.name, surname: user.surname, patronymic: user.patronymic, role: user.role}, field) || '—'}
                            </Text>
                        )}
                    </Table.Cell>
                ))}

                <Table.Cell py={3} px={4} verticalAlign="middle">
                    {editing ? (
                        <Select.Root
                            collection={roles}
                            value={[tempUser.role ?? 'moderator']}
                            onValueChange={(val) =>
                                setTempUser({...tempUser, role: val.value[0] as 'admin' | 'moderator'})
                            }
                        >
                            <Select.HiddenSelect/>
                            <Select.Control>
                                <Select.Trigger px={2} bg="gray.900" color="white" borderColor="whiteAlpha.200" height="32px" borderRadius="lg">
                                    <Select.ValueText placeholder="Роль" fontSize="xs"/>
                                </Select.Trigger>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content bg="gray.900" borderColor="whiteAlpha.200" borderRadius="lg">
                                        {roles.items.map((item) => (
                                            <Select.Item key={item.value} item={item} px={2} py={1} color="white" _hover={{ bg: 'whiteAlpha.100' }} cursor="pointer">
                                                <Text fontSize="xs">{item.label}</Text>
                                                <Select.ItemIndicator/>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    ) : (
                        <Flex justify="center">
                            <Badge
                                variant="surface"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                colorPalette={user.role === 'admin' ? 'cyan' : 'gray'}
                                fontSize="2xs"
                                fontWeight="extrabold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                            >
                                {roles.items.find(({value}) => user.role === value)?.label}
                            </Badge>
                        </Flex>
                    )}
                </Table.Cell>

                <Table.Cell py={3} px={4} verticalAlign="middle">
                    <Flex justify="center">
                        <Badge
                            variant="solid"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg={user.isActive ? 'green.500/20' : 'red.500/20'}
                            color={user.isActive ? 'green.400' : 'red.400'}
                            border="1px solid"
                            borderColor={user.isActive ? 'green.500/30' : 'red.500/30'}
                            fontSize="2xs"
                            fontWeight="extrabold"
                            textTransform="uppercase"
                            letterSpacing="wider"
                        >
                            {user.isActive ? 'Активен' : 'Заблокирован'}
                        </Badge>
                    </Flex>
                </Table.Cell>

                <Table.Cell py={3} px={4} verticalAlign="middle">
                    <Flex direction="column" gap={1} align="center">
                        {error && (
                            <Text color="red.400" fontSize="2xs" mb={1}>
                                {error}
                            </Text>
                        )}

                        <Flex justify="center" gap={1.5}>
                            {editing ? (
                                <>
                                    <Tooltip content="Сохранить">
                                        <IconButton
                                            aria-label="Сохранить"
                                            size="xs"
                                            borderRadius="md"
                                            variant="subtle"
                                            colorPalette="green"
                                            onClick={handleSave}
                                        >
                                            <FiCheck size={14}/>
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip content="Отмена">
                                        <IconButton
                                            aria-label="Отмена"
                                            size="xs"
                                            borderRadius="md"
                                            variant="subtle"
                                            colorPalette="gray"
                                            onClick={handleCancel}
                                        >
                                            <FiX size={14}/>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Tooltip content="Редактировать">
                                        <IconButton
                                            aria-label="Редактировать"
                                            size="xs"
                                            borderRadius="md"
                                            variant="ghost"
                                            color="whiteAlpha.600"
                                            _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                                            onClick={() => setEditing(true)}
                                        >
                                            <FiEdit size={14}/>
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip content="Завершить сессии">
                                        <IconButton
                                            aria-label="Завершить сессии"
                                            size="xs"
                                            borderRadius="md"
                                            variant="ghost"
                                            color="purple.400/60"
                                            _hover={{ color: 'purple.400', bg: 'whiteAlpha.100' }}
                                            onClick={handleLogoutSessions}
                                        >
                                            <FiLogOut size={14}/>
                                        </IconButton>
                                    </Tooltip>

                                    {!isOwnAccount && (
                                        <>
                                            <Tooltip content={user.isActive ? 'Заблокировать' : 'Разблокировать'}>
                                                <IconButton
                                                    aria-label={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                                                    size="xs"
                                                    borderRadius="md"
                                                    variant="ghost"
                                                    color={user.isActive ? 'orange.400/60' : 'green.400/60'}
                                                    _hover={{ color: user.isActive ? 'orange.400' : 'green.400', bg: 'whiteAlpha.100' }}
                                                    onClick={handleToggleBlock}
                                                >
                                                    {user.isActive ? <FiShieldOff size={14}/> : <FiShield size={14}/>}
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip content="Удалить">
                                                <IconButton
                                                    aria-label="Удалить"
                                                    size="xs"
                                                    borderRadius="md"
                                                    variant="ghost"
                                                    color="red.400/60"
                                                    _hover={{ color: 'red.400', bg: 'whiteAlpha.100' }}
                                                    onClick={() => openDialog(user._id.toString())}
                                                >
                                                    <FiTrash2 size={14}/>
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Table.Cell>
            </Table.Row>

            {confirmationDialog}
        </>
    )
}
