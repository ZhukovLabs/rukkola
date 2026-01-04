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
    HStack
} from '@chakra-ui/react'
import {FiEdit, FiTrash2, FiCheck, FiX} from 'react-icons/fi'
import {UserType} from '@/models/user'
import {updateUser, deleteUser} from './actions'
import {Tooltip} from '@/components/tooltip'
import {Select, createListCollection} from '@chakra-ui/react'
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog'

type UserRowProps = {
    onUserDelete: (id: string) => void
    onUserUpdate: (user: UserType) => void
    user: UserType
    isOwnAccount: boolean
}

const roles = createListCollection({
    items: [
        {label: 'Администратор', value: 'admin'},
        {label: 'Модератор', value: 'moderator'},
    ],
})

export const UserRow = ({user, onUserUpdate, onUserDelete, isOwnAccount}: UserRowProps) => {
    const [editing, setEditing] = useState(false)
    const [tempUser, setTempUser] = useState<UserType>(user)
    const [error, setError] = useState<string | null>(null)

    const {openDialog, ConfirmationDialog} = useConfirmationDialog<string>({
        onConfirm: async (id) => {
            setError(null)
            try {
                const res = await deleteUser(id)
                if (res.success) {
                    onUserDelete(id)
                } else {
                    setError(res.message || 'Не удалось удалить пользователя')
                }
            } catch {
                setError('Не удалось удалить пользователя')
            }
        },
        title: 'Удалить пользователя?',
        description: 'Это действие невозможно будет отменить.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
    })

    const handleSave = async () => {
        setError(null)
        try {
            const res = await updateUser(user._id.toString(), tempUser)
            if (res.success) {
                onUserUpdate(res.data!)
                setEditing(false)
            } else {
                setError(res.message || 'Не удалось обновить пользователя')
            }
        } catch {
            setError('Не удалось обновить пользователя')
        }
    }

    const handleCancel = () => {
        setEditing(false)
        setTempUser(user)
        setError(null)
    }

    return (
        <>
            <Table.Row
                bg="gray.900"
                borderBottom="1px solid"
                borderColor="gray.700"
                _hover={{bg: 'gray.600', transition: '0.18s ease'}}
                style={{transition: 'background 180ms ease, transform 180ms ease'}}
            >
                <Table.Cell p={3} verticalAlign="middle">
                    <HStack gap={3} align="center">
                        {editing ? (
                            <Input
                                p={2}
                                size="sm"
                                value={tempUser.username ?? ''}
                                onChange={(e) => setTempUser({...tempUser, username: e.target.value} as UserType)}
                                bg="gray.800"
                                color="teal.300"
                                borderColor="teal.500"
                                height="36px"
                                _focus={{borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400'}}
                                borderRadius="md"
                            />
                        ) : (
                            <Text color="teal.200" fontWeight="medium" lineHeight="20px">
                                {user.username}
                            </Text>
                        )}
                    </HStack>
                </Table.Cell>

                {['name', 'surname', 'patronymic'].map((field) => (
                    <Table.Cell key={field} p={3} verticalAlign="middle">
                        {editing ? (
                            <Input
                                p={2}
                                size="sm"
                                value={(tempUser as any)[field] ?? ''}
                                onChange={(e) => setTempUser({...tempUser, [field]: e.target.value} as UserType)}
                                bg="gray.800"
                                color="teal.300"
                                borderColor="teal.500"
                                height="36px"
                                _focus={{borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400'}}
                                borderRadius="md"
                            />
                        ) : (
                            <Text color="gray.200" lineHeight="36px" textAlign="center">
                                {(user as any)[field] || '-'}
                            </Text>
                        )}
                    </Table.Cell>
                ))}

                <Table.Cell p={3} verticalAlign="middle">
                    {editing ? (
                        <Select.Root
                            collection={roles}
                            value={[tempUser.role ?? 'moderator']}
                            onValueChange={(val) =>
                                setTempUser({...tempUser, role: val.value[0] as 'admin' | 'moderator'} as UserType)
                            }
                        >
                            <Select.HiddenSelect/>
                            <Select.Control>
                                <Select.Trigger px={2} bg="gray.800" color="teal.200" borderColor="teal.500"
                                                height="36px">
                                    <Select.ValueText placeholder="Роль"/>
                                </Select.Trigger>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content bg="gray.800" borderColor="teal.600">
                                        {roles.items.map((item) => (
                                            <Select.Item key={item.value} item={item} p={2} color="white">
                                                {item.label}
                                                <Select.ItemIndicator/>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    ) : (
                        <Flex direction="column" align="center">
                            <Badge
                                px={3}
                                py={1}
                                borderRadius="full"
                                bg={user.role === 'admin' ? 'linear-gradient(90deg,#0ea5a4, #06b6d4)' : 'gray.800'}
                                color={user.role === 'admin' ? 'white' : 'teal.300'}
                                fontSize="xs"
                                boxShadow="sm"
                            >
                                {roles.items.find(({value}) => user.role === value)?.label}
                            </Badge>
                        </Flex>
                    )}
                </Table.Cell>

                <Table.Cell p={3} verticalAlign="middle">
                    <Flex direction="column" gap={1} align="center">
                        {error && (
                            <Text color="red.400" fontSize="xs">
                                {error}
                            </Text>
                        )}

                        <Flex justify="center" gap={2}>
                            {editing ? (
                                <>
                                    <Tooltip content="Сохранить">
                                        <IconButton
                                            aria-label="Сохранить"
                                            size="sm"
                                            borderRadius="xl"
                                            bgGradient="linear(to-r, green.400, green.500)"
                                            color="white"
                                            _hover={{
                                                transform: 'scale(1.06)',
                                                bgGradient: 'linear(to-r, green.500, green.600)'
                                            }}
                                            onClick={handleSave}
                                        >
                                            <FiCheck/>
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip content="Отмена">
                                        <IconButton
                                            aria-label="Отмена"
                                            size="sm"
                                            borderRadius="xl"
                                            bgGradient="linear(to-r, gray.500, gray.600)"
                                            color="white"
                                            _hover={{
                                                transform: 'scale(1.06)',
                                                bgGradient: 'linear(to-r, gray.600, gray.700)'
                                            }}
                                            onClick={handleCancel}
                                        >
                                            <FiX/>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Tooltip content="Редактировать">
                                        <IconButton
                                            aria-label="Редактировать"
                                            size="sm"
                                            borderRadius="xl"
                                            bgGradient="linear(to-r, blue.400, blue.500)"
                                            color="white"
                                            _hover={{
                                                transform: 'scale(1.06)',
                                                bgGradient: 'linear(to-r, blue.500, blue.600)'
                                            }}
                                            onClick={() => setEditing(true)}
                                        >
                                            <FiEdit/>
                                        </IconButton>
                                    </Tooltip>

                                    {!isOwnAccount && (
                                        <Tooltip content="Удалить">
                                            <IconButton
                                                aria-label="Удалить"
                                                size="sm"
                                                borderRadius="xl"
                                                bgGradient="linear(to-r, red.500, red.600)"
                                                color="white"
                                                _hover={{
                                                    transform: 'scale(1.06)',
                                                    bgGradient: 'linear(to-r, red.600, red.700)'
                                                }}
                                                onClick={() => openDialog(user._id.toString())}
                                            >
                                                <FiTrash2/>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Table.Cell>
            </Table.Row>

            <ConfirmationDialog/>
        </>
    )
}
