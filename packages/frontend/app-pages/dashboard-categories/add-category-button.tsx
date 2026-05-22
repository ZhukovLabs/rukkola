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
                bg="green.600/10"
                borderRadius="xl"
                fontWeight="extrabold"
                fontSize="sm"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                    bg: 'green.600/20',
                    borderColor: 'green.500/50',
                    transform: 'translateY(-1px)',
                    shadow: '0 10px 20px rgba(72, 187, 120, 0.15)',
                    color: 'green.200',
                }}
                _active={{
                    transform: 'translateY(0)',
                }}
                color="green.300"
                align="center"
                gap={2.5}
                cursor="pointer"
                border="1px solid"
                borderColor="green.800/40"
                backdropFilter="blur(8px)"
            >
                <FiPlus size={18}/>
                Добавить категорию
            </Flex>
        </Link>
    )
}