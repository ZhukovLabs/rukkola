'use client';

import {PlusIcon} from "lucide-react"
import {Box} from "@chakra-ui/react"
import Link from "next/link";

export const AddCategoryButton = ({searchParams}: { searchParams?: Record<string, string> }) => {
    const params = new URLSearchParams(searchParams);
    params.set("addCategory", "true");

    return (
        <Link
            href={`?${params.toString()}`}
            scroll={false}
            style={{textDecoration: 'none'}}
        >
            <Box
                as="button"
                px={4}
                py={2}
                bg="gray.800"
                borderRadius="lg"
                fontWeight="600"
                fontSize="sm"
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: 'gray.700',
                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.15)',
                }}
                _active={{
                    transform: 'translateY(0)',
                }}
                color="gray.300"
                border="1px solid"
                borderColor="gray.700"
                display="flex"
                alignItems="center"
                gap={2}
                cursor="pointer"
            >
                <PlusIcon size={16}/>
                Добавить
            </Box>
        </Link>
    )
}