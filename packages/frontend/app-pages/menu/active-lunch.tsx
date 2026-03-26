'use client';
import {Box, Flex, IconButton, Dialog} from "@chakra-ui/react";
import Image from "next/image";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";
import {FiX} from "react-icons/fi";

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
                        bg="transparent"
                        maxW="640px"
                        w="100%"
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
                            width="1920"
                            height="1080"
                            sizes="(max-width: 640px) 100vw, 640px"
                            style={{objectFit: "contain"}}
                            priority
                            fetchPriority="high"
                        />
                    </Box>
                </Dialog.Trigger>

                <Dialog.Backdrop bg="blackAlpha.900" zIndex={99998} />

                <Dialog.Positioner zIndex={99999}>
                    <Dialog.Content
                        w="100vw"
                        h="100vh"
                        bg="black"
                        p={0}
                        m={0}
                        maxW="none"
                        borderRadius={0}
                        zIndex={99999}
                    >
                        <Box position="relative" w="100%" h="100%" display="flex" alignItems="center" justifyContent="center">
                            <Image
                                src={image}
                                fill
                                alt="Обеденное меню"
                                loading="eager"
                                objectFit="contain"
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
                                zIndex={99999}
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
