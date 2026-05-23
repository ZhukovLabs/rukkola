'use client'

import {useSession} from '@/lib/auth/auth-context'
import {useRouter} from 'next/navigation'
import {Box, IconButton, Icon} from '@chakra-ui/react'
import {FiSettings} from 'react-icons/fi'

export function AdminFloatButton() {
    const {data: session, status} = useSession()
    const router = useRouter()

    if (status === 'loading') return null
    if (!session?.user) return null

    return (
        <Box
            position="fixed"
            top="140px"
            right="20px"
            zIndex={9995}
            css={{animation: "slideIn 0.3s ease-out"}}
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
                    color: 'gray.300',
                    borderColor: 'gray.600',
                }}
                _active={{
                    transform: 'scale(0.95)',
                }}
                transition="all 0.2s ease"
                onClick={() => router.push('/dashboard')}
            >
                <Icon as={FiSettings} boxSize={5}/>
            </IconButton>
        </Box>
    )
}
