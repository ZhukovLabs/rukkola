'use client';

import { useState, useEffect } from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { FiArrowUp } from "react-icons/fi";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!isVisible) return null;

    return (
        <MotionBox
            position="fixed"
            top="80px"
            right="16px"
            zIndex={999998}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 18 }}
        >
            <IconButton
                aria-label="Наверх"
                borderRadius="full"
                size="lg"
                onClick={handleClick}
                bg="gray.700"
                color="gray.300"
                boxShadow="0 4px 10px rgba(0,0,0,0.3)"
                _hover={{
                    transform: "translateY(-3px) scale(1.05)",
                    color: "white",
                    bg: "gray.600",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
                }}
                _active={{
                    transform: "scale(0.96)",
                }}
                transition="all 0.25s ease"
            >
                <FiArrowUp size={24} />
            </IconButton>
        </MotionBox>
    );
};