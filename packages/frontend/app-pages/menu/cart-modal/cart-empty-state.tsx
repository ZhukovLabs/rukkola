'use client';

import { Flex, Text, Icon } from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";
import { MotionBox } from "@/lib/motion-box";

export const CartEmptyState = () => (
    <Flex direction="column" align="center" justify="center" py={12} px={6} gap={4}>
        <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            bg="rgba(255, 255, 255, 0.05)"
            p={6}
            borderRadius="full"
            border="1px solid rgba(255, 255, 255, 0.1)"
        >
            <Icon as={FiShoppingCart} boxSize={12} color="whiteAlpha.400"/>
        </MotionBox>
        <Flex direction="column" align="center" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="white">Корзина пуста</Text>
            <Text fontSize="sm" color="whiteAlpha.500" textAlign="center">
                Добавьте что-нибудь вкусное, чтобы начать заказ
            </Text>
        </Flex>
    </Flex>
);
