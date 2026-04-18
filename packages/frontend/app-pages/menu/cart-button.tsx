'use client';

import React, { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Badge, IconButton } from "@chakra-ui/react";
import { FiShoppingCart, FiX } from "react-icons/fi";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CART_QUERY_KEY } from "./constants";
import { useCartCount } from "@/hooks/use-cart";

const MotionBox = motion.create(Box);

export const CartButton = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isOpen = searchParams?.has(CART_QUERY_KEY) ?? false;

    const count = useCartCount();
    const paramsString = searchParams?.toString() ?? '';

    const toggleCart = useCallback(() => {
        const params = new URLSearchParams(paramsString);
        if (isOpen) params.delete(CART_QUERY_KEY);
        else params.set(CART_QUERY_KEY, "open");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [isOpen, pathname, router, paramsString]);

    const Icon = useMemo(() => (isOpen ? FiX : FiShoppingCart), [isOpen]);

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
                    <MotionBox
                        position="absolute"
                        inset="-12px"
                        borderRadius="full"
                        bg="gray.400"
                        filter="blur(20px)"
                        opacity={0.25}
                        pointerEvents="none"
                        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.25] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                    />

                    <IconButton
                        aria-label={isOpen ? "Закрыть корзину" : "Открыть корзину"}
                        borderRadius="full"
                        size="xl"
                        onClick={toggleCart}
                        bg="linear-gradient(145deg, #1c1f1e, #232826)"
                        color="gray.200"
                        boxShadow="0 6px 12px rgba(0,0,0,0.45), inset 0 -2px 4px rgba(255,255,255,0.05), inset 0 2px 6px rgba(255,255,255,0.05)"
                        _hover={{
                            transform: "translateY(-3px) scale(1.05)",
                            color: "gray.100",
                            boxShadow:
                                "0 10px 18px rgba(0,0,0,0.6), inset 0 -3px 6px rgba(255,255,255,0.08), inset 0 3px 8px rgba(255,255,255,0.08), 0 0 12px rgba(128,128,128,0.4)",
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
                        onClick={toggleCart}
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
