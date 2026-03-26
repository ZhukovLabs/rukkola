'use client';
import {Box, Flex, IconButton, Dialog, Badge, Text} from "@chakra-ui/react";
import Image from "next/image";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";
import {FiX, FiClock} from "react-icons/fi";

type ActiveLunchProps = { image: string; }

export const ActiveLunch = ({image}: ActiveLunchProps) => {
    const disableMotion = useIsLowPerformanceDevice();

    return (
        <Flex justify="center" align="center" mt={4} mb={6} px={4}>
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Box
                        position="relative"
                        overflow="hidden"
                        rounded="2xl"
                        boxShadow="0 4px 20px rgba(0,0,0,0.1)"
                        bg="white"
                        maxW="640px"
                        w="100%"
                        h={{base: 180, sm: 240, md: 340}}
                        transition={!disableMotion ? "all 0.3s ease" : undefined}
                        _hover={!disableMotion ? {
                            transform: "translateY(-4px) scale(1.02)",
                            boxShadow: "0 12px 40px rgba(20,184,166,0.2)",
                        } : undefined}
                        cursor="pointer"
                        border="2px solid"
                        borderColor="teal.400"
                    >
                        <Image
                            src={image}
                            alt="Обеденное меню"
                            fill
                            sizes="(max-width: 640px) 100vw, 640px"
                            style={{objectFit: "cover"}}
                            priority
                            fetchPriority="high"
                        />
                        
                        <Box
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            p={{base: 3, sm: 4}}
                            bgGradient="linear(to-t, blackAlpha.700, transparent)"
                        >
                            <Badge
                                bg="teal.500"
                                color="white"
                                px={3}
                                py={1.5}
                                rounded="lg"
                                fontSize="xs"
                                fontWeight="bold"
                                textTransform="none"
                            >
                                <Flex align="center" gap={1.5}>
                                    <FiClock size={14} />
                                    <Text>Обед</Text>
                                </Flex>
                            </Badge>
                        </Box>
                    </Box>
                </Dialog.Trigger>

                <Dialog.Backdrop bg="blackAlpha.900" />

                <Dialog.Positioner>
                    <Dialog.Content
                        w="100vw"
                        h="100vh"
                        bg="black"
                        p={0}
                        m={0}
                        maxW="none"
                        borderRadius={0}
                    >
                        <Box position="relative" w="100%" h="100%" display="flex" alignItems="center" justifyContent="center">
                            <Image
                                src={image}
                                alt="Обеденное меню"
                                fill
                                style={{objectFit: "contain"}}
                                loading="eager"
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
                                bg="whiteAlpha.900"
                                color="black"
                                borderRadius="full"
                                _hover={{bg: "white", transform: "scale(1.1)"}}
                                zIndex={10}
                            >
                                <FiX />
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
};
