'use client';

import { Box, Button, Flex, Text, Icon } from "@chakra-ui/react";
import { FiInfo, FiTrash2 } from "react-icons/fi";

type CartFooterProps = {
    total: number;
    onClear: () => void;
};

export const CartFooter = ({ total, onClear }: CartFooterProps) => (
    <Box
        px={{ base: 5, md: 6 }}
        py={{ base: 5, md: 6 }}
        borderTop="1px solid rgba(255,255,255,0.08)"
        bg="rgba(255,255,255,0.02)"
        backdropFilter="blur(10px)"
    >
        <Flex direction="column" gap={4}>
            <Flex justify="space-between" align="center">
                <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">
                    Итого к оплате
                </Text>
                <Text color="white" fontWeight="bold" fontSize="2xl" letterSpacing="tight">
                    {total.toFixed(2).replace(".", ",")} руб.
                </Text>
            </Flex>

            <Flex gap={3} align="stretch" direction={{ base: "column", sm: "row" }}>
                <Flex
                    flex="1"
                    bg="rgba(212, 163, 115, 0.08)"
                    border="1px solid rgba(212, 163, 115, 0.15)"
                    borderRadius="2xl"
                    p={{ base: 4, md: 4 }}
                    align="center"
                    justify={{ base: "center", sm: "flex-start" }}
                    direction={{ base: "column", sm: "row" }}
                    gap={{ base: 2, md: 3 }}
                    textAlign={{ base: "center", sm: "left" }}
                >
                    <Icon as={FiInfo} color="orange.200" boxSize={{ base: 6, sm: 5 }} flexShrink={0} />
                    <Text fontSize={{ base: "xs", md: "xs" }} color="whiteAlpha.900" lineHeight="1.5">
                        Почти готово! <Text as="span" display={{ base: "none", sm: "inline" }}>✨</Text> Выберите понравившееся и скажите <Text as="span" color="orange.200" fontWeight="bold">официанту</Text>. Мы приготовим ваш заказ.
                    </Text>
                </Flex>
                <Button
                    size="lg"
                    variant="ghost"
                    color="red.400"
                    borderRadius="2xl"
                    p={3}
                    minW={{ base: "100%", sm: "auto" }}
                    h={{ base: "44px", sm: "auto" }}
                    _hover={{ bg: "rgba(255,0,0,0.1)" }}
                    onClick={onClear}
                    title="Очистить корзину"
                >
                    <Flex align="center" gap={2} display={{ base: "flex", sm: "none" }}>
                        <Icon as={FiTrash2} boxSize={4} />
                        <Text fontSize="xs" fontWeight="bold">Очистить корзину</Text>
                    </Flex>
                    <Icon as={FiTrash2} boxSize={5} display={{ base: "none", sm: "block" }} />
                </Button>
            </Flex>
        </Flex>
    </Box>
);
