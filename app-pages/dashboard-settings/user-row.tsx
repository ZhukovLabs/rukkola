'use client'

import React, {useState} from 'react'
import {Flex, Table, Text, Input, IconButton, Portal} from '@chakra-ui/react'
import {FiEdit, FiTrash2, FiCheck, FiX} from 'react-icons/fi'
import {UserType} from '@/models/user'
import {updateUser, deleteUser} from './actions'
import {Tooltip} from '@/components/tooltip'
import {Select, createListCollection} from '@chakra-ui/react'

type UserRowProps = {
    onUserDelete: (id: string) => void
    onUserUpdate: (user: UserType) => void
    user: UserType
    isOwnAccount: boolean
}

const roles = createListCollection({
    items: [
        {label: 'admin', value: 'admin'},
        {label: 'moderator', value: 'moderator'},
    ],
})

export const UserRow = ({user, onUserUpdate, onUserDelete, isOwnAccount}: UserRowProps) => {
    const [editing, setEditing] = useState(false)
    const [tempUser, setTempUser] = useState<UserType>(user)

    const handleSave = async () => {
        try {
            await updateUser(user._id.toString(), tempUser)
            onUserUpdate({...user, ...tempUser} as UserType)
            setEditing(false)
        } catch (err) {
            console.error(err)
        }
    }

    const handleCancel = () => {
        setEditing(false)
        setTempUser(user)
    }

    const handleDelete = async () => {
        if (!window.confirm('Удалить пользователя?')) return
        try {
            await deleteUser(user._id.toString())
            onUserDelete(user._id.toString())
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Table.Row
            bg="gray.900"
            borderBottom="1px solid"
            borderColor="gray.700"
            _hover={{bg: 'gray.850', transition: '0.2s ease'}}
        >
            {/* Username */}
            <Table.Cell p={3} verticalAlign="middle">
                {editing ? (
                    <Input
                        size="sm"
                        value={tempUser.username ?? ''}
                        onChange={(e) =>
                            setTempUser({...tempUser, username: e.target.value} as UserType)
                        }
                        bg="gray.800"
                        color="teal.300"
                        borderColor="teal.500"
                        height="36px"
                        _focus={{
                            borderColor: 'teal.400',
                            boxShadow: '0 0 0 1px teal.400',
                        }}
                    />
                ) : (
                    <Text color="teal.200" fontWeight="medium" lineHeight="36px">
                        {user.username}
                    </Text>
                )}
            </Table.Cell>

            {['name', 'surname', 'patronymic'].map((field) => (
                <Table.Cell key={field} p={3} verticalAlign="middle">
                    {editing ? (
                        <Input
                            size="sm"
                            value={(tempUser as any)[field] ?? ''}
                            onChange={(e) =>
                                setTempUser({
                                    ...tempUser,
                                    [field]: e.target.value,
                                } as UserType)
                            }
                            bg="gray.800"
                            color="teal.300"
                            borderColor="teal.500"
                            height="36px"
                            _focus={{
                                borderColor: 'teal.400',
                                boxShadow: '0 0 0 1px teal.400',
                            }}
                        />
                    ) : (
                        <Text color="gray.200" lineHeight="36px">
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
                            setTempUser({
                                ...tempUser,
                                role: val.value[0] as 'admin' | 'moderator',
                            } as UserType)
                        }
                    >
                        <Select.HiddenSelect/>
                        <Select.Control>
                            <Select.Trigger
                                px={2}
                                bg="gray.800"
                                color="teal.200"
                                borderColor="teal.500"
                                height="36px"
                            >
                                <Select.ValueText placeholder="Роль"/>
                            </Select.Trigger>
                        </Select.Control>
                        <Portal>
                            <Select.Positioner>
                                <Select.Content bg="gray.800" borderColor="teal.600">
                                    {roles.items.map((item) => (
                                        <Select.Item key={item.value} item={item}>
                                            {item.label}
                                            <Select.ItemIndicator/>
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                ) : (
                    <Text color="teal.300" textAlign="center" lineHeight="36px">
                        {user.role}
                    </Text>
                )}
            </Table.Cell>

            {/* Действия */}
            <Table.Cell p={3} verticalAlign="middle">
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
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, green.500, green.600)',
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
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, gray.600, gray.700)',
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
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, blue.500, blue.600)',
                                    }}
                                    onClick={() => setEditing(true)}
                                >
                                    <FiEdit/>
                                </IconButton>
                            </Tooltip>

                            {!isOwnAccount && (<Tooltip content="Удалить">
                                <IconButton
                                    aria-label="Удалить"
                                    size="sm"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, red.500, red.600)"
                                    color="white"
                                    _hover={{
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, red.600, red.700)',
                                    }}
                                    onClick={handleDelete}
                                >
                                    <FiTrash2/>
                                </IconButton>
                            </Tooltip>)}
                        </>
                    )}
                </Flex>
            </Table.Cell>
        </Table.Row>
    )
}
