'use client';

import { Box, Flex, Text, IconButton, Icon } from "@chakra-ui/react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import {MotionBox, MotionText} from "@/lib/motion-box";

type CartItemProps = {
    name: string;
    image?: string;
    blurDataURL?: string;
    size: string;
    price: number;
    quantity?: number;
    handleRemove: () => void;
    onIncrease?: () => void;
    onDecrease?: () => void;
    indexDelay?: number;
};

export function CartItem({
    name,
    image,
    blurDataURL,
    size,
    price,
    quantity = 1,
    handleRemove,
    onIncrease,
    onDecrease,
    indexDelay = 0
}: CartItemProps) {
    const mainPrice = price ? (price * quantity).toFixed(2).replace(".", ",") : "—";

    return (
        <MotionBox
            p={{ base: 3, md: 4 }}
            bg="rgba(255, 255, 255, 0.04)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid rgba(255, 255, 255, 0.1)"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
                duration: 0.5, 
                delay: indexDelay * 0.04,
                ease: [0.16, 1, 0.3, 1] 
            }}
            whileTap={{ scale: 0.98, backgroundColor: "rgba(255, 255, 255, 0.07)" }}
            position="relative"
            overflow="hidden"
            boxShadow="0 4px 24px rgba(0,0,0,0.25)"
        >
            <Flex gap={{ base: 3.5, md: 5 }} align="start">
                {image && (
                    <Box 
                        position="relative" 
                        w={{ base: "85px", md: "100px" }} 
                        h={{ base: "85px", md: "100px" }} 
                        flexShrink={0}
                        borderRadius="xl"
                        overflow="hidden"
                        bg="whiteAlpha.50"
                        boxShadow="0 8px 20px rgba(0,0,0,0.5)"
                    >
                        <Image
                            src={image.includes('?') ? `${image}&w=200` : `${image}?w=200`}
                            alt={name}
                            fill
                            style={{ objectFit: "cover" }}
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                            unoptimized
                        />
                    </Box>
                )}

                <Flex direction="column" flex="1" minW="0" minH={{ base: "85px", md: "100px" }} justify="space-between">
                    <Box pr={8}>
                        <Text 
                            color="white" 
                            fontWeight="extrabold" 
                            fontSize={{ base: "sm", md: "md" }}
                            lineHeight="tight"
                            lineClamp={2}
                            mb={2}
                            letterSpacing="tight"
                        >
                            {name}
                        </Text>

                        <Box 
                            display="inline-block"
                            bg="whiteAlpha.100"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            border="1px solid rgba(255, 255, 255, 0.05)"
                        >
                            <Text 
                                color="whiteAlpha.600" 
                                fontSize="10px" 
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="0.05em"
                            >
                                {size}
                            </Text>
                        </Box>
                    </Box>

                    <Flex align="center" justify="space-between" mt={{ base: 2, md: 0 }}>
                        <Flex 
                            align="center" 
                            bg="whiteAlpha.200" 
                            borderRadius="full" 
                            p={0.5}
                            border="1px solid rgba(255, 255, 255, 0.1)"
                        >
                            <IconButton
                                size="sm"
                                h={{ base: "30px", md: "28px" }}
                                minW={{ base: "30px", md: "28px" }}
                                aria-label="Меньше"
                                onClick={onDecrease}
                                disabled={quantity <= 1}
                                variant="ghost"
                                color="white"
                                borderRadius="full"
                                _hover={{ bg: "whiteAlpha.200" }}
                                _disabled={{ opacity: 0.2, cursor: "not-allowed" }}
                            >
                                <Icon as={FiMinus} boxSize={3.5} />
                            </IconButton>

                            <AnimatePresence mode="wait">
                                <MotionText
                                    key={quantity}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.12 }}
                                    px={2}
                                    fontSize="xs"
                                    fontWeight="black"
                                    color="white"
                                    minW="22px"
                                    textAlign="center"
                                >
                                    {quantity}
                                </MotionText>
                            </AnimatePresence>

                            <IconButton
                                size="sm"
                                h={{ base: "30px", md: "28px" }}
                                minW={{ base: "30px", md: "28px" }}
                                aria-label="Больше"
                                onClick={onIncrease}
                                variant="ghost"
                                color="white"
                                borderRadius="full"
                                _hover={{ bg: "whiteAlpha.200" }}
                            >
                                <Icon as={FiPlus} boxSize={3.5} />
                            </IconButton>
                        </Flex>

                        <Flex align="baseline" gap={1}>
                            <Text 
                                color="white" 
                                fontWeight="black" 
                                fontSize={{ base: "md", md: "lg" }}
                                letterSpacing="tight"
                            >
                                {mainPrice}
                            </Text>
                            <Text color="whiteAlpha.500" fontSize="10px" fontWeight="bold">
                                руб.
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                <IconButton
                    position="absolute"
                    top={2}
                    right={2}
                    size="xs"
                    h="24px"
                    minW="24px"
                    variant="ghost"
                    aria-label="Удалить"
                    onClick={handleRemove}
                    color="whiteAlpha.300"
                    _hover={{ color: "red.400", bg: "red.500/10" }}
                    borderRadius="full"
                >
                    <Icon as={FiTrash2} boxSize={3.5} />
                </IconButton>
            </Flex>
        </MotionBox>
    );
}
