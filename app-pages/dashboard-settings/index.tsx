'use client'

import React from 'react'
import {Box, Tabs} from '@chakra-ui/react'
import {UsersTable} from './users-table'
import {PasswordChangeForm} from './password-change-form'
import { useSession } from 'next-auth/react';

export const DashboardSettingsPage = () => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    return (
        <Box minH="100vh" bg="gray.900" color="white">
            <Tabs.Root defaultValue="settings">
                <Tabs.List
                    mb={4}
                    bg="gray.800"
                    borderRadius="xl"
                    p={1}
                    display="flex"
                    gap={2}
                    position="relative"
                >
                    <Tabs.Trigger
                        value="settings"
                        px={6}
                        py={2}
                        borderRadius="lg"
                        _selected={{
                            bgGradient: 'linear(to-r, teal.400, teal.500)',
                            color: 'white',
                            boxShadow: 'lg',
                        }}
                        _hover={{bg: 'gray.700'}}
                        fontWeight="semibold"
                    >
                        Настройки
                    </Tabs.Trigger>

                    {isAdmin && (
                        <Tabs.Trigger
                            value="users"
                            px={6}
                            py={2}
                            borderRadius="lg"
                            _selected={{
                                bgGradient: 'linear(to-r, teal.400, teal.500)',
                                color: 'white',
                                boxShadow: 'lg',
                            }}
                            _hover={{bg: 'gray.700'}}
                            fontWeight="semibold"
                        >
                            Пользователи
                        </Tabs.Trigger>
                    )}
                </Tabs.List>

                <Tabs.Content value="settings">
                    <Box bg="gray.800" p={4} borderRadius="xl" boxShadow="md">
                        <PasswordChangeForm/>
                    </Box>
                </Tabs.Content>

                {isAdmin && (
                    <Tabs.Content value="users">
                        <Box bg="gray.800" p={4} borderRadius="xl" boxShadow="md">
                            <UsersTable/>
                        </Box>
                    </Tabs.Content>
                )}
            </Tabs.Root>
        </Box>
    )
}