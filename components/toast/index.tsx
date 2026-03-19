'use client'

import { Box, Text, HStack, IconButton } from '@chakra-ui/react'
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface ToastProps {
    message: string
    type: 'success' | 'error'
    onClose: () => void
}

const MotionBox = motion(Box)

export function Toast({ message, type, onClose }: ToastProps) {
    const bgColor = type === 'success' ? 'teal.500' : 'red.500'
    const Icon = type === 'success' ? FiCheckCircle : FiAlertCircle

    return (
        <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            position="fixed"
            top={4}
            right={4}
            bg={bgColor}
            color="white"
            px={4}
            py={3}
            borderRadius="md"
            boxShadow="lg"
            zIndex={9999}
            minW="250px"
            maxW="400px"
        >
            <HStack gap={3}>
                <Icon />
                <Text flex={1} fontSize="sm" fontWeight="medium">
                    {message}
                </Text>
                <IconButton
                    aria-label="Закрыть"
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={onClose}
                >
                    <FiX />
                </IconButton>
            </HStack>
        </MotionBox>
    )
}