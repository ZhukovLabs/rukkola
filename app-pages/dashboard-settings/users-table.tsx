'use client'

import React, { useState, useEffect } from 'react'
import { Box, Flex, Spinner, Text, Button, Card, Table } from '@chakra-ui/react'
import { getUsers } from './actions'
import { UserType } from '@/models/user'
import { AddUserModal } from './add-user-modal'
import { UserRow } from './user-row'
import { useSession } from 'next-auth/react'

export const UsersTable = () => {
    const { data: session } = useSession();
    const authenticatedUserId = session?.user?.id as string | undefined;

    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getUsers();
                if (res.success && res.data) {
                    setUsers(res.data);
                }
            } finally {
                setLoading(false);
            }
        })()
    }, [])


    const handleUserCreated = (newUser: UserType) => {
        setUsers((prev) => [newUser, ...prev])
    }

    return (
        <>
            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.900"
                overflow="hidden"
            >
                <Card.Header
                    bgGradient="linear(to-r, teal.600, teal.500)"
                    borderTopRadius="2xl"
                    py={4}
                    textAlign="center"
                    color="white"
                >
                    <Flex justify="space-between" align="center" px={6}>
                        <Text fontSize="lg" fontWeight="semibold" letterSpacing="wide">
                            Пользователи
                        </Text>

                        <Button
                            p={2}
                            size="sm"
                            fontWeight="semibold"
                            borderRadius="xl"
                            bgGradient="linear(to-r, teal.400, teal.500)"
                            color="teal.500"
                            _hover={{
                                transform: 'scale(1.05)',
                                bgGradient: 'linear(to-r, teal.300, teal.400)'
                            }}
                            _active={{ transform: 'scale(0.97)' }}
                            onClick={() => setIsAddOpen(true)}
                        >
                            + Добавить
                        </Button>
                    </Flex>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    <Box overflowX="auto" position="relative">
                        {loading && (
                            <Flex
                                position="absolute"
                                inset={0}
                                justify="center"
                                align="center"
                                bg="rgba(0,0,0,0.6)"
                                zIndex={10}
                            >
                                <Spinner size="xl" color="teal.400" />
                            </Flex>
                        )}

                        <Table.Root w="100%" size="md" variant="outline">
                            <Table.Header bg="gray.800" borderBottom="1px solid" borderColor="gray.700">
                                <Table.Row>
                                    {['Логин', 'Имя', 'Фамилия', 'Отчество', 'Роль', 'Действия'].map((col) => (
                                        <Table.ColumnHeader
                                            key={col}
                                            textAlign={col === 'Логин' ? 'left' : 'center'}
                                            color="white"
                                            p={4}
                                            letterSpacing="wider"
                                        >
                                            {col}
                                        </Table.ColumnHeader>
                                    ))}
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {!loading && users.length === 0 && (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} textAlign="center" color="gray.500" py={8}>
                                            Нет пользователей
                                        </Table.Cell>
                                    </Table.Row>
                                )}

                                {users.map((user) => (
                                    <UserRow
                                        key={user._id.toString()}
                                        user={user}
                                        isOwnAccount={user._id.toString() === authenticatedUserId}
                                        onUserUpdate={(updated) =>
                                            setUsers((prev) =>
                                                prev.map((u) => (u._id === updated._id ? updated : u))
                                            )
                                        }
                                        onUserDelete={(id) =>
                                            setUsers((prev) => prev.filter((u) => u._id.toString() !== id))
                                        }
                                    />
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Card.Body>
            </Card.Root>

            <AddUserModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onUserAdded={handleUserCreated}
            />
        </>
    )
}