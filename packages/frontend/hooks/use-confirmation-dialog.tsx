import {useCallback, useRef, useState, ReactNode} from 'react';
import {
    Dialog,
    Button,
    Text,
    Flex,
    Box,
} from '@chakra-ui/react';
import {FiAlertTriangle, FiTrash2} from 'react-icons/fi';

type ConfirmCallback<T> = (payload: T) => void;

type UseConfirmationDialogOptions<T> = {
    onConfirm: ConfirmCallback<T>;
    title?: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    colorScheme?: string;
}

export const useConfirmationDialog = <T, >({
                                                onConfirm,
                                                title = 'Подтвердите действие',
                                                description = 'Это действие необратимо.',
                                                confirmText = 'Подтвердить',
                                                cancelText = 'Отмена',
                                                colorScheme = 'red',
                                            }: UseConfirmationDialogOptions<T>) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const payloadRef = useRef<T | null>(null);

    const openDialog = useCallback((payload: T) => {
        payloadRef.current = payload;
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setIsLoading(false);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!payloadRef.current) return;
        setIsLoading(true);
        setTimeout(() => {
            onConfirm(payloadRef.current!);
            setIsLoading(false);
            setOpen(false);
        }, 600);
    }, [onConfirm]);

    const confirmationDialog = (
        <Dialog.Root
            open={open}
            onOpenChange={(e) => { if (!e.open) handleClose(); }}
        >
            <Dialog.Backdrop
                bg="blackAlpha.800"
                backdropFilter="blur(8px)"
            />

            <Dialog.Positioner>
                <Dialog.Content
                    bg="rgba(24,26,28,0.95)"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.700"
                    maxW="sm"
                    p={0}
                    overflow="hidden"
                >
                    <Flex
                        direction="column"
                        align="center"
                        pt={7}
                        pb={3}
                        px={6}
                    >
                        <Box
                            p={3}
                            borderRadius="full"
                            bg={`${colorScheme}.900/30`}
                            border="1px solid"
                            borderColor={`${colorScheme}.700/40`}
                            mb={4}
                        >
                            <FiAlertTriangle size={22} color={colorScheme === 'red' ? '#f56565' : '#ed8936'}/>
                        </Box>

                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="gray.100"
                            mb={2}
                            textAlign="center"
                        >
                            {title}
                        </Text>

                        <Text
                            fontSize="sm"
                            color="gray.400"
                            textAlign="center"
                            lineHeight="short"
                        >
                            {description}
                        </Text>
                    </Flex>

                    <Flex
                        gap={3}
                        px={6}
                        pb={6}
                        pt={2}
                    >
                        <Button
                            variant="outline"
                            size="md"
                            flex={1}
                            onClick={handleClose}
                            borderColor="gray.600"
                            color="gray.300"
                            borderRadius="lg"
                            _hover={{bg: 'gray.800', borderColor: 'gray.500'}}
                        >
                            {cancelText}
                        </Button>

                        <Button
                            size="md"
                            flex={1}
                            onClick={handleConfirm}
                            loading={isLoading}
                            loadingText="Удаление..."
                            bg={colorScheme === 'red' ? 'red.500' : 'orange.500'}
                            color="white"
                            borderRadius="lg"
                            _hover={{
                                bg: colorScheme === 'red' ? 'red.600' : 'orange.600',
                            }}
                            _active={{
                                bg: colorScheme === 'red' ? 'red.700' : 'orange.700',
                            }}
                        >
                            <FiTrash2 size={14}/>
                            {confirmText}
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );

    return {openDialog, confirmationDialog};
};