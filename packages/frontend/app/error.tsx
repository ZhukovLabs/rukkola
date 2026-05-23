'use client'

import {Box, Button, Heading, Text, VStack, Icon, HStack} from '@chakra-ui/react'
import {FiAlertTriangle, FiRefreshCw, FiHome} from 'react-icons/fi'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    console.error('Page error:', error)

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.900"
            p={4}
        >
            <VStack
                gap={6}
                maxW="md"
                textAlign="center"
                bg="gray.800"
                p={8}
                borderRadius="2xl"
                border="1px solid"
                borderColor="red.900"
                boxShadow="0 0 40px rgba(229, 62, 62, 0.2)"
            >
                <Box
                    p={4}
                    bg="red.900"
                    borderRadius="full"
                    opacity={0.9}
                >
                    <Icon as={FiAlertTriangle} boxSize={12} color="red.300"/>
                </Box>

                <Heading size="lg" color="red.300">
                    Не удалось загрузить страницу
                </Heading>

                <Text color="gray.400">
                    Произошла непредвиденная ошибка. Попробуйте обновить страницу.
                </Text>

                <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
                    <Button
                        onClick={() => reset()}
                        bgGradient="linear(to-r, gray.500, gray.600)"
                        color="white"
                        _hover={{
                            bgGradient: 'linear(to-r, gray.600, gray.700)',
                            transform: 'translateY(-2px)',
                        }}
                    >
                        <HStack gap={2}>
                            <Icon as={FiRefreshCw} boxSize={4}/>
                            <Text>Попробовать снова</Text>
                        </HStack>
                    </Button>

                    <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        borderColor="gray.600"
                        color="gray.300"
                        _hover={{
                            bg: 'gray.700',
                            borderColor: 'gray.500',
                        }}
                    >
                        <HStack gap={2}>
                            <Icon as={FiHome} boxSize={4}/>
                            <Text>На главную</Text>
                        </HStack>
                    </Button>
                </Box>
            </VStack>
        </Box>
    )
}
