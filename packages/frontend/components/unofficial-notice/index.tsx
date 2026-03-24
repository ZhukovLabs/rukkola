'use client'

import {
    Box,
    Flex,
    Link,
    Text,
    IconButton,
    HStack,
    VStack,
    Badge,
} from '@chakra-ui/react'
import { X, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'unofficial_notice_closed'
const EXIT_ANIM_MS = 300

export function UnofficialNotice() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(STORAGE_KEY) !== 'true'
    })

    const [mounted, setMounted] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        if (!visible) return

        const raf = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(raf)
    }, [visible])

    const handleClose = () => {
        if (isClosing) return
        setIsClosing(true)
        localStorage.setItem(STORAGE_KEY, 'true')
        setMounted(false)
        setTimeout(() => setVisible(false), EXIT_ANIM_MS)
    }

    if (!visible) return null

    return (
        <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex="banner"
            transform={mounted && !isClosing ? 'translateY(0)' : 'translateY(100%)'}
            transition={`transform ${EXIT_ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`}
            opacity={mounted && !isClosing ? 1 : 0}
            pointerEvents={mounted && !isClosing ? 'auto' : 'none'}
        >
            <Box
                position="relative"
                bgGradient="linear(135deg, #0f766e 0%, #0d9488 100%)"
                backdropFilter="blur(20px)"
                borderTop="3px solid"
                borderColor="whiteAlpha.300"
                boxShadow="0 -8px 40px rgba(13, 148, 136, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="1px"
                    bgGradient="linear(to-r, transparent, whiteAlpha.400, transparent)"
                />

                <Flex
                    align="center"
                    maxW="1000px"
                    mx="auto"
                    px={4}
                    py={3}
                    gap={3}
                >
                    <VStack align="stretch" gap={1.5} flex="1">
                        <HStack gap={2} flexWrap="wrap">
                            <Text
                                fontWeight={800}
                                fontSize="sm"
                                color="white"
                                letterSpacing="tight"
                            >
                                Важное уведомление
                            </Text>
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                bg="whiteAlpha.200"
                                color="white"
                                fontSize="xs"
                                fontWeight={600}
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                                textTransform="none"
                            >
                                Неофициальный сайт
                            </Badge>
                        </HStack>

                        <Text fontSize="xs" color="whiteAlpha.900" lineHeight="tall">
                            Это неофициальный сайт кафе «Руккола» (Гомель). Не является представительством кафе и не имеет договорных отношений с владельцами бренда. Создан в личных целях для обмена информацией.
                        </Text>

                        <HStack gap={3} flexWrap="wrap">
                            <Text fontSize="xs" color="whiteAlpha.700">
                                Официальный сайт:
                            </Text>
                            <Link
                                href="https://rukkola-gomel.by/"
                                target="_blank"
                                rel="noopener noreferrer"
                                fontWeight={700}
                                color="white"
                                fontSize="xs"
                                display="inline-flex"
                                alignItems="center"
                                gap={1}
                                px={2}
                                py={0.5}
                                borderRadius="md"
                                bg="whiteAlpha.100"
                                _hover={{
                                    bg: 'whiteAlpha.200',
                                }}
                                transition="all 0.2s"
                            >
                                rukkola-gomel.by
                                <ExternalLink size={12} />
                            </Link>
                        </HStack>
                    </VStack>

                    <IconButton
                        aria-label="Закрыть"
                        onClick={handleClose}
                        size="sm"
                        variant="ghost"
                        bg="whiteAlpha.100"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        _active={{ bg: 'whiteAlpha.300', transform: 'scale(0.95)' }}
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        borderRadius="full"
                        w={8}
                        h={8}
                        flexShrink={0}
                        transition="all 0.2s"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </IconButton>
                </Flex>
            </Box>
        </Box>
    )
}
