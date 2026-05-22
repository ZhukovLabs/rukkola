'use client';

import {FiPlus} from "react-icons/fi"
import {Box, Flex} from "@chakra-ui/react"
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
            <Flex
                as="button"
                px={6}
                h="42px"
                bg="purple.600"
                borderRadius="xl"
                fontWeight="700"
                fontSize="sm"
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: 'purple.500',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                    transform: 'translateY(-1px)',
                }}
                _active={{
                    transform: 'translateY(0)',
                    bg: 'purple.700',
                }}
                color="white"
                align="center"
                gap={2}
                cursor="pointer"
                border="none"
            >
                <FiPlus size={18}/>
                Добавить категорию
            </Flex>
        </Link>
    )
}