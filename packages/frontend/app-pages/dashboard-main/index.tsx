'use client';

import {
    Box,
    Card,
    SimpleGrid,
    Heading,
    Text,
    Spinner,
    Center,
    Flex,
    Icon,
    VStack,
} from "@chakra-ui/react";
import {useAuth} from "@/lib/auth/auth-context";
import {StatsGrid} from "./stats-grid";
import {getDashboardStats, type DashboardData} from "@/lib/api/dashboard";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
    FiBox,
    FiGrid,
    FiCoffee,
    FiClock,
    FiArrowRight,
    FiShield,
    FiZap,
    FiHome,
} from "react-icons/fi";
import {motion} from "framer-motion";

const MotionBox = motion.create(Box);

const linkColors: Record<string, string> = {
    products: "orange",
    categories: "green",
    lunches: "pink",
    history: "teal",
};

const quickLinks = [
    {
        id: "products",
        title: "Товары",
        description: "Управляйте каталогом товаров",
        icon: FiBox,
        path: "/dashboard/products",
    },
    {
        id: "categories",
        title: "Категории",
        description: "Организуйте структуру меню",
        icon: FiGrid,
        path: "/dashboard/categories",
    },
    {
        id: "lunches",
        title: "Обеды",
        description: "Настройте изображения обедов",
        icon: FiCoffee,
        path: "/dashboard/lunches",
    },
    {
        id: "history",
        title: "История",
        description: "Логи действий пользователей",
        icon: FiClock,
        path: "/dashboard/history",
        roles: ['admin'] as const,
    },
];

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "Доброй ночи";
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
}

function formatDate(): string {
    return new Date().toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export const Dashboard = () => {
    const {user, status} = useAuth();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') return;

        const fetchData = async () => {
            try {
                const result = await getDashboardStats();
                if (result.success && result.data) {
                    setDashboardData(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <Center minH="300px">
                <VStack gap={4}>
                    <Spinner size="xl" color="teal.500" />
                    <Text color="gray.500" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                        Загрузка...
                    </Text>
                </VStack>
            </Center>
        );
    }

    const fullName = dashboardData?.fullName || '';
    const dashboardStats = dashboardData?.stats || {
        products: 0,
        hiddenProducts: 0,
        categories: 0,
        users: 0,
    };

    return (
        <Box minH="100vh" pb={8}>
            <MotionBox
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, ease: "easeOut"}}
            >
                <Card.Root
                    w="100%"
                    borderRadius="3xl"
                    shadow="0 30px 60px rgba(0,0,0,0.5)"
                    border="1px solid"
                    borderColor="gray.800"
                    bg="gray.950"
                    overflow="hidden"
                >
                    <Card.Header
                        bg="gray.900/50"
                        py={5}
                        px={6}
                        borderBottom="1px solid"
                        borderColor="gray.800"
                    >
                        <Flex align="center" gap={4}>
                            <Box
                                bg="teal.900/30"
                                borderRadius="2xl"
                                p={3}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="teal.700/30"
                                shadow="0 0 20px rgba(20, 184, 166, 0.1)"
                            >
                                <Icon as={FiHome} boxSize={6} color="teal.400" />
                            </Box>
                            <VStack align="start" gap={0}>
                                <Heading size="lg" fontWeight="black" color="white" letterSpacing="tight">
                                    {getGreeting()}{fullName ? `, ${fullName}` : ''}!
                                </Heading>
                                <Flex align="center" gap={2} mt={0.5}>
                                    <Box boxSize="6px" borderRadius="full" bg="teal.500" shadow="0 0 8px rgba(20, 184, 166, 0.6)" />
                                    <Text color="gray.500" fontSize="sm" fontWeight="medium" textTransform="capitalize">
                                        {formatDate()}
                                    </Text>
                                </Flex>
                            </VStack>
                        </Flex>
                    </Card.Header>

                    <Card.Body px={6} py={8}>
                        <StatsGrid stats={dashboardStats} />

                        <Box mt={10}>
                            <Flex align="center" gap={3} mb={5}>
                                <Box boxSize="8px" borderRadius="full" bg="teal.500" shadow="0 0 10px rgba(20, 184, 166, 0.6)" />
                                <Text fontSize="sm" fontWeight="black" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                    Быстрый доступ
                                </Text>
                                <Box flex="1" h="1px" bg="gray.800" />
                            </Flex>

                            <SimpleGrid columns={{base: 1, md: 2}} gap={{base: 4, md: 5}}>
                                {quickLinks
                                    .filter((link) => !link.roles || (user && (link.roles as readonly string[]).includes(user.role)))
                                    .map((link, index) => {
                                        const color = linkColors[link.id];
                                        return (
                                        <MotionBox
                                            key={link.path}
                                            initial={{opacity: 0, y: 12}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.3, delay: index * 0.08}}
                                            bg="gray.900"
                                            border="1px solid"
                                            borderColor="gray.800"
                                            borderRadius="2xl"
                                            cursor="pointer"
                                            onClick={() => router.push(link.path)}
                                            _hover={{
                                                borderColor: `${color}.700/50`,
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.5)",
                                            }}
                                            position="relative"
                                            overflow="hidden"
                                        >
                                            <Flex p={5} align="center" gap={4}>
                                                <Box
                                                    bg={`${color}.900/30`}
                                                    p={3.5}
                                                    borderRadius="2xl"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    border="1px solid"
                                                    borderColor={`${color}.700/30`}
                                                    flexShrink={0}
                                                >
                                                    <Icon as={link.icon} boxSize={5} color={`${color}.400`} />
                                                </Box>
                                                <Box flex="1" minW={0}>
                                                    <Text color="white" fontWeight="bold" fontSize="md" mb={0.5}>
                                                        {link.title}
                                                    </Text>
                                                    <Text color="gray.500" fontSize="sm">
                                                        {link.description}
                                                    </Text>
                                                </Box>
                                                <Box color="gray.700" flexShrink={0}>
                                                    <FiArrowRight size={18} />
                                                </Box>
                                            </Flex>
                                        </MotionBox>
                                        );
                                    })}
                            </SimpleGrid>
                        </Box>

                        <Flex mt={10} gap={4} direction={{base: "column", md: "row"}}>
                            {[
                                { icon: FiZap, title: "Быстрое редактирование", text: "Все изменения сохраняются автоматически. Используйте меню слева для навигации между разделами." },
                                { icon: FiShield, title: "Безопасность", text: "Действия администраторов логируются. Следите за историей изменений в разделе «История»." },
                            ].map((block, index) => (
                                <MotionBox
                                    key={block.title}
                                    initial={{opacity: 0, y: 12}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.3, delay: 0.4 + index * 0.08}}
                                    bg="gray.900"
                                    border="1px solid"
                                    borderColor="gray.800"
                                    borderRadius="2xl"
                                    p={4}
                                    flex="1"
                                >
                                    <Flex align="center" gap={3}>
                                        <Box
                                            bg="whiteAlpha.50"
                                            p={2}
                                            borderRadius="lg"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            border="1px solid"
                                            borderColor="whiteAlpha.100"
                                        >
                                            <Icon as={block.icon} boxSize={4} color="gray.400" />
                                        </Box>
                                        <Text color="white" fontWeight="semibold" fontSize="sm">
                                            {block.title}
                                        </Text>
                                    </Flex>
                                    <Text color="gray.500" fontSize="xs" mt={2} lineHeight="tall">
                                        {block.text}
                                    </Text>
                                </MotionBox>
                            ))}
                        </Flex>
                    </Card.Body>
                </Card.Root>
            </MotionBox>
        </Box>
    );
};
