'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Badge, IconButton } from "@chakra-ui/react";
import { FiShoppingCart, FiX } from "react-icons/fi";
import { useCartCount } from "@/hooks/use-cart";
import { useCartModal } from "./cart-modal/use-cart-modal";
import {MotionBox} from "@/lib/motion-box";

export const CartButton = () => {
    const { isOpen, toggle } = useCartModal();
    const count = useCartCount();

    const Icon = isOpen ? FiX : FiShoppingCart;

    if (count <= 0) return null;

    return (
        <AnimatePresence>
            <MotionBox
                position="fixed"
                bottom="28px"
                right="28px"
                zIndex={9997}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 200, damping: 18 }}
            >
                <Box position="relative">
                    <IconButton
                        aria-label={isOpen ? "Закрыть корзину" : "Открыть корзину"}
                        borderRadius="full"
                        size="xl"
                        onClick={toggle}
                        bg="linear-gradient(145deg, #1c1f1e, #232826)"
                        color="gray.200"
                        boxShadow="0 6px 12px rgba(0,0,0,0.45), inset 0 -2px 4px rgba(255,255,255,0.05), inset 0 2px 6px rgba(255,255,255,0.05)"
                        _hover={{
                            transform: "translateY(-3px) scale(1.05)",
                            color: "gray.100",
                            boxShadow:
                                "0 10px 18px rgba(0,0,0,0.6), inset 0 -3px 6px rgba(255,255,255,0.08), inset 0 3px 8px rgba(255,255,255,0.08)",
                        }}
                        _active={{
                            transform: "scale(0.96)",
                            boxShadow: "0 5px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.4)",
                        }}
                        transition="all 0.25s ease"
                    >
                        <Icon size={64} />
                    </IconButton>

                    <Badge
                        as={motion.div}
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        onClick={toggle}
                        cursor="pointer"
                        borderRadius="full"
                        bgGradient="linear(to-br, gray.400, green.300)"
                        color="black"
                        fontSize="xs"
                        px="3"
                        py="2px"
                        boxShadow="0 0 10px rgba(128,128,128,0.6)"
                    >
                        {count}
                    </Badge>
                </Box>
            </MotionBox>
        </AnimatePresence>
    );
};
