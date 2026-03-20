'use client'

import React, { useState, useEffect } from 'react'
import { Flex, Spinner, Text, Button, Card, Table, Box } from '@chakra-ui/react'
import { getUsers } from './actions'
import { AddUserModal } from './add-user-modal'
import { UserRow } from './user-row'
import { useSession } from 'next-auth/react'
import type { SerializedUser } from './types'

export const UsersTable = () => {
    const { data: session } = useSession();
    const authenticatedUserId = session?.user?.id as string | undefined;

    const [users, setUsers] = useState<SerializedUser[]>([]);
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


    const handleUserCreated = (newUser: SerializedUser) => {
        setUsers((prev) => [newUser, ...prev])
    }

    return (
        <>
            <Card.Root
                w="100%"
                borderRadius="xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.800"
                overflow="hidden"
            >
                <Card.Header
                    bgGradient="linear(to-r, teal.600, cyan.600)"
                    borderTopRadius="xl"
                    py={4}
                    textAlign="center"
                    color="white"
                    backdropFilter="blur(10px)"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexDir="row"
                >
                    <Text fontSize="lg" fontWeight="bold" letterSpacing="tight" w="100%">
                        Пользователи
                    </Text>
                    <Button
                        size="sm"
                        bg="whiteAlpha.200"
                        color="white"
                        _hover={{bg: "whiteAlpha.300"}}
                        onClick={() => setIsAddOpen(true)}
                        borderRadius="lg"
                    >
                        + Добавить
                    </Button>
                </Card.Header>

                <Card.Body px={0} py={0} minH="200px">
                    {loading ? (
                        <Flex justify="center" align="center" h="200px">
                            <Spinner size="xl" color="teal.300"/>
                        </Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table.Root size="md" variant="outline" w="full" minWidth="700px">
                                <Table.Header bg="gray.900" borderBottomWidth="2px" borderColor="gray.700">
                                    <Table.Row>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Логин
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Имя
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Фамилия
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Отчество
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Роль
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.200" p={4} fontWeight="semibold" fontSize="sm" textTransform="uppercase" letterSpacing="wider" whiteSpace="nowrap">
                                            Действия
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <UserRow
                                                key={user._id}
                                                user={user}
                                                onUserUpdate={(updated) => {
                                                    setUsers((prev) =>
                                                        prev.map((u) => (u._id === updated._id ? updated : u))
                                                    )
                                                }}
                                                onUserDelete={(id) => {
                                                    setUsers((prev) => prev.filter((u) => u._id !== id))
                                                }}
                                                isOwnAccount={user._id === authenticatedUserId}
                                            />
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell colSpan={6} textAlign="center" py={8}>
                                                <Text color="gray.500">Нет пользователей</Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    )}
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
