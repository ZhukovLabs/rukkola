'use client'

import {
    Alert,
    Box,
    Flex,
    Link,
    Text,
    IconButton,
    HStack,
    VStack,
    Tag,
    Icon,
} from '@chakra-ui/react'
import { X, ExternalLink, Leaf } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'unofficial_notice_closed'
const EXIT_ANIM_MS = 280

export function UnofficialNotice() {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(STORAGE_KEY) !== 'true'
    })

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!visible) return

        const raf = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(raf)
    }, [visible])

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setMounted(false)
        setTimeout(() => setVisible(false), EXIT_ANIM_MS)
    }

    if (!visible) return null

    return (
        <Alert.Root
            status="info"
            variant="left-accent"
            colorPalette="teal"
            size="md"
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            maxWidth="100%"
            zIndex="banner"
            borderRadius="md md 0 0"
            boxShadow="0 -6px 20px rgba(0, 0, 0, 0.14)"
            transform={mounted ? 'translateY(0)' : 'translateY(100%)'}
            transition={`transform ${EXIT_ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${EXIT_ANIM_MS}ms`}
            opacity={mounted ? 1 : 0}
            pointerEvents={mounted ? 'auto' : 'none'}
        >
            <Box
                width="100%"
                px={{ base: 3, md: 5 }}
                py={{ base: 2.5, md: 3 }}
                bgGradient="linear(to-r, teal.50, teal.100/40)"
                backdropFilter="saturate(150%) blur(10px)"
                borderTop="1px solid"
                borderColor="teal.200/70"
            >
                <Flex
                    align="center"
                    maxW="1200px"
                    mx="auto"
                    gap={{ base: 3, md: 4 }}
                    justify="space-between"
                >
                    <HStack gap={3} align="center" flex="1">
                        <Icon as={Leaf} boxSize={{ base: 5, md: 6 }} color="teal.600" />

                        <VStack align="stretch" gap={0.5}>
                            <HStack gap={2} flexWrap="wrap">
                                <Text fontWeight={700} fontSize={{ base: 'sm', md: 'md' }}>
                                    Важное уведомление: неофициальный сайт кафе «Руккола» (Гомель)
                                </Text>
                                <Tag.Root
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="teal"
                                    display={{ base: 'none', sm: 'inline-flex' }}
                                >
                                    <Tag.Label>Независимый ресурс</Tag.Label>
                                </Tag.Root>
                            </HStack>

                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                opacity={0.9}
                                lineHeight="short"
                            >
                                Настоящий сайт НЕ является официальным представителем кафе «Руккола», не имеет договорных или иных отношений с администрацией, владельцами или правообладателями товарного знака «Руккола».
                            </Text>

                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                opacity={0.9}
                                lineHeight="short"
                            >
                                Сайт создан независимым третьим лицом исключительно в личных некоммерческих целях и для обмена информацией между посетителями. Администрация сайта не несёт ответственности за актуальность, достоверность или полноту размещённой информации.
                            </Text>

                            <Text
                                fontSize={{ base: 'xs', md: 'sm' }}
                                opacity={0.92}
                                mt={0.5}
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                            >
                                Официальный сайт:
                                <Link
                                    href="https://rukkola-gomel.by/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    fontWeight={600}
                                    textDecoration="underline"
                                    color="teal.500"
                                    _hover={{ color: 'teal.600', textDecoration: 'none' }}
                                    transition="all 0.2s"
                                    display="inline-flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    rukkola-gomel.by
                                    <ExternalLink size={14} />
                                </Link>
                            </Text>

                            <Text fontSize="xs" opacity={0.7} mt={1}>
                                Все права на товарный знак, фирменное наименование и иные объекты интеллектуальной собственности принадлежат их законным правообладателям.
                            </Text>
                        </VStack>
                    </HStack>

                    <IconButton
                        aria-label="Закрыть уведомление"
                        onClick={handleClose}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                        bg="transparent"
                        color="teal.700"
                        _hover={{ bg: 'teal.100' }}
                        _active={{ bg: 'teal.200' }}
                        border="2px solid"
                        borderColor="teal.400"
                        borderRadius="full"
                        minW={9}
                        h={9}
                        p={1}
                    >
                        <X size={18} strokeWidth={2.8} color="white" />
                    </IconButton>
                </Flex>

                <Text
                    textAlign="center"
                    fontSize="xs"
                    opacity={0.6}
                    mt={2}
                    display={{ base: 'block', md: 'none' }}
                >
                    Создан: 01.02.2025 · Последнее обновление: 18.01.2026
                </Text>
            </Box>
        </Alert.Root>
    )
}