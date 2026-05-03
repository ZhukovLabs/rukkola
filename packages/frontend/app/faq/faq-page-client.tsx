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
    Link,
} from '@chakra-ui/react'
import { 
    ArrowLeft,
} from 'lucide-react'
import NextLink from 'next/link'
import { motion } from 'framer-motion'
import CtaBlock from '../../components/cta-block'

const MotionBox = motion.create(Box)

const faqItems = [
    {
        question: "Где находится кафе «Руккола»?",
        answer: (
            <>
                Кафе «Руккола» расположено в самом центре Гомеля по адресу:{" "}
                <Link 
                    as={NextLink} 
                    href="https://yandex.by/maps/org/rukkola/22014226743/?ll=31.003680%2C52.438805&z=20.4" 
                    target="_blank"
                    color="white"
                    textDecoration="underline"
                    _hover={{ color: "whiteAlpha.800" }}
                >
                    ул. Советская, 60
                </Link>{" "}
                (возле ГГУ им. Ф. Скорины). Вы всегда можете найти нас по яркой вывеске на главной улице города.
            </>
        )
    },
    {
        question: "Какой у вас график работы?",
        answer: "Мы работаем для вас ежедневно с 12:00 до 23:00. Будем рады видеть вас на обед, ужин или просто на чашечку ароматного кофе."
    },
    {
        question: "Есть ли у вас доставка?",
        answer: (
            <>
                На данный момент мы работаем в формате обслуживания в зале и навынос (самовывоз). Вы можете оформить предварительный заказ по телефону{" "}
                <Link 
                    as={NextLink} 
                    href="tel:+375447703003" 
                    color="white"
                    textDecoration="underline"
                    _hover={{ color: "whiteAlpha.800" }}
                >
                    +375 (44) 770-30-03
                </Link>{" "}
                и забрать его в удобное для вас время.
            </>
        )
    },
    {
        question: "Как забронировать столик?",
        answer: (
            <>
                Для бронирования столика, пожалуйста, позвоните нам по номеру{" "}
                <Link 
                    as={NextLink} 
                    href="tel:+375447703003" 
                    color="white"
                    textDecoration="underline"
                    _hover={{ color: "whiteAlpha.800" }}
                >
                    +375 (44) 770-30-03
                </Link>
                . Мы рекомендуем планировать ваш визит заранее, особенно в праздничные и выходные дни.
            </>
        )
    },
    {
        question: "Есть ли в меню блюда для вегетарианцев?",
        answer: "Да, конечно! В нашем меню представлены вегетарианские пиццы, роллы и другие закуски."
    },
    {
        question: "Можно ли провести у вас мероприятие?",
        answer: (
            <>
                Да, мы принимаем заказы на проведение камерных мероприятий: дней рождения, небольших корпоративов или встреч с друзьями. Для обсуждения условий и банкетного меню свяжитесь с нами по телефону{" "}
                <Link 
                    as={NextLink} 
                    href="tel:+375447703003" 
                    color="white"
                    textDecoration="underline"
                    _hover={{ color: "whiteAlpha.800" }}
                >
                    +375 (44) 770-30-03
                </Link>
                .
            </>
        )
    },
    {
        question: "Предлагаете ли вы завтраки и ланчи?",
        answer: "Да, мы предлагаем обеды в будние дни с 12:00 до 16:00. В меню входят разнообразные обеденные сеты по доступной цене — сытный и быстрый перекус в центре города."
    },
    {
        question: "Какая кухня представлена в «Рукколе»?",
        answer: "Мы специализируемся на паназиатской кухне (свежие суши, роллы, блюда WOK), а также предлагаем авторскую пиццу. Актуальное меню с фотографиями и ценами всегда доступно на главной странице нашего сайта."
    },
    {
        question: "Почему у вас на сайте написано «Пинца» — это опечатка?",
        answer: "Нет, всё верно! Пинца — это римская пицца. Тесто для неё делают из смеси пшеничной, рисовой и соевой муки, долго ферментируют и благодаря этому она получается воздушной и лёгкой — совсем не такая, как обычная пицца."
    }
]

export default function FAQPageClient() {
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
                                FAQ
                            </Heading>
                        </VStack>
                    </MotionBox>

                    {/* Content */}
                    <VStack align="stretch" gap={20}>
                        {faqItems.map((item, index) => (
                            <FAQItem 
                                key={index}
                                number={(index + 1).toString().padStart(2, '0')}
                                question={item.question}
                                answer={item.answer}
                            />
                        ))}
                    </VStack>

                    <CtaBlock
                        heading="Остались вопросы?"
                        subtitle={<>Мы всегда на связи и готовы помочь <br/> вам с выбором или бронированием.</>}
                        watermark="FAQ"
                    />

                </VStack>
            </Container>
        </Box>
    )
}

function FAQItem({ number, question, answer }: { number: string, question: string, answer: React.ReactNode }) {
    return (
        <VStack align="stretch" gap={6}>
            <HStack align="baseline" gap={4}>
                <Text fontSize="xs" fontWeight="900" color="whiteAlpha.400">{number}</Text>
                <Heading size="md" fontWeight="900" textTransform="uppercase" letterSpacing="tight">
                    {question}
                </Heading>
            </HStack>
            <Text color="whiteAlpha.600" fontSize="lg" lineHeight="1.6" maxW="600px">
                {answer}
            </Text>
            <Separator borderColor="whiteAlpha.100" />
        </VStack>
    )
}
