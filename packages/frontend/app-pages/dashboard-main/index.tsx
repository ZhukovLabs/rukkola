'use client';

import {
    Box,
    SimpleGrid,
    Heading,
    Text,
    Spinner,
    Center,
    Flex,
    Icon,
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
    FiInfo,
    FiShield,
    FiZap,
} from "react-icons/fi";
import {motion} from "framer-motion";

const MotionBox = motion(Box);

const quickLinks = [
    {
        title: "Товары",
        description: "Управляйте каталогом товаров",
        icon: FiBox,
        path: "/dashboard/products",
    },
    {
        title: "Категории",
        description: "Организуйте структуру меню",
        icon: FiGrid,
        path: "/dashboard/categories",
    },
    {
        title: "Обеды",
        description: "Настройте изображения обедов",
        icon: FiCoffee,
        path: "/dashboard/lunches",
    },
    {
        title: "История",
        description: "Логи действий пользователей",
        icon: FiClock,
        path: "/dashboard/history",
        roles: ['admin'] as const,
    },
];

const infoBlocks = [
    {
        icon: FiZap,
        title: "Быстрое редактирование",
        text: "Все изменения сохраняются автоматически. Используйте меню слева для навигации между разделами.",
    },
    {
        icon: FiShield,
        title: "Безопасность",
        text: "Действия администраторов логируются. Следите за историей изменений в разделе «История».",
    },
    {
        icon: FiInfo,
        title: "О панели",
        text: "Здесь вы можете управлять товарами, категориями и обедами вашего кафе. Контролируйте содержимое сайта.",
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
            <Center minH="200px">
                <Spinner size="xl" color="gray.300"/>
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
        <Box>
            <Box mb={8}>
                <Heading
                    fontSize={{base: "2xl", md: "3xl"}}
                    color="white"
                    fontWeight="bold"
                    mb={1}
                    lineClamp={2}
                    wordBreak="break-word"
                >
                    {getGreeting()}{fullName ? `, ${fullName}` : ''}!
                </Heading>
                <Text color="gray.500" fontSize="md" textTransform="capitalize">
                    {formatDate()}
                </Text>
            </Box>

            <StatsGrid stats={dashboardStats}/>

            <Box mt={10}>
                <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={4}
                >
                    Быстрый доступ
                </Text>
                <SimpleGrid columns={{base: 1, md: 2}} gap={{base: 4, md: 5}}>
                    {quickLinks
                        .filter((link) => !link.roles || (user && (link.roles as readonly string[]).includes(user.role)))
                        .map((link, index) => (
                        <MotionBox
                            key={link.path}
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3, delay: index * 0.08}}
                            bg="gray.800"
                            border="1px solid"
                            borderColor="gray.700"
                            borderRadius="2xl"
                            p={{base: 4, md: 5}}
                            cursor="pointer"
                            onClick={() => router.push(link.path)}
                            _hover={{
                                borderColor: "gray.600",
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                            }}
                        >
                            <Flex justify="space-between" align="center">
                                <Flex align="center" gap={4}>
                                    <Box
                                        bg="gray.700"
                                        p={3}
                                        borderRadius="xl"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        border="1px solid"
                                        borderColor="gray.600"
                                    >
                                        <Icon as={link.icon} boxSize={5} color="gray.300"/>
                                    </Box>
                                    <Box>
                                        <Text color="white" fontWeight="semibold" fontSize="md" mb={0.5}>
                                            {link.title}
                                        </Text>
                                        <Text color="gray.400" fontSize="sm">
                                            {link.description}
                                        </Text>
                                    </Box>
                                </Flex>
                                <Box color="gray.600">
                                    <FiArrowRight size={18}/>
                                </Box>
                            </Flex>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Box>

            <Box mt={10}>
                <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={4}
                >
                    Информация
                </Text>
                <SimpleGrid columns={{base: 1, md: 3}} gap={{base: 4, md: 5}}>
                    {infoBlocks.map((block, index) => (
                        <MotionBox
                            key={block.title}
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3, delay: 0.3 + index * 0.08}}
                            bg="gray.800"
                            border="1px solid"
                            borderColor="gray.700"
                            borderRadius="2xl"
                            p={5}
                        >
                            <Flex align="center" gap={3} mb={3}>
                                <Box
                                    bg="gray.700"
                                    p={2}
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon as={block.icon} boxSize={4} color="gray.300"/>
                                </Box>
                                <Text color="white" fontWeight="semibold" fontSize="sm">
                                    {block.title}
                                </Text>
                            </Flex>
                            <Text color="gray.400" fontSize="sm" lineHeight="tall">
                                {block.text}
                            </Text>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
};
