'use client'

import React from 'react'
import {Box, Tabs, Heading, Flex, Icon, Text, Card} from '@chakra-ui/react'
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

    const handleTabChange = (e: {value: string}) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', e.value)
        router.push(`?${params.toString()}`, {scroll: false})
    }

    return (
        <Box minH="100vh">
            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.800"
                bg="gray.950"
                overflow="hidden"
            >
                <Card.Header
                    bg="gray.900"
                    borderTopRadius="2xl"
                    py={4}
                    px={6}
                    borderBottom="1px solid"
                    borderColor="gray.800"
                >
                    <Flex align="center" gap={3}>
                        <Box
                            bg="gray.800"
                            borderRadius="lg"
                            p={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="1px solid"
                            borderColor="gray.700"
                        >
                            <FiSettings size={20} color="white"/>
                        </Box>
                        <Heading size="lg" fontWeight="bold" letterSpacing="tight" color="white">
                            Настройки
                        </Heading>
                    </Flex>
                </Card.Header>

                <Card.Body px={{base: 4, md: 6}} py={4}>
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
                                    bgGradient: 'linear(to-r, gray.400, gray.500)',
                                    color: 'white',
                                    boxShadow: 'lg',
                                }}
                                _hover={{bg: 'gray.700'}}
                                fontWeight="semibold"
                                color="gray.300"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiSettings} boxSize={4}/>
                                    <Text color="white">Настройки</Text>
                                </Flex>
                            </Tabs.Trigger>

                            {isAdmin && (
                                <Tabs.Trigger
                                    value="users"
                                    px={6}
                                    py={2.5}
                                    borderRadius="lg"
                                    _selected={{
                                        bgGradient: 'linear(to-r, gray.400, gray.500)',
                                        color: 'white',
                                        boxShadow: 'lg',
                                    }}
                                    _hover={{bg: 'gray.700'}}
                                    fontWeight="semibold"
                                    color="gray.300"
                                >
                                    <Flex align="center" gap={2}>
                                        <Icon as={FiUsers} boxSize={4}/>
                                        <Text color="white">Пользователи</Text>
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
                </Card.Body>
            </Card.Root>
        </Box>
    )
}
