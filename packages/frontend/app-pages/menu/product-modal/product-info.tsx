'use client';

import { Box, Heading, Text, VStack, Flex } from "@chakra-ui/react";
import { PriceSelector } from "../products/price-selector";

type Tag = { text: string; color: string };

type ProductInfoProps = {
    name: string;
    description: string | null;
    tags: Tag[] | null;
};

export const ProductInfo = ({ name, description, tags }: ProductInfoProps) => (
    <VStack align="stretch" gap={{ base: 4, md: 10 }}>
        <Box>
            {tags && tags.length > 0 && (
                <Flex gap={4} mb={{ base: 3, md: 6 }} flexWrap="wrap">
                    {tags.map((tag, idx) => (
                        <Box key={idx} position="relative">
                            <Text
                                fontSize="11px"
                                fontWeight="bold"
                                color={tag.color}
                                textTransform="uppercase"
                                letterSpacing="0.2em"
                            >
                                {tag.text}
                            </Text>
                            <Box h="1px" w="100%" bg={tag.color} opacity={0.3} mt={1} />
                        </Box>
                    ))}
                </Flex>
            )}
            <Heading
                fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                fontWeight="900"
                color="white"
                mb={{ base: 3, md: 6 }}
                letterSpacing="-0.05em"
                lineHeight="0.95"
                textTransform="uppercase"
            >
                {name}
            </Heading>
            <Box h="4px" w="60px" bg="white" borderRadius="full" />
        </Box>

        {description && (
            <Text
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                color="whiteAlpha.700"
                lineHeight="1.8"
                whiteSpace="pre-wrap"
                fontWeight="300"
                letterSpacing="0.01em"
                maxW="500px"
            >
                {description}
            </Text>
        )}
    </VStack>
);
