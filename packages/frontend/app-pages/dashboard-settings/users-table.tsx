'use client'

import React, {useState} from 'react'
import {Flex, Spinner, Text, Button, Card, Table, Box, VStack} from '@chakra-ui/react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {getUsers} from './actions'
import {AddUserModal} from './add-user-modal'
import {UserRow} from './user-row'
import {useSession, useAuth} from '@/lib/auth/auth-context'
import type {SerializedUser} from './types'

export const UsersTable = () => {
    const {data: session} = useSession();
    const {status: authStatus} = useAuth();
    const authenticatedUserId = session?.user?.id as string | undefined;
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const {data, isPending} = useQuery({
        queryKey: ['users'],
        staleTime: 0,
        queryFn: async () => {
            const result = await getUsers()
            if (result.success && result.data) return result.data
            return [] as SerializedUser[]
        },
    })

    const users: SerializedUser[] = data ?? [];

    if (authStatus === 'loading') {
        return (
            <Flex justify="center" align="center" h="200px">
                <Spinner size="lg" color="whiteAlpha.400"/>
            </Flex>
        )
    }

    const handleUserCreated = () => {
        queryClient.invalidateQueries({queryKey: ['users']})
    }

    return (
        <>
            <Card.Root
                w="100%"
                borderRadius="3xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                bg="whiteAlpha.50"
                overflow="hidden"
                shadow="none"
            >
                <Card.Header
                    bg="whiteAlpha.100"
                    py={3}
                    px={5}
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.100"
                >
                    <Flex justify="space-between" align="center" w="full">
                        <VStack align="start" gap={0}>
                            <Text fontSize="lg" fontWeight="extrabold" color="white" letterSpacing="tight"
                                  lineHeight="1.2">
                                Пользователи
                            </Text>
                            <Text fontSize="xs" color="gray.400" lineHeight="1">
                                Доступ к панели управления
                            </Text>
                        </VStack>
                        <Button
                            size="sm"
                            bg="white"
                            color="gray.950"
                            _hover={{
                                bg: "gray.100",
                                shadow: "0 0 20px rgba(255,255,255,0.15)",
                                transform: "translateY(-1px)"
                            }}
                            _active={{transform: "scale(0.98)"}}
                            onClick={() => setIsAddOpen(true)}
                            borderRadius="lg"
                            fontWeight="bold"
                            px={4}
                            h="32px"
                        >
                            + Добавить
                        </Button>
                    </Flex>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    {isPending ? (
                        <Flex justify="center" align="center" h="200px">
                            <Spinner size="lg" color="whiteAlpha.400"/>
                        </Flex>
                    ) : (
                        <Box overflowX="auto">
                            <Table.Root size="sm" variant="outline" w="full">
                                <Table.Header bg="whiteAlpha.50">
                                    <Table.Row borderBottom="1px solid" borderColor="whiteAlpha.100">
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest">
                                            Пользователь
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Имя
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Фамилия
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Отчество
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Роль
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Статус
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="gray.400" py={3} px={4} fontWeight="bold"
                                                            fontSize="xs" textTransform="uppercase"
                                                            letterSpacing="widest" textAlign="center">
                                            Действия
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {
                                        users.map((user) => (
                                            <UserRow
                                                key={user._id}
                                                user={user}
                                                isOwnAccount={user._id === authenticatedUserId}
                                            />
                                        ))
                                    }
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
