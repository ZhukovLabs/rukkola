"use client";

import {useEffect} from "react";
import {Box, Flex, Heading, Text, Button, Icon} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {FiHome, FiAlertTriangle} from "react-icons/fi";
import Link from "next/link";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

export const NotFound = () => {
    const reducedMotion = typeof window !== "undefined" 
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
        : false;

    useEffect(() => {
        if (!reducedMotion) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) location.reload();
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [reducedMotion]);

    const bgBlobProps = (delay = 0) => reducedMotion
        ? {initial: {opacity: 0}, animate: {opacity: 0.12}, transition: {duration: 0}}
        : {
            initial: {scale: 0.8, opacity: 0},
            animate: {scale: [1, 1.1, 1], opacity: 1},
            transition: {duration: 12, repeat: Infinity, ease: "easeInOut" as const, delay},
        };

    return (
        <Box
            minH="100vh"
            bg="gray.900"
            overflow="hidden"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
        >
            <MotionBox
                position="absolute"
                top="-30%"
                left="-30%"
                w={{base: "350px", md: "700px"}}
                h={{base: "350px", md: "700px"}}
                bgGradient="radial(circle, gray.500 0%, transparent 60%)"
                opacity={0.12}
                borderRadius="full"
                filter="blur(50px)"
                willChange="transform"
                {...bgBlobProps()}
            />
            <MotionBox
                position="absolute"
                bottom="-40%"
                right="-35%"
                w={{base: "400px", md: "900px"}}
                h={{base: "400px", md: "900px"}}
                bgGradient="radial(circle, purple.600 0%, transparent 70%)"
                opacity={0.1}
                borderRadius="full"
                filter="blur(60px)"
                willChange="transform"
                {...bgBlobProps(4)}
            />

            <Flex
                direction="column"
                align="center"
                textAlign="center"
                maxW="700px"
                zIndex={10}
                gap={6}
            >
                <MotionBox
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{type: "spring", stiffness: 200, damping: 10}}
                >
                    <MotionBox
                        animate={reducedMotion ? {} : {
                            scale: [1, 1.15, 1],
                            rotate: [0, -5, 5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                        }}
                    >
                        <Icon
                            as={FiAlertTriangle}
                            boxSize={{base: 16, md: 20}}
                            color="yellow.400"
                            filter="drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))"
                        />
                    </MotionBox>
                </MotionBox>

                <MotionHeading
                    fontSize={{base: "8xl", md: "9xl"}}
                    fontWeight="black"
                    letterSpacing="tight"
                    color="white"
                    initial={{y: -100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        delay: 0.2,
                    }}
                    textShadow="0 10px 30px rgba(0,0,0,0.4)"
                >
                    4
                    <MotionBox
                        as="span"
                        display="inline-block"
                        mx={2}
                        color="gray.400"
                        animate={reducedMotion ? {} : {
                            y: [0, -15, 0],
                            rotate: [0, -10, 10, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                        }}
                        filter="drop-shadow(0 0 15px rgba(56, 178, 172, 0.6))"
                    >
                        0
                    </MotionBox>
                    4
                </MotionHeading>

                <MotionHeading
                    fontSize={{base: "2xl", md: "3xl"}}
                    fontWeight="bold"
                    color="whiteAlpha.900"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.6}}
                >
                    Ой! Эта страница улетела на орбиту
                </MotionHeading>

                <MotionText
                    fontSize={{base: "md", md: "lg"}}
                    color="gray.300"
                    maxW="500px"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.7}}
                >
                    Но не переживайте — мы вернём вас на Землю за один клик.
                </MotionText>

                {/* КНОПКА "НА ГЛАВНУЮ" */}
                <MotionButton
                    as={Link}
                    // @ts-expect-error - норм)
                    href="/"
                    leftIcon={<FiHome/>}
                    mt={4}
                    size="lg"
                    bgGradient="linear(to-r, gray.400, gray.600)"
                    color="white"
                    fontWeight="bold"
                    borderRadius="full"
                    px={8}
                    py={7}
                    boxShadow="0 10px 30px rgba(56, 178, 172, 0.3)"
                    _hover={{
                        bgGradient: "linear(to-r, gray.500, gray.700)",
                        transform: "translateY(-4px)",
                        boxShadow: "0 15px 35px rgba(56, 178, 172, 0.4)",
                    }}
                    _active={{
                        transform: "translateY(-1px)",
                    }}
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.8, type: "spring", stiffness: 200}}
                    whileTap={{scale: 0.95}}
                >
                    Вернуться домой
                </MotionButton>

                {/* Маленький юмор */}
                <MotionText
                    fontSize="sm"
                    color="gray.500"
                    mt={8}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 1}}
                >
                    P.S. Даже пицца иногда теряется в доставке
                </MotionText>
            </Flex>
        </Box>
    );
}