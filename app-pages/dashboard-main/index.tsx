import {Box, SimpleGrid, Heading, Text} from "@chakra-ui/react";
import {connectToDatabase} from "@/lib/mongoose";
import {Product} from "@/models/product";
import {Category} from "@/models/category";
import {User} from "@/models/user";
import {StatsGrid} from "./sats-grid";
import {auth} from "@/lib/auth";
import {checkAuth} from "@/lib/auth/check-auth";

export const Dashboard = async () => {
    await checkAuth();
    await connectToDatabase();

    const [productsCount, hiddenProductsCount, categoriesCount, usersCount] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({hidden: true}),
        Category.countDocuments(),
        User.countDocuments(),
    ]);

    const session = await auth();
    const user = session?.user;

    const fullName = user ? `${user.name ?? ""} ${user.surname ?? ""} ${user.patronymic ?? ""}`.trim() : "";

    return (
        <Box>
            {fullName && (
                <Heading mb={6} fontSize={{base: "2xl", md: "3xl"}} color="teal.300">
                    Добро пожаловать, {fullName}!
                </Heading>
            )}

            <StatsGrid
                stats={{
                    products: productsCount,
                    hiddenProducts: hiddenProductsCount,
                    categories: categoriesCount,
                    users: usersCount,
                }}
            />

            <Box mt={10} p={{base: 4, md: 6}} bg="gray.800" borderRadius="2xl" boxShadow="0 8px 24px rgba(0,0,0,0.3)">
                <Heading mb={4} fontSize={{base: "xl", md: "2xl"}} color="teal.300">
                    О панели администратора
                </Heading>
                <Text mb={2} color="gray.300">
                    Здесь вы можете управлять продуктами и категориями вашего магазина.
                </Text>
                <Text mb={2} color="gray.300">
                    Используйте меню слева для навигации и выбора нужного раздела.
                </Text>
                <Text color="gray.400">
                    Все изменения сохраняются автоматически. Следите за статистикой и контролируйте содержимое сайта.
                </Text>
            </Box>

            <SimpleGrid columns={{base: 1, md: 3}} gap={{base: 4, md: 6}} mt={8}>
                <Box p={4} bg="gray.700" borderRadius="xl" boxShadow="0 6px 18px rgba(0,0,0,0.25)">
                    <Heading fontSize="lg" color="teal.300" mb={2}>
                        Управление продуктами
                    </Heading>
                    <Text color="gray.300">
                        Добавляйте новые продукты, редактируйте существующие и скрывайте ненужные.
                    </Text>
                </Box>

                <Box p={4} bg="gray.700" borderRadius="xl" boxShadow="0 6px 18px rgba(0,0,0,0.25)">
                    <Heading fontSize="lg" color="teal.300" mb={2}>
                        Категории
                    </Heading>
                    <Text color="gray.300">
                        Организуйте продукты по категориям для удобства навигации и отображения на сайте.
                    </Text>
                </Box>

                <Box p={4} bg="gray.700" borderRadius="xl" boxShadow="0 6px 18px rgba(0,0,0,0.25)">
                    <Heading fontSize="lg" color="teal.300" mb={2}>
                        Статистика
                    </Heading>
                    <Text color="gray.300">
                        Отслеживайте общее количество продуктов и категорий в вашей системе.
                    </Text>
                </Box>
            </SimpleGrid>
        </Box>
    );
};
