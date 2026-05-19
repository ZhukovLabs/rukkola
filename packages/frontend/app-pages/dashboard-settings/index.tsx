'use client'

import React from 'react'
import {Box, Tabs, Heading, Flex, Icon, Text, Card, VStack} from '@chakra-ui/react'
import {FiSettings, FiUsers, FiMapPin} from 'react-icons/fi'
import {UsersTable} from './users-table'
import {PasswordChangeForm} from './password-change-form'
import {ContactsForm} from './contacts-form'
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
                borderRadius="3xl"
                shadow="2xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                bg="gray.950"
                overflow="hidden"
            >
                <Card.Header
                    bg="gray.900/50"
                    backdropFilter="blur(10px)"
                    borderTopRadius="3xl"
                    py={4}
                    px={6}
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.100"
                >
                    <Flex align="center" gap={4}>
                        <Box
                            bg="whiteAlpha.50"
                            borderRadius="xl"
                            p={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            shadow="inner"
                        >
                            <FiSettings size={20} color="white"/>
                        </Box>
                        <VStack align="start" gap={0}>
                            <Heading size="lg" fontWeight="extrabold" letterSpacing="tight" color="white">
                                Настройки
                            </Heading>
                            <Text color="gray.400" fontSize="xs">
                                Управление аккаунтом и параметрами системы
                            </Text>
                        </VStack>
                    </Flex>
                </Card.Header>

                <Card.Body px={{base: 4, md: 6}} py={6}>
                    <Tabs.Root
                        variant="plain"
                        value={currentTab}
                        onValueChange={handleTabChange}
                    >
                        <Tabs.List
                            mb={6}
                            bg="whiteAlpha.50"
                            borderRadius="2xl"
                            p={1.5}
                            display="inline-flex"
                            gap={1}
                            border="1px solid"
                            borderColor="whiteAlpha.100"
                        >
                            <Tabs.Trigger
                                value="settings"
                                px={5}
                                py={2}
                                borderRadius="xl"
                                _selected={{
                                    bg: 'white',
                                    color: 'gray.950',
                                    shadow: '0 0 20px rgba(255,255,255,0.15)',
                                }}
                                _hover={{
                                    bg: currentTab === 'settings' ? 'white' : 'whiteAlpha.100',
                                }}
                                fontWeight="bold"
                                color="gray.400"
                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                fontSize="sm"
                            >
                                <Flex align="center" gap={2}>
                                    <Icon as={FiSettings} boxSize={4}/>
                                    <Text>Безопасность</Text>
                                </Flex>
                            </Tabs.Trigger>

                            {isAdmin && (
                                <Tabs.Trigger
                                    value="contacts"
                                    px={5}
                                    py={2}
                                    borderRadius="xl"
                                    _selected={{
                                        bg: 'white',
                                        color: 'gray.950',
                                        shadow: '0 0 20px rgba(255,255,255,0.15)',
                                    }}
                                    _hover={{
                                        bg: currentTab === 'contacts' ? 'white' : 'whiteAlpha.100',
                                    }}
                                    fontWeight="bold"
                                    color="gray.400"
                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    fontSize="sm"
                                >
                                    <Flex align="center" gap={2}>
                                        <Icon as={FiMapPin} boxSize={4}/>
                                        <Text>Контакты</Text>
                                    </Flex>
                                </Tabs.Trigger>
                            )}

                            {isAdmin && (
                                <Tabs.Trigger
                                    value="users"
                                    px={5}
                                    py={2}
                                    borderRadius="xl"
                                    _selected={{
                                        bg: 'white',
                                        color: 'gray.950',
                                        shadow: '0 0 20px rgba(255,255,255,0.15)',
                                    }}
                                    _hover={{
                                        bg: currentTab === 'users' ? 'white' : 'whiteAlpha.100',
                                    }}
                                    fontWeight="bold"
                                    color="gray.400"
                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    fontSize="sm"
                                >
                                    <Flex align="center" gap={2}>
                                        <Icon as={FiUsers} boxSize={4}/>
                                        <Text>Пользователи</Text>
                                    </Flex>
                                </Tabs.Trigger>
                            )}
                        </Tabs.List>

                        <Tabs.Content value="settings" p={0}>
                            <Box 
                                bg="whiteAlpha.50" 
                                p={{base: 4, md: 6}} 
                                borderRadius="2xl" 
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                shadow="sm"
                            >
                                <PasswordChangeForm/>
                            </Box>
                        </Tabs.Content>

                        {isAdmin && (
                            <Tabs.Content value="contacts" p={0}>
                                <Box 
                                    bg="whiteAlpha.50" 
                                    p={{base: 4, md: 6}} 
                                    borderRadius="2xl" 
                                    border="1px solid"
                                    borderColor="whiteAlpha.100"
                                    shadow="sm"
                                >
                                    <ContactsForm/>
                                </Box>
                            </Tabs.Content>
                        )}

                        {isAdmin && (
                            <Tabs.Content value="users" p={0}>
                                <Box 
                                    bg="whiteAlpha.50" 
                                    p={{base: 4, md: 6}} 
                                    borderRadius="2xl" 
                                    border="1px solid"
                                    borderColor="whiteAlpha.100"
                                    shadow="sm"
                                >
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
