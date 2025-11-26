'use client';

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Badge, IconButton } from "@chakra-ui/react";
import { FiShoppingCart, FiX } from "react-icons/fi";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CART_QUERY_KEY } from "./config";
import {getCart} from "@/lib/local-storage";

const MotionBox = motion(Box);

export const CartButton = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isOpen = searchParams.has(CART_QUERY_KEY);

    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(getCart().length);

        const handler = (e: Event) => {
            const detail = (e as CustomEvent<number>).detail;
            setCount(detail);
        };

        window.addEventListener("cart-updated", handler as EventListener);
        return () => window.removeEventListener("cart-updated", handler as EventListener);
    }, []);

    const toggleCart = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        isOpen ? params.delete(CART_QUERY_KEY) : params.set(CART_QUERY_KEY, "open");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [isOpen, pathname, router, searchParams]);

    if (count <= 0) return null;

    const Icon = isOpen ? FiX : FiShoppingCart;

    return (
        <AnimatePresence>
            <MotionBox
                position="fixed"
                bottom="28px"
                right="28px"
                zIndex="999999"
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
                        bg="teal.400"
                        filter="blur(20px)"
                        opacity={0.25}
                        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.25] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                    />

                    <IconButton
                        aria-label={isOpen ? "Закрыть корзину" : "Открыть корзину"}
                        borderRadius="full"
                        size="xl"
                        onClick={toggleCart}
                        bg="linear-gradient(145deg, #1c1f1e, #232826)"
                        color="teal.200"
                        boxShadow="0 6px 12px rgba(0,0,0,0.45), inset 0 -2px 4px rgba(255,255,255,0.05), inset 0 2px 6px rgba(255,255,255,0.05)"
                        _hover={{
                            transform: "translateY(-3px) scale(1.05)",
                            color: "teal.100",
                            boxShadow:
                                "0 10px 18px rgba(0,0,0,0.6), inset 0 -3px 6px rgba(255,255,255,0.08), inset 0 3px 8px rgba(255,255,255,0.08), 0 0 12px rgba(56,178,172,0.4)",
                        }}
                        _active={{ transform: "scale(0.96)", boxShadow: "0 5px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.4)" }}
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
                        bgGradient="linear(to-br, teal.400, green.300)"
                        color="black"
                        fontSize="xs"
                        px="3"
                        py="2px"
                        boxShadow="0 0 10px rgba(56,178,172,0.6)"
                    >
                        {count}
                    </Badge>
                </Box>
            </MotionBox>
        </AnimatePresence>
    );
};
