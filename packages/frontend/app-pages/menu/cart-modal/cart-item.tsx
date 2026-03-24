'use client';

import {memo} from "react";
import { Box, Flex, Image, Text, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ImCross } from "react-icons/im";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

const MotionBox = motion.create(Box);

type CartItemProps = {
    name: string;
    image?: string;
    size: string;
    price: number;
    quantity?: number;
    handleRemove: () => void;
    onIncrease?: () => void;
    onDecrease?: () => void;
    indexDelay?: number;
};

export const CartItem = memo(function CartItem({
    name,
    image,
    size,
    price,
    quantity = 1,
    handleRemove,
    onIncrease,
    onDecrease,
    indexDelay = 0
}: CartItemProps) {
    const formattedPrice = price ? `${(price * quantity).toFixed(2).replace(".", ",")} руб` : "—";

    return (
        <MotionBox
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bg="gray.800"
            borderRadius="md"
            border="1px solid rgba(255,255,255,0.08)"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: indexDelay * 0.04 }}
            whileHover={{ backgroundColor: "gray.700" }}
        >
            <Flex align="center" gap={3}>
                {image && (
                    <Image
                        src={image}
                        alt={name}
                        boxSize="50px"
                        borderRadius="md"
                        objectFit="cover"
                        border="1px solid rgba(255,255,255,0.1)"
                    />
                )}

                <Box flex="1">
                    <Text color="whiteAlpha.900" fontWeight="medium" fontSize="sm">
                        {name}
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                        Размер: {size}
                    </Text>

                    <Flex mt={1} align="center" gap={2}>
                        <IconButton
                            size="sm"
                            aria-label="Уменьшить количество"
                            onClick={onDecrease}
                            disabled={quantity <= 1}
                            variant="outline"
                            borderColor="teal.400"
                            color="teal.400"
                            _hover={{ bg: "teal.50" }}>
                            <AiOutlineMinus />
                        </IconButton>
                        <Text
                            px={2}
                            fontSize="sm"
                            fontWeight="bold"
                            color="whiteAlpha.900"
                            textAlign="center"
                            minW="24px"
                        >
                            {quantity} шт.
                        </Text>
                        <IconButton
                            size="sm"
                            aria-label="Увеличить количество"
                            onClick={onIncrease}
                            variant="outline"
                            borderColor="teal.400"
                            color="teal.400"
                            _hover={{ bg: "teal.50" }}>
                            <AiOutlinePlus />
                        </IconButton>
                    </Flex>
                </Box>
            </Flex>

            <Flex align="center" gap={2}>
                <Text color="teal.300" fontWeight="semibold" fontSize="sm">
                    {formattedPrice}
                </Text>
                <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Удалить товар"
                    onClick={handleRemove}
                    color="red.500"
                >
                    <ImCross/>
                </IconButton>
            </Flex>
        </MotionBox>
    );
});
