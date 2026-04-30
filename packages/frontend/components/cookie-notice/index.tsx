'use client'

import {
    Box,
    Text,
    HStack,
    VStack,
    Link,
    Button,
    Portal,
} from '@chakra-ui/react'
import { Cookie } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie_notice_accepted'
const EXIT_ANIM_MS = 500

export function CookieNotice() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(STORAGE_KEY) !== 'true'
    })

    const [mounted, setMounted] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        if (!visible) return
        const timeout = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(timeout)
    }, [visible])

    const handleAccept = () => {
        if (isClosing) return
        setIsClosing(true)
        localStorage.setItem(STORAGE_KEY, 'true')
        setMounted(false)
        setTimeout(() => setVisible(false), EXIT_ANIM_MS)
    }

    if (!visible) return null

    return (
        <Portal>
            <Box
                position="fixed"
                bottom={{ base: 8, md: 12 }}
                left="50%"
                zIndex={9999}
                transform={mounted && !isClosing ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(20px) scale(0.98)'}
                opacity={mounted && !isClosing ? 1 : 0}
                transition={`all ${EXIT_ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`}
                pointerEvents={mounted && !isClosing ? 'auto' : 'none'}
                w="max-content"
                maxW="90vw"
            >
                <Box
                    bg="rgba(10, 10, 10, 0.85)"
                    backdropFilter="blur(24px) saturate(180%)"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    borderRadius="24px"
                    p={{ base: 5, md: 6 }}
                    boxShadow="0 32px 64px -16px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
                    maxW="600px"
                >
                    <VStack align="stretch" gap={5}>
                        <HStack gap={3} align="center">
                            <Box
                                p={2.5}
                                borderRadius="14px"
                                bg="whiteAlpha.100"
                                color="teal.300"
                            >
                                <Cookie size={20} />
                            </Box>
                            <Text color="white" fontSize="md" fontWeight="600" letterSpacing="-0.01em">
                                Cookie & Приватность
                            </Text>
                        </HStack>

                        <Text fontSize="14px" color="whiteAlpha.700" lineHeight="1.6">
                            Мы используем файлы cookie для улучшения вашего опыта. Продолжая просмотр, вы соглашаетесь с{' '}
                            <Box as="span" whiteSpace="nowrap">
                                нашей{' '}
                                <Link
                                    href="/privacy" 
                                    color="white" 
                                    textDecoration="underline" 
                                    textUnderlineOffset="4px"
                                    _hover={{ color: 'teal.300' }}
                                >
                                    политикой конфиденциальности
                                </Link>
                            </Box>.
                        </Text>

                        <Button
                            onClick={handleAccept}
                            w="full"
                            h="46px"
                            bg="white"
                            color="black"
                            fontSize="14px"
                            fontWeight="700"
                            borderRadius="16px"
                            _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-1px)' }}
                            _active={{ bg: 'whiteAlpha.800', transform: 'translateY(0)' }}
                            transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                        >
                            Принять и закрыть
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </Portal>
    )
}
