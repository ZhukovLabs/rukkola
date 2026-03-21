'use client';

import {PlusIcon} from "lucide-react"
import {Box} from "@chakra-ui/react"
import Link from "next/link";

export const AddCategoryButton = ({searchParams}: { searchParams?: Record<string, string> }) => {
    const params = new URLSearchParams(searchParams);
    params.set("addCategory", "true");

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
                    bg="teal.500"
                    borderRadius="md"
                    fontWeight="500"
                    transition="all 0.15s ease-out"
                    _hover={{
                        bg: 'teal.400',
                        boxShadow: '0 2px 8px rgba(56,178,172,0.25)',
                    }}
                    _active={{
                        bg: 'teal.600',
                    }}
                    color="white"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    cursor="pointer"
                >
                    <PlusIcon size={16}/>
                    Добавить категорию
                </Box>
            </Link>
        </Box>
    )
}
