'use client';
import {Box, Flex, IconButton, Dialog} from "@chakra-ui/react";
import Image from "next/image";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";
import {FiX} from "react-icons/fi";

type ActiveLunchProps = { image: string; }

export const ActiveLunch = ({image}: ActiveLunchProps) => {
    const disableMotion = useIsLowPerformanceDevice();

    return (
        <Flex justify="center" align="center" mt={4} mb={6}>
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Box
                        position="relative"
                        overflow="hidden"
                        rounded="xl"
                        boxShadow="0 0 15px rgba(56,178,172,0.4)"
                        border="1px solid"
                        borderColor="teal.700"
                        maxW="640px"
                        w="100%"
                        h={{base: 200, sm: 300, md: 442}}
                        transition={!disableMotion ? "all 0.3s ease" : undefined}
                        _hover={!disableMotion ? {
                            transform: "scale(1.015)",
                            boxShadow: "0 0 25px rgba(56,178,172,0.5)"
                        } : undefined}
                        cursor="zoom-in"
                    >
                        <Image
                            src={image}
                            alt="Обеденное меню"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            style={{objectFit: "contain", borderRadius: "12px"}}
                            loading="lazy"
                        />
                    </Box>
                </Dialog.Trigger>

                <Dialog.Backdrop/>

                <Dialog.Positioner>
                    <Dialog.Content
                        w="90vw"
                        maxW="1200px"
                        h={{base: "60vh", md: "80vh"}}
                        bg="transparent"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Box position="relative" w="100%" h="100%">
                            <Image
                                src={image}
                                alt="Обеденное меню"
                                fill
                                style={{objectFit: "contain", borderRadius: "12px"}}
                                loading="eager"
                            />
                        </Box>

                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                aria-label="Закрыть"
                                position="absolute"
                                top={2}
                                right={2}
                                variant="ghost"
                                size="lg"
                                color="white"><FiX/></IconButton>
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
};
