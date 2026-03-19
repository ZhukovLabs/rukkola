'use client';

import {Box, Skeleton, VStack, HStack, Spinner} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {useState, useEffect} from "react";

const MotionSkeleton = motion(Skeleton);
const MotionBox = motion(Box);

const loaderTexts = [
    "Готовим вкусности…",
    "Нарезаем и сервируем…",
    "Скоро на столе…",
    "Руккола в процессе…",
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
    "Закладываем ингредиенты…",
    "Мешаем и помешиваем…",
    "Сервируем красиво…",
    "Пробуем на вкус…",
    "Подкидываем аромат…",
    "Вкусное меню почти готово…"
];

export const MenuLoader = () => {
    const [textIndex, setTextIndex] = useState(() => Math.floor(Math.random() * loaderTexts.length));
    const [tick, setTick] = useState(0);
    const text = loaderTexts[textIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % loaderTexts.length);
            setTick(t => t + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box my={6} px={4}>
            <AnimatePresence mode="wait">
                <MotionBox
                    key={tick}
                    position="fixed"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    bg="rgba(20,20,30,0.85)"
                    p={4}
                    borderRadius="xl"
                    boxShadow="0 0 40px rgba(0,0,0,0.7)"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0, transition: {duration: 0.8}}}
                    zIndex={9999}
                >
                    <Spinner color="teal.300" size="lg"/>
                    <MotionBox
                        color="gray.300"
                        fontWeight="medium"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.6}}
                    >
                        {text}
                    </MotionBox>
                </MotionBox>
            </AnimatePresence>

            <VStack gap={6} align="center" mt={6}>
                <MotionSkeleton
                    height="440px"
                    width="638px"
                    borderRadius="2xl"
                    animate={{opacity: [0.6, 1, 0.6]}}
                    transition={{duration: 1.2, repeat: Infinity, repeatType: "loop"}}
                />

                <MotionSkeleton
                    height="42px"
                    width="366px"
                    borderRadius="lg"
                    animate={{opacity: [0.6, 1, 0.6]}}
                    transition={{duration: 1.2, repeat: Infinity, repeatType: "loop", delay: 0.1}}
                />

                <HStack gap="20px">
                    {[...Array(6)].map((_, idx) => (
                        <MotionSkeleton
                            key={idx}
                            height="36px"
                            width="100px"
                            borderRadius="md"
                            animate={{opacity: [0.6, 1, 0.6]}}
                            transition={{duration: 1.2, repeat: Infinity, repeatType: "loop", delay: 0.2 + idx * 0.1}}
                        />
                    ))}
                </HStack>
            </VStack>
        </Box>
    );
};
