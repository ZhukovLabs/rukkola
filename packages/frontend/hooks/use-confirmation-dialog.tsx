import {useCallback, useRef, useState, ReactNode} from 'react';
import {
    Dialog,
    Button,
    Text,
    Flex,
    Icon,
    Box,
    useDisclosure,
} from '@chakra-ui/react';
import {FiAlertTriangle, FiX} from 'react-icons/fi';

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
    const {open, onOpen, onClose} = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const pendingPayloadRef = useRef<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const openDialog = useCallback((payload: T) => {
        pendingPayloadRef.current = payload;
        onOpen();
    }, [onOpen]);

    const handleConfirm = useCallback(() => {
        if (!pendingPayloadRef.current) return;
        setIsLoading(true);
        setTimeout(() => {
            onConfirm(pendingPayloadRef.current!);
            setIsLoading(false);
            onClose();
        }, 600);
    }, [onConfirm, onClose]);

    const DialogIcon = () => (
        <Flex justify="center" mb={6}>
            <Box position="relative">
                <Icon
                    as={FiAlertTriangle}
                    boxSize={20}
                    color={`${colorScheme}.400`}
                    filter="drop-shadow(0 0 20px rgba(229, 62, 62, 0.3))"
                />
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="24px"
                    h="24px"
                    bg={`${colorScheme}.500`}
                    borderRadius="full"
                    filter="blur(12px)"
                    opacity={0.6}
                />
            </Box>
        </Flex>
    );

    const DialogHeader = () => (
        <Dialog.Header textAlign="center" mb={4}>
            <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${colorScheme}.400, orange.400)`}
                bgClip="text"
            >
                {title}
            </Text>
        </Dialog.Header>
    );

    const DialogFooter = () => (
        <Dialog.Footer
            gap={4}
            mt={2}
            flexDirection={{base: 'column', sm: 'row'}}
        >
            <Button
                ref={cancelRef}
                variant="outline"
                size="lg"
                flex={1}
                onClick={onClose}
                color="gray.300"
                borderColor="gray.600"
                _hover={{
                    bg: 'gray.700',
                    borderColor: 'gray.500',
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                }}
                transition="all 0.2s"
            >
                <FiX/> {cancelText}
            </Button>

            <Button
                colorScheme={colorScheme}
                size="lg"
                flex={1}
                onClick={handleConfirm}
                loading={isLoading}
                loadingText="Выполняется..."
                bgGradient={`linear(to-r, ${colorScheme}.500, ${colorScheme}.600)`}
                _hover={{
                    bgGradient: `linear(to-r, ${colorScheme}.600, ${colorScheme}.700)`,
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 25px rgba(229, 62, 62, 0.3)',
                }}
                _active={{
                    transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                shadow="xl"
                fontWeight="bold"
            >
                {confirmText}
            </Button>
        </Dialog.Footer>
    );

    const ConfirmationDialog = () => (
        <Dialog.Root
            open={open}
            onOpenChange={(e) => !e.open && onClose()}
            role="alertdialog"
            initialFocusEl={() => cancelRef.current ?? null}
        >
            <Dialog.Backdrop
                bg="blackAlpha.800"
                backdropFilter="blur(4px)"
                transition="all 0.2s ease-in-out"
            />

            <Dialog.Positioner>
                <Dialog.Content
                    bg="linear-gradient(145deg, #1a202c 0%, #2d3748 100%)"
                    border="2px solid"
                    borderColor={`${colorScheme}.400`}
                    borderTop="4px solid"
                    borderTopColor={`${colorScheme}.500`}
                    maxW="md"
                    borderRadius="2xl"
                    shadow="dark-lg"
                    p={8}
                >
                    <Button
                        variant="ghost"
                        position="absolute"
                        top={4}
                        right={4}
                        size="sm"
                        onClick={onClose}
                        color="gray.400"
                        _hover={{color: 'white', bg: 'whiteAlpha.100'}}
                    >
                        <Icon as={FiX} boxSize={5}/>
                    </Button>

                    <DialogIcon/>
                    <DialogHeader/>

                    <Dialog.Body textAlign="center">
                        <Text color="gray.300" fontSize="lg" mb={2}>
                            {description}
                        </Text>
                    </Dialog.Body>

                    <DialogFooter/>

                    <Text color="gray.500" fontSize="xs" textAlign="center" mt={6}>
                        Нажмите ESC или кликните вне окна для отмены
                    </Text>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );

    return {openDialog, ConfirmationDialog};
};
