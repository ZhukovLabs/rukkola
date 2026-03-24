'use client'

import React from 'react'
import {Box, Tabs, Heading, Flex, Icon, Text} from '@chakra-ui/react'
import {FiSettings, FiUsers} from 'react-icons/fi'
import {UsersTable} from './users-table'
import {PasswordChangeForm} from './password-change-form'
import {useSession} from '@/lib/auth/auth-context'
import {useRouter, useSearchParams} from 'next/navigation'

export const DashboardSettingsPage = () => {
    const {data: session} = useSession()
    const isAdmin = session?.user?.role === 'admin'
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentTab = searchParams.get('tab') || 'settings'

    const handleTabChange = (e: { value: string }) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', e.value)
        router.push(`?${params.toString()}`, {scroll: false})
    }

    return (
        <Box>
            <Heading size="lg" color="teal.300" mb={6}>
                Настройки
            </Heading>

            <Tabs.Root
                defaultValue="settings"
                value={currentTab}
                onValueChange={handleTabChange}
            >
                <Tabs.List
                    mb={6}
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
                        py={2.5}
                        borderRadius="lg"
                        _selected={{
                            bgGradient: 'linear(to-r, teal.400, teal.500)',
                            color: 'white',
                            boxShadow: 'lg',
                        }}
                        _hover={{bg: 'gray.700'}}
                        fontWeight="semibold"
                    >
                        <Flex align="center" gap={2}>
                            <Icon as={FiSettings} boxSize={4}/>
                            <Text>Настройки</Text>
                        </Flex>
                    </Tabs.Trigger>

                    {isAdmin && (
                        <Tabs.Trigger
                            value="users"
                            px={6}
                            py={2.5}
                            borderRadius="lg"
                            _selected={{
                                bgGradient: 'linear(to-r, teal.400, teal.500)',
                                color: 'white',
                                boxShadow: 'lg',
                            }}
                            _hover={{bg: 'gray.700'}}
                            fontWeight="semibold"
                        >
                            <Flex align="center" gap={2}>
                                <Icon as={FiUsers} boxSize={4}/>
                                <Text>Пользователи</Text>
                            </Flex>
                        </Tabs.Trigger>
                    )}
                </Tabs.List>

                <Tabs.Content value="settings">
                    <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="md">
                        <PasswordChangeForm/>
                    </Box>
                </Tabs.Content>

                {isAdmin && (
                    <Tabs.Content value="users">
                        <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="md">
                            <UsersTable/>
                        </Box>
                    </Tabs.Content>
                )}
            </Tabs.Root>
        </Box>
    )
}
