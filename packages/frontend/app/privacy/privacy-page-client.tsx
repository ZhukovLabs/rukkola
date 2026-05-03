'use client'

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Separator,
    Button,
} from '@chakra-ui/react'
import { 
    ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CtaBlock from '../../components/cta-block'

const MotionBox = motion.create(Box)

export default function PrivacyPageClient() {
    return (
        <Box 
            minH="100vh" 
            bg="#000000"
            color="white"
            pb={{ base: 20, md: 32 }}
            position="relative"
            overflowX="hidden"
        >
            <Container maxW="container.md" pt={{ base: 12, md: 32 }}>
                <VStack align="stretch" gap={{ base: 16, md: 24 }}>

                    <MotionBox
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <VStack align="flex-start" gap={12}>
                            <Button
                                as={Link}
                                //@ts-expect-error - is ok
                                href="/"
                                variant="ghost"
                                color="whiteAlpha.400"
                                leftIcon={<ArrowLeft size={16} />}
                                fontSize="xs"
                                letterSpacing="0.2em"
                                fontWeight="900"
                                textTransform="uppercase"
                                px={0}
                                _hover={{ color: "white", bg: "transparent" }}
                            >
                                На главную
                            </Button>

                            <Heading 
                                as="h1" 
                                fontSize={{ base: "5xl", md: "9xl" }}
                                lineHeight="0.85"
                                letterSpacing="-0.06em"
                                fontWeight="900"
                                textTransform="uppercase"
                            >
                                Приватность
                            </Heading>
                        </VStack>
                    </MotionBox>

                    {/* Content */}
                    <VStack align="stretch" gap={20}>
                        <LegalParagraph 
                            number="01"
                            title="Общие положения"
                            content="Настоящая политика конфиденциальности составлена в соответствии с требованиями законодательства и описывает методы обработки информации, которую информационный ресурс кафе «Руккола» получает о пользователях. Мы собираем данные исключительно для улучшения качества сервиса и обеспечения технической стабильности сайта."
                        />

                        <LegalParagraph 
                            number="02"
                            title="Технические данные"
                            content="При посещении сайта автоматически фиксируются технические параметры: IP-адрес, тип устройства, версия браузера и операционной системы. Эти данные необходимы для защиты от киберугроз и оптимизации отображения контента. Мы не используем эти сведения для идентификации вашей личности."
                        />

                        <LegalParagraph 
                            number="03"
                            title="Файлы Cookie"
                            content="Мы используем файлы cookie для сохранения ваших предпочтений в меню. Это позволяет сайту «запоминать» выбранные категории и обеспечивать быструю навигацию. Вы можете управлять файлами cookie в настройках своего браузера, однако их отключение может повлиять на удобство использования ресурса."
                        />

                        <LegalParagraph 
                            number="04"
                            title="Аналитика"
                            content="Для анализа посещаемости мы используем инструменты Яндекс.Метрики. Сбор информации происходит в анонимизированном виде. Мы видим статистику популярных блюд и разделов, что помогает нам развивать меню, основываясь на реальных предпочтениях наших гостей."
                        />

                        <LegalParagraph 
                            number="05"
                            title="Защита информации"
                            content="Все данные передаются по защищенному протоколы SSL. Мы применяем комплекс мер для предотвращения несанкционированного доступа к техническим логам сайта. Доступ к информации имеет ограниченный круг специалистов администрации кафе."
                        />
                    </VStack>

                    <CtaBlock
                        heading="Приятного аппетита"
                        subtitle={<>Теперь, когда формальности соблюдены, <br/> пора перейти к делу.</>}
                        watermark="RUKKOLA"
                    />

                </VStack>
            </Container>
        </Box>
    )
}

function LegalParagraph({ number, title, content }: { number: string, title: string, content: string }) {
    return (
        <VStack align="stretch" gap={6}>
            <HStack align="baseline" gap={4}>
                <Text fontSize="xs" fontWeight="900" color="whiteAlpha.400">{number}</Text>
                <Heading size="md" fontWeight="900" textTransform="uppercase" letterSpacing="tight">
                    {title}
                </Heading>
            </HStack>
            <Text color="whiteAlpha.600" fontSize="lg" lineHeight="1.6" maxW="600px">
                {content}
            </Text>
            <Separator borderColor="whiteAlpha.100" />
        </VStack>
    )
}
