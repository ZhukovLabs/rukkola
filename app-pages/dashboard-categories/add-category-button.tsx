'use client';

import {PlusIcon} from "lucide-react"
import {Button, Box} from "@chakra-ui/react"
import Link from "next/link";

export const AddCategoryButton = ({searchParams}: { searchParams?: Record<string, string> }) => {
    const params = new URLSearchParams(searchParams);
    params.set("addCategory", "true");

    return (
        <Box display="flex" justifyContent="flex-end" mb={4}>
            <Button
                as={Link}
                // @ts-expect-error — href от Link
                href={`?${params.toString()}`}
                px={3}
                py={2}
                size="sm"
                colorScheme="teal"
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
                scroll={false}
            >
                <PlusIcon size={16}/>
                Добавить категорию
            </Button>
        </Box>
    )
}
