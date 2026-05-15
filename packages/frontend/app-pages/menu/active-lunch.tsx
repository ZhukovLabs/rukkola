'use client';

import {
    Box,
    Flex,
    IconButton,
    Dialog,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import {useState} from "react";
import {FiX} from "react-icons/fi";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";

type ActiveLunchProps = {
    image: string;
};

export const ActiveLunch = ({image}: ActiveLunchProps) => {
    const disableMotion = useIsLowPerformanceDevice();

    const [loadedPreview, setLoadedPreview] = useState(false);
    const [loadedFullscreen, setLoadedFullscreen] = useState(false);

    return (
        <Flex justify="center" align="center" mt={4} mb={6} px={4}>
            <Dialog.Root onOpenChange={() => setLoadedFullscreen(false)}>
                <Dialog.Trigger asChild>
                    <Box
                        position="relative"
                        overflow="hidden"
                        rounded="2xl"
                        boxShadow="0 8px 30px rgba(0,0,0,0.28)"
                        bg="#2a2a2a"
                        maxW="640px"
                        w="100%"
                        minH="220px"
                        transition={!disableMotion ? "all 0.25s ease" : undefined}
                        _hover={
                            !disableMotion
                                ? {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 12px 36px rgba(0,0,0,0.38)",
                                }
                                : undefined
                        }
                        cursor="pointer"
                        border="1px solid"
                        borderColor="#3a3a3a"
                    >
                        {!loadedPreview && (
                            <Flex
                                position="absolute"
                                inset={0}
                                align="center"
                                justify="center"
                                bg="#2a2a2a"
                                zIndex={1}
                            >
                                <VStack gap={3}>
                                    <Spinner
                                        size="sm"
                                        color="#8a8a8a"
                                    />

                                    <Text
                                        fontSize="sm"
                                        color="#cfcfcf"
                                        fontWeight="500"
                                        letterSpacing="0.01em"
                                    >
                                        Загружаем меню
                                    </Text>
                                </VStack>
                            </Flex>
                        )}

                        <Image
                            src={image}
                            alt="Обеденное меню"
                            width={1920}
                            height={1080}
                            sizes="(max-width: 640px) 100vw, 640px"
                            style={{
                                objectFit: "contain",
                                opacity: loadedPreview ? 1 : 0,
                                transition: "opacity 0.2s ease",
                                display: "block",
                                backgroundColor: "#2a2a2a",
                            }}
                            priority
                            fetchPriority="high"
                            onLoad={() => setLoadedPreview(true)}
                        />
                    </Box>
                </Dialog.Trigger>

                <Dialog.Backdrop
                    bg="rgba(0,0,0,0.88)"
                    backdropFilter="blur(6px)"
                    zIndex={99998}
                />

                <Dialog.Positioner zIndex={99999}>
                    <Dialog.Content
                        w="100vw"
                        h="100vh"
                        bg="#1c1c1c"
                        p={0}
                        m={0}
                        maxW="none"
                        borderRadius={0}
                    >
                        <Box
                            position="relative"
                            w="100%"
                            h="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="#1c1c1c"
                        >
                            {!loadedFullscreen && (
                                <Flex
                                    position="absolute"
                                    inset={0}
                                    align="center"
                                    justify="center"
                                    bg="#1c1c1c"
                                    zIndex={1}
                                >
                                    <VStack gap={3}>
                                        <Spinner
                                            size="md"
                                            color="rgba(255,255,255,0.45)"
                                        />

                                        <Text
                                            color="rgba(255,255,255,0.72)"
                                            fontSize="sm"
                                            fontWeight="500"
                                            letterSpacing="0.02em"
                                        >
                                            Подготавливаем изображение
                                        </Text>
                                    </VStack>
                                </Flex>
                            )}

                            <Image
                                src={image}
                                fill
                                alt="Обеденное меню"
                                loading="eager"
                                style={{
                                    objectFit: "contain",
                                    opacity: loadedFullscreen ? 1 : 0,
                                    transition: "opacity 0.2s ease",
                                    backgroundColor: "#1c1c1c",
                                    color: "white"
                                }}
                                onLoad={() => setLoadedFullscreen(true)}
                            />
                        </Box>

                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                aria-label="Закрыть"
                                position="absolute"
                                top={4}
                                right={4}
                                variant="solid"
                                size="md"
                                bg="rgba(255,255,255,0.10)"
                                color="white"
                                borderRadius="full"
                                border="1px solid rgba(255,255,255,0.06)"
                                backdropFilter="blur(10px)"
                                _hover={{
                                    bg: "rgba(255,255,255,0.16)",
                                    transform: "scale(1.05)",
                                }}
                                zIndex={99999}
                            >
                                <FiX/>
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
};