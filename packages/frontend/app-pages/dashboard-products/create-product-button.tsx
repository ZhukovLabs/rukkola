'use client';

import Link from 'next/link'
import {PlusIcon} from 'lucide-react'
import {Box} from '@chakra-ui/react'

export const CreateProductButton = ({searchParams}: { searchParams?: Record<string, string> }) => {
    const params = new URLSearchParams(searchParams)
    params.set('create', 'true')

    return (
        <Link
            href={`?${params.toString()}`}
            scroll={false}
            style={{textDecoration: 'none'}}
        >
            <Box
                as="button"
                px={5}
                py={3}
                bg="orange.600/10"
                borderRadius="2xl"
                fontWeight="extrabold"
                fontSize="sm"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: 'orange.600/20',
                    borderColor: 'orange.500/50',
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 20px rgba(237, 137, 54, 0.15)',
                    color: 'orange.200',
                }}
                _active={{
                    transform: 'translateY(0)',
                }}
                color="orange.300"
                border="1px solid"
                borderColor="orange.800/40"
                display="flex"
                alignItems="center"
                gap={3}
                cursor="pointer"
                backdropFilter="blur(8px)"
            >
                <PlusIcon size={18} strokeWidth={3}/>
                Добавить товар
            </Box>
        </Link>
    )
}