'use client';

import {Box, Skeleton, SimpleGrid, HStack, VStack, Text} from "@chakra-ui/react";
import {useState, useEffect} from "react";
import {MotionBox} from "@/lib/motion-box";

const loaderTexts = [
    "Готовим вкусности…",
    "Нарезаем и сервируем…",
    "Скоро на столе…",
    "Паста варится…",
    "Подготовка ингредиентов…",
    "Щёлк-щёлк, почти готово…",
    "Вкусняшки загружаются…",
    "Меню оживает…",
    "Добавляем специй…",
    "Разогреваем сковородку…",
    "Варим, тушим, жарим…",
    "Взбиваем настроение…",
    "Приправляем любовью…",
    "Проверяем рецепты…",
    "Мешаем и помешиваем…",
    "Сервируем красиво…",
    "Пробуем на вкус…",
    "Вкусное меню почти готово…"
];

function ProductCardSkeleton() {
    return (
        <Box
            display="flex"
            flexDir={{base: "column", md: "row"}}
            borderWidth="1px"
            borderRadius={{base: "md", md: "xl"}}
            borderColor="gray.700"
            bg="gray.800"
            overflow="hidden"
            opacity={0.7}
        >
            <Box
                w={{base: "100%", md: "45%"}}
                aspectRatio={3 / 2}
                bg="gray.750"
            />
            <Box flex="1" p={{base: 3, md: 5}} display="flex" flexDirection="column" gap={3}>
                <Skeleton height="22px" width="70%" borderRadius="md" bg="gray.700"/>
                <Skeleton height="14px" width="100%" borderRadius="sm" bg="gray.700"/>
                <Skeleton height="14px" width="85%" borderRadius="sm" bg="gray.700"/>
                <Box mt="auto" display="flex" flexDirection="column" gap={2}>
                    <Skeleton height="14px" width="50%" borderRadius="sm" bg="gray.700"/>
                    <Skeleton height="36px" width="100%" borderRadius="full" bg="gray.700"/>
                </Box>
            </Box>
        </Box>
    );
}

export const MenuLoader = () => {
    const [textIndex, setTextIndex] = useState(() => Math.floor(Math.random() * loaderTexts.length));
    const text = loaderTexts[textIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % loaderTexts.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box my={6} px={4} position="relative">
            <MotionBox
                position="fixed"
                top={4}
                left="50%"
                transform="translateX(-50%)"
                bg="rgba(20,20,30,0.85)"
                backdropFilter="blur(12px)"
                px={5}
                py={3}
                borderRadius="full"
                boxShadow="0 4px 24px rgba(0,0,0,0.5)"
                zIndex={9999}
                whiteSpace="nowrap"
            >
                <HStack gap={3}>
                    <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg="teal.400"
                        animation="pulse 1.2s ease-in-out infinite"
                        css={{
                            '@keyframes pulse': {
                                '0%, 100%': {opacity: 0.3, transform: 'scale(0.8)'},
                                '50%': {opacity: 1, transform: 'scale(1)'}
                            }
                        }}
                    />
                    <Text color="white" fontWeight="medium" fontSize="sm">
                        {text}
                    </Text>
                </HStack>
            </MotionBox>

            <VStack gap={6} align="stretch" mt={16}>
                <Box as="section">
                    <Skeleton height="32px" width="200px" borderRadius="md" bg="gray.700" mb={6}/>
                    <SimpleGrid columns={{base: 1, sm: 2, xl: 3}} gap={6}>
                        {[...Array(6)].map((_, i) => (
                            <ProductCardSkeleton key={i}/>
                        ))}
                    </SimpleGrid>
                </Box>

                <Box as="section">
                    <Skeleton height="32px" width="160px" borderRadius="md" bg="gray.700" mb={6}/>
                    <SimpleGrid columns={{base: 1, sm: 2, xl: 3}} gap={6}>
                        {[...Array(3)].map((_, i) => (
                            <ProductCardSkeleton key={i}/>
                        ))}
                    </SimpleGrid>
                </Box>
            </VStack>
        </Box>
    );
};
