'use client';

import { Box, Heading, Text } from "@chakra-ui/react";

type ProductInfoProps = {
    name: string;
    description: string | null;
};

export const ProductInfo = ({ name, description }: ProductInfoProps) => (
    <Box
        bg="rgba(15, 15, 18, 0.7)"
        backdropFilter="blur(30px)"
        borderTop="1px solid rgba(255,255,255,0.08)"
        p={{ base: 6, md: 10 }}
        maxH="45vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
        css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { bg: "transparent" },
            "&::-webkit-scrollbar-thumb": { bg: "rgba(255,255,255,0.15)", borderRadius: "10px" },
        }}
    >
        <Box maxW="1000px" mx="auto">
            <Heading
                fontSize={{ base: "2xl", md: "4xl" }}
                fontWeight="800"
                color="white"
                mb={description ? 6 : 0}
                letterSpacing="-0.03em"
                lineHeight="1.1"
            >
                {name}
            </Heading>
            {description && (
                <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.700" lineHeight="1.8" whiteSpace="pre-wrap" fontWeight="450">
                    {description}
                </Text>
            )}
        </Box>
    </Box>
);
