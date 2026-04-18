'use client';

import {useState} from 'react';
import {Box, Button, Dialog, Flex, Input, Text} from '@chakra-ui/react';

type CategoryPositionDialogProps = {
    currentPosition: number;
    totalItems: number;
    depth: number;
    onMove: (position: number) => void;
    isLoading?: boolean;
};

export function CategoryPositionDialog({
    currentPosition,
    totalItems,
    depth,
    onMove,
    isLoading,
}: CategoryPositionDialogProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    const handleOpen = () => {
        setValue(String(currentPosition + 1));
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setValue('');
    };

    const handleMove = () => {
        const newPosition = parseInt(value, 10) - 1;
        if (!isNaN(newPosition) && newPosition >= 0 && newPosition < totalItems) {
            onMove(newPosition);
            handleClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleMove();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const isValid = () => {
        const num = parseInt(value, 10);
        return !isNaN(num) && num >= 1 && num <= totalItems;
    };

    const depthLabel = depth === 0 ? 'корневой уровень' : `уровень вложенности ${depth}`;

    return (
        <>
            <Button
                size="xs"
                variant="ghost"
                borderRadius="xl"
                color="gray.400"
                minW="28px"
                h="28px"
                onClick={handleOpen}
                loading={isLoading}
                _hover={{bg: 'gray.700', color: 'gray.300'}}
            >
                {currentPosition + 1}
            </Button>

            <Dialog.Root open={open} onOpenChange={(e: {open: boolean}) => !e.open && handleClose()}>
                <Dialog.Positioner>
                    <Dialog.Content bg="gray.800" borderColor="gray.700">
                        <Dialog.Header>
                            <Dialog.Title color="white">Переместить категорию</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Flex direction="column" gap={4}>
                                <Text color="gray.300" fontSize="sm">
                                    Текущая позиция: <Text as="span" color="gray.400" fontWeight="semibold">{currentPosition + 1}</Text>
                                    <Text as="span" color="gray.500"> из {totalItems}</Text>
                                </Text>
                                
                                {depth > 0 && (
                                    <Text color="gray.400" fontSize="xs">
                                        ({depthLabel})
                                    </Text>
                                )}
                                
                                <Box>
                                    <Text color="gray.300" fontSize="sm" mb={2}>
                                        Новая позиция:
                                    </Text>
                                    <Input
                                        value={value}
                                        onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`${currentPosition + 1}`}
                                        size="lg"
                                        bg="gray.700"
                                        borderColor="gray.600"
                                        color="white"
                                        textAlign="center"
                                        fontWeight="semibold"
                                        fontSize="xl"
                                        autoFocus
                                    />
                                </Box>
                            </Flex>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" color="gray.300" onClick={handleClose}>
                                Отмена
                            </Button>
                            <Button
                                bg="gray.500"
                                color="white"
                                onClick={handleMove}
                                disabled={!isValid()}
                                _hover={{bg: 'gray.600'}}
                            >
                                Переместить
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}