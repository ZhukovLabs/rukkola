'use client';

import { Center, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionText = motion(Text);

export default function LoadingText() {
    const letters = Array.from("Руккола");

    return (
        <Center w="100vw" h="100vh" bg="gray.900">
            <Box display="flex" gap={2}>
                {letters.map((letter, i) => (
                    <MotionText
                        key={i}
                        fontSize={{ base: "5xl", md: "6xl" }}
                        fontWeight="extrabold"
                        color="gray.200"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                            delay: i * 0.15,
                            ease: "easeInOut"
                        }}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {letter}
                    </MotionText>
                ))}
            </Box>
        </Center>
    );
}
