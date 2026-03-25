'use client'

import {useSession} from '@/lib/auth/auth-context'
import {useRouter} from 'next/navigation'
import {Box, IconButton, Icon} from '@chakra-ui/react'
import {FiSettings} from 'react-icons/fi'
import {motion} from 'framer-motion'

const MotionBox = motion.create(Box)

export function AdminFloatButton() {
    const {data: session, status} = useSession()
    const router = useRouter()

    if (status === 'loading') return null
    if (!session?.user) return null

    return (
        <MotionBox
            position="fixed"
            top="140px"
            right="20px"
            zIndex={9995}
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.3}}
        >
            <IconButton
                aria-label="Админ панель"
                size="md"
                borderRadius="xl"
                bg="gray.800"
                color="gray.400"
                border="1px solid"
                borderColor="gray.700"
                _hover={{
                    bg: 'gray.700',
                    color: 'teal.300',
                    borderColor: 'teal.600',
                }}
                _active={{
                    transform: 'scale(0.95)',
                }}
                transition="all 0.2s ease"
                onClick={() => router.push('/dashboard')}
            >
                <Icon as={FiSettings} boxSize={5}/>
            </IconButton>
        </MotionBox>
    )
}
