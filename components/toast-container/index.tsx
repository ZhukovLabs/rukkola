'use client'

import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react'
import {Box, Text, HStack, Icon, IconButton} from '@chakra-ui/react'
import {FiX, FiCheckCircle, FiAlertCircle, FiInfo} from 'react-icons/fi'
import {motion, AnimatePresence} from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const MotionBox = motion.create(Box)

const toastConfig = {
    success: {
        bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
        icon: FiCheckCircle,
    },
    error: {
        bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        icon: FiAlertCircle,
    },
    info: {
        bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        icon: FiInfo,
    },
}

function ToastItem({toast, onClose}: { toast: Toast; onClose: () => void }) {
    const config = toastConfig[toast.type]

    return (
        <MotionBox
            initial={{opacity: 0, y: -20, scale: 0.95}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -20, scale: 0.95}}
            transition={{duration: 0.2}}
            position="relative"
            bg={config.bg}
            color="white"
            px={5}
            py={4}
            borderRadius="xl"
            boxShadow="0 10px 40px rgba(0,0,0,0.4)"
            zIndex={99999}
            minW="300px"
            maxW="450px"
            overflow="hidden"
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bg="whiteAlpha.300"
            />

            <HStack gap={3}>
                <Icon as={config.icon} boxSize={6} flexShrink={0}/>
                <Text flex={1} fontSize="sm" fontWeight="medium" lineHeight="short">
                    {toast.message}
                </Text>
                <IconButton
                    aria-label="Закрыть"
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{bg: 'whiteAlpha.200'}}
                    onClick={onClose}
                >
                    <Icon as={FiX} boxSize={4}/>
                </IconButton>
            </HStack>
        </MotionBox>
    )
}

export function ToastProvider({children}: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, {id, message, type}])

        setTimeout(() => {
            removeToast(id)
        }, 5000)
    }, [removeToast])

    const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
    const showError = useCallback((message: string) => showToast(message, 'error'), [showToast])
    const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast])

    return (
        <ToastContext.Provider value={{showToast, showSuccess, showError, showInfo}}>
            {children}

            <Box
                position="fixed"
                top={4}
                right={4}
                zIndex={99999}
                display="flex"
                flexDirection="column"
                gap={3}
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </Box>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
