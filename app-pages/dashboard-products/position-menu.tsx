'use client';

import {useState} from 'react';
import {Box, Button, Menu, Portal, Text} from '@chakra-ui/react';
import {FiChevronDown, FiMove} from 'react-icons/fi';

type PositionMenuProps = {
    currentPosition: number;
    totalItems: number;
    currentPage: number;
    onMove: (position: number) => void;
    isLoading?: boolean;
};

const PAGE_SIZE = 10;

export function PositionMenu({
    currentPosition,
    totalItems,
    currentPage,
    onMove,
    isLoading,
}: PositionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const absolutePosition = startIndex + currentPosition;

    const handleSelectPosition = (pos: number) => {
        onMove(pos);
        setIsOpen(false);
    };

    const renderPositionOptions = () => {
        const options: React.ReactNode[] = [];
        const maxVisible = 50;

        for (let i = 0; i < Math.min(totalItems, maxVisible); i++) {
            const page = Math.floor(i / PAGE_SIZE) + 1;
            const posOnPage = (i % PAGE_SIZE) + 1;
            const isCurrentPage = page === currentPage;
            const isCurrentPos = i === absolutePosition;

            options.push(
                <Box
                    key={i}
                    px={3}
                    py={2}
                    cursor={isCurrentPos ? 'not-allowed' : 'pointer'}
                    bg={isCurrentPos ? 'gray.600' : 'transparent'}
                    color={isCurrentPos ? 'gray.400' : 'white'}
                    _hover={isCurrentPos ? {} : {bg: 'gray.700'}}
                    onClick={() => !isCurrentPos && handleSelectPosition(i)}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Text fontSize="sm">
                        {posOnPage}
                        {isCurrentPos && <Text as="span" color="teal.400" ml={2}>(текущая)</Text>}
                    </Text>
                    {!isCurrentPage && (
                        <Text fontSize="xs" color="gray.500">стр. {page}</Text>
                    )}
                </Box>
            );
        }

        return options;
    };

    return (
        <Menu.Root
            open={isOpen}
            onOpenChange={(e) => setIsOpen(e.open)}
            positioning={{placement: 'bottom-end'}}
        >
            <Menu.Trigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    borderRadius="xl"
                    color="gray.300"
                    _hover={{bg: 'gray.700', color: 'white'}}
                    loading={isLoading}
                >
                    <FiMove/>
                    <Text display={{base: 'none', md: 'inline'}} ml={1}>
                        {currentPosition}
                    </Text>
                    <FiChevronDown/>
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content
                        bg="gray.800"
                        borderColor="gray.700"
                        borderRadius="lg"
                        maxH="300px"
                        overflowY="auto"
                        minW="150px"
                    >
                        <Box px={3} py={2} borderBottom="1px solid" borderColor="gray.700">
                            <Text fontSize="xs" color="gray.400" fontWeight="medium">
                                Переместить в позицию
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                Всего: {totalItems} товаров
                            </Text>
                        </Box>
                        {renderPositionOptions()}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
}