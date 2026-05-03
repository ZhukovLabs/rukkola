'use client'

import {
    Box,
    Heading,
    Text,
    VStack,
    Button,
} from '@chakra-ui/react'
import {
    Utensils,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

interface CtaBlockProps {
    heading: string
    subtitle: React.ReactNode
    watermark: string
}

export default function CtaBlock({ heading, subtitle, watermark }: CtaBlockProps) {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <Box
                position="relative"
                p={{ base: 10, md: 20 }}
                borderRadius="50px"
                bg="white"
                color="black"
                textAlign="center"
                overflow="hidden"
            >
                <VStack gap={8} position="relative" zIndex={1}>
                    <VStack gap={2}>
                        <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="900" letterSpacing="-0.03em">
                            {heading}
                        </Heading>
                        <Text fontSize="lg" fontWeight="500" opacity={0.6}>
                            {subtitle}
                        </Text>
                    </VStack>

                    <Button
                        as={Link}
                        //@ts-expect-error - is ok
                        href="/"
                        h="80px"
                        px={14}
                        bg="black"
                        color="white"
                        borderRadius="full"
                        fontSize="xl"
                        fontWeight="900"
                        leftIcon={<Utensils size={24} />}
                        rightIcon={<ChevronRight size={24} />}
                        _hover={{
                            transform: "scale(1.05)",
                            bg: "teal.900"
                        }}
                        _active={{ transform: "scale(0.98)" }}
                        transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    >
                        ОТКРЫТЬ МЕНЮ
                    </Button>
                </VStack>

                <Box
                    position="absolute"
                    bottom="-20%"
                    right="-10%"
                    fontSize="200px"
                    fontWeight="900"
                    opacity={0.03}
                    pointerEvents="none"
                    userSelect="none"
                >
                    {watermark}
                </Box>
            </Box>
        </MotionBox>
    )
}
