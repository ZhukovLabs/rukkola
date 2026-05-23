'use client';

import {Box, Flex, Text} from "@chakra-ui/react";

const solidGradient = (color: string) =>
    `linear-gradient(135deg, ${color} 0%, ${color}dd 55%, ${color}aa 100%)`;

type ProductTagsProps = {
    tags: { text: string; color: string }[];
};

export function ProductTags({ tags }: ProductTagsProps) {
    return (
        <Box position="absolute" top={0} left={0} w="full" h="full" pointerEvents="none">
            {tags.map((tag, idx) => (
                <Box
                    key={idx}
                    position="absolute"
                    top={`${12 + idx * 36}px`}
                    right={{base: "-6px", md: "auto"}}
                    left={{base: "auto", md: "-8px"}}
                    zIndex={10}
                >
                    <Flex
                        align="center"
                        px={4.5}
                        py={1.5}
                        bg={solidGradient(tag.color)}
                        borderRadius="md"
                        boxShadow="0 8px 20px rgba(0,0,0,0.4)"
                        position="relative"
                        overflow="hidden"
                        transform={{base: "skew(12deg)", md: "skew(-12deg)"}}
                        border="1px solid rgba(255,255,255,0.3)"
                    >
                        <Box
                            position="absolute"
                            top="0"
                            left={{base: "auto", md: "-14px"}}
                            right={{base: "-14px", md: "auto"}}
                            w="18px"
                            h="full"
                            bg={tag.color}
                            transform={{base: "skew(-25deg)", md: "skew(25deg)"}}
                            zIndex={-1}
                        />

                        <Text
                            fontSize="10px"
                            fontWeight="700"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            color="white"
                            textShadow="0 1px 3px rgba(0,0,0,0.6)"
                            zIndex={2}
                            transform={{base: "skew(-12deg)", md: "skew(12deg)"}}
                        >
                            {tag.text}
                        </Text>
                    </Flex>
                </Box>
            ))}
        </Box>
    );
}
