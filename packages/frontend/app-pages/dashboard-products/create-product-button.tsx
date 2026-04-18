'use client';

import Link from 'next/link'
import {PlusIcon} from 'lucide-react'
import {Box} from '@chakra-ui/react'

export const CreateProductButton = ({searchParams}: { searchParams?: Record<string, string> }) => {
    const params = new URLSearchParams(searchParams)
    params.set('create', 'true')

    return (
        <Box display="flex" justifyContent="flex-end" mb={4}>
            <Link
                href={`?${params.toString()}`}
                scroll={false}
                style={{ textDecoration: 'none' }}
            >
                <Box
                    as="button"
                    px={3}
                    py={2}
                    bg="gray.500"
                    borderRadius="md"
                    fontWeight="500"
                    transition="all 0.15s ease-out"
                    _hover={{
                        bg: 'gray.400',
                        boxShadow: '0 2px 8px rgba(128,128,128,0.25)',
                    }}
                    _active={{
                        bg: 'gray.600',
                    }}
                    color="white"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    cursor="pointer"
                >
                    <PlusIcon size={16}/>
                    Добавить продукт
                </Box>
            </Link>
        </Box>
    )
}
