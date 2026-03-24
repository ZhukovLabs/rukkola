'use client';

import React, {useReducer, useTransition} from 'react';
import {
    Box,
    Button,
    Image,
    Text,
    VStack,
    SimpleGrid,
    Flex,
    Spinner,
    Center,
    Heading,
    Card,
    Icon,
} from '@chakra-ui/react';
import {FiUpload, FiStar, FiTrash2, FiPower, FiImage} from 'react-icons/fi';
import {activeLunch, deleteLunch, deactivateLunch} from './actions';
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog';
import {useToast} from '@/components/toast-container';

type Lunch = {
    _id: string;
    image: string;
    active: boolean;
};

type State = {
    lunches: Lunch[];
    file: File | null;
    isDragOver: boolean;
    deletingId: string | null;
};

type Action =
    | { type: 'SET_LUNCHES'; payload: Lunch[] }
    | { type: 'SET_FILE'; payload: File | null }
    | { type: 'SET_DRAG_OVER'; payload: boolean }
    | { type: 'SET_DELETING'; payload: string | null }
    | { type: 'ADD_LUNCH'; payload: { id: string; image: string } }
    | { type: 'UPDATE_ACTIVE'; payload: { id: string; active: boolean } }
    | { type: 'DEACTIVATE_ALL' }
    | { type: 'REMOVE_LUNCH'; payload: string };

const initialState: State = {
    lunches: [],
    file: null,
    isDragOver: false,
    deletingId: null,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_LUNCHES':
            return {...state, lunches: action.payload};
        case 'SET_FILE':
            return {...state, file: action.payload};
        case 'SET_DRAG_OVER':
            return {...state, isDragOver: action.payload};
        case 'SET_DELETING':
            return {...state, deletingId: action.payload};
        case 'ADD_LUNCH':
            return {
                ...state,
                lunches: [{_id: action.payload.id, image: action.payload.image, active: false}, ...state.lunches],
                file: null,
            };
        case 'UPDATE_ACTIVE':
            return {
                ...state,
                lunches: state.lunches.map(l =>
                    l._id === action.payload.id
                        ? {...l, active: action.payload.active}
                        : {...l, active: false}
                ),
            };
        case 'DEACTIVATE_ALL':
            return {
                ...state,
                lunches: state.lunches.map(l => ({...l, active: false})),
            };
        case 'REMOVE_LUNCH':
            return {
                ...state,
                lunches: state.lunches.filter(l => l._id !== action.payload),
            };
        default:
            return state;
    }
}

export const LunchGallery = ({initialLunches}: { initialLunches: Lunch[] }) => {
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        lunches: initialLunches.map(l => ({
            ...l,
            _id: typeof l._id === 'string' ? l._id : (l._id as { toString(): string }).toString()
        })),
    });

    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const {lunches, file, isDragOver, deletingId} = state;

    const {openDialog: openDeleteDialog, ConfirmationDialog: DeleteConfirmationDialog} = useConfirmationDialog<string>({
        onConfirm: async (id: string) => {
            dispatch({type: 'SET_DELETING', payload: id});
            try {
                const res = await deleteLunch(id);
                if (res?.success) {
                    dispatch({type: 'REMOVE_LUNCH', payload: id});
                    toast.showSuccess('Изображение удалено');
                } else {
                    toast.showError(res?.message || 'Не удалось удалить изображение');
                }
            } catch (err) {
                console.error('Delete error', err);
                toast.showError('Не удалось удалить изображение');
            } finally {
                dispatch({type: 'SET_DELETING', payload: null});
            }
        },
        title: 'Удалить изображение обеда?',
        description: 'Это действие нельзя отменить. Изображение будет удалено навсегда.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
    });

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/lunches/upload', {method: 'POST', body: formData});
            if (res.ok) {
                const data = await res.json();
                dispatch({type: 'ADD_LUNCH', payload: {id: data.id, image: data.image}});
                toast.showSuccess('Изображение успешно загружено');
            } else {
                const errorData = await res.json();
                toast.showError(errorData?.error || 'Не удалось загрузить изображение');
            }
        } catch (err) {
            console.error('Upload error', err);
            toast.showError('Ошибка при загрузке изображения');
        }
    };

    const handleActivate = (id: string) => {
        startTransition(async () => {
            const lunch = lunches.find(l => l._id === id);
            if (!lunch) return;

            try {
                if (lunch.active) {
                    const res = await deactivateLunch();
                    if (res?.success) {
                        dispatch({type: 'DEACTIVATE_ALL'});
                        toast.showInfo('Отображение обеда выключено');
                    } else {
                        toast.showError(res?.message || 'Не удалось выключить отображение');
                    }
                } else {
                    const res = await activeLunch(id);
                    if (res?.success) {
                        dispatch({type: 'UPDATE_ACTIVE', payload: {id, active: true}});
                        toast.showSuccess('Обед активирован для отображения');
                    } else {
                        toast.showError(res?.message || 'Не удалось активировать обед');
                    }
                }
            } catch (err) {
                console.error('Activate error', err);
                toast.showError('Не удалось изменить статус обеда');
            }
        });
    };

    const handleDeactivateAll = async () => {
        try {
            const res = await deactivateLunch();
            if (res?.success) {
                dispatch({type: 'DEACTIVATE_ALL'});
                toast.showInfo('Отображение обеда выключено');
            } else {
                toast.showError(res?.message || 'Не удалось выключить отображение');
            }
        } catch (err) {
            console.error('Deactivate all error', err);
            toast.showError('Не удалось выключить отображение');
        }
    };

    return (
        <>
            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.900"
                overflow="hidden"
            >
                <Card.Header
                    bgGradient="linear(to-r, teal.600, cyan.600)"
                    borderTopRadius="2xl"
                    py={4}
                    textAlign="center"
                    color="white"
                    backdropFilter="blur(10px)"
                >
                    <Flex justify="center" align="center" gap={2}>
                        <Icon as={FiImage} boxSize={5}/>
                        <Heading size="md" fontWeight="bold" letterSpacing="tight">
                            Галерея обедов
                        </Heading>
                    </Flex>
                </Card.Header>

                <Card.Body>
                    <Flex justify="space-between" mb={6} flexWrap="wrap" gap={4}>
                        <Text fontSize="lg" color="gray.300">
                            Загружайте и управляйте изображениями обедов
                        </Text>

                        <Button
                            size="md"
                            onClick={handleDeactivateAll}
                            variant="outline"
                            borderColor="teal.600"
                            color="teal.200"
                            _hover={{bg: 'teal.900', transform: 'translateY(-2px)'}}
                            borderRadius="xl"
                            px={6}
                        >
                            <FiPower/> Выключить отображение обеда
                        </Button>
                    </Flex>

                    <VStack gap={6} align="stretch">
                        <Box
                            border="2px dashed"
                            borderColor={file ? 'teal.400' : isDragOver ? 'teal.500' : 'gray.600'}
                            borderRadius="2xl"
                            p={8}
                            textAlign="center"
                            bg={isDragOver ? 'teal.900/30' : 'gray.800/50'}
                            cursor="pointer"
                            transition="all 0.3s ease"
                            _hover={{borderColor: 'teal.400', bg: 'teal.900/20'}}
                            onClick={() => document.getElementById('lunch-image-input')?.click()}
                            onDragOver={e => {
                                e.preventDefault();
                                dispatch({type: 'SET_DRAG_OVER', payload: true});
                            }}
                            onDragLeave={e => {
                                e.preventDefault();
                                dispatch({type: 'SET_DRAG_OVER', payload: false});
                            }}
                            onDrop={e => {
                                e.preventDefault();
                                dispatch({type: 'SET_DRAG_OVER', payload: false});
                                const dropped = e.dataTransfer.files[0];
                                if (dropped?.type.startsWith('image/')) {
                                    dispatch({type: 'SET_FILE', payload: dropped});
                                }
                            }}
                        >
                            <input
                                id="lunch-image-input"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={e => dispatch({type: 'SET_FILE', payload: e.target.files?.[0] ?? null})}
                            />

                            {file ? (
                                <VStack gap={4}>
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        maxH="240px"
                                        borderRadius="xl"
                                        objectFit="cover"
                                        boxShadow="lg"
                                    />
                                    <Text fontSize="sm" color="gray.300">
                                        {file.name}
                                    </Text>
                                </VStack>
                            ) : (
                                <Text color="gray.400" fontSize="lg">
                                    Перетащите изображение сюда или нажмите для выбора
                                </Text>
                            )}
                        </Box>

                        {file && (
                            <Button
                                onClick={handleUpload}
                                size="md"
                                colorScheme="teal"
                                variant="solid"
                                borderRadius="full"
                                px={8}
                                py={5}
                                fontWeight="bold"
                                fontSize="md"
                                height="auto"
                                minWidth="48px"
                                bgGradient="linear(to-r, teal.500, cyan.500)"
                                _hover={{
                                    bgGradient: "linear(to-r, teal.600, cyan.600)",
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 12px 25px rgba(45, 212, 191, 0.3)",
                                }}
                                _active={{
                                    transform: "translateY(0)",
                                }}
                                boxShadow="0 8px 20px rgba(45, 212, 191, 0.2)"
                                transition="all 0.3s ease"
                                display="flex"
                                alignItems="center"
                                gap={3}
                                mx="auto"
                                maxWidth="320px"
                            >
                                <FiUpload size={20}/>
                                <Text
                                    bgGradient="linear(to-r, whiteAlpha.900, teal.50)"
                                    fontWeight="extrabold"
                                >
                                    Загрузить новый обед
                                </Text>
                            </Button>
                        )}
                    </VStack>

                    <Box position="relative" minHeight="200px" marginTop={6}>
                        {isPending && (
                            <Center position="absolute" inset={0} bg="blackAlpha.600" borderRadius="xl" zIndex={10}>
                                <VStack bg="gray.800/80" px={8} py={5} borderRadius="xl" backdropFilter="blur(8px)">
                                    <Spinner size="xl" color="teal.300"/>
                                    <Text color="teal.100" fontWeight="medium">
                                        Сохранение...
                                    </Text>
                                </VStack>
                            </Center>
                        )}

                        <SimpleGrid columns={[2, 3, 4, 5]} gap={6}>
                            {lunches.map(lunch => (
                                <Box
                                    key={lunch._id}
                                    position="relative"
                                    borderRadius="2xl"
                                    overflow="hidden"
                                    border={lunch.active ? '3px solid' : '1px solid'}
                                    borderColor={lunch.active ? 'teal.400' : 'gray.700'}
                                    boxShadow="xl"
                                    transition="all 0.3s ease"
                                    cursor="pointer"
                                    _hover={{
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    }}
                                    onClick={() => handleActivate(lunch._id)}
                                >
                                    <Image
                                        src={lunch.image}
                                        alt="Обед"
                                        width="full"
                                        height="200px"
                                        objectFit="cover"
                                        transition="transform 0.4s ease"
                                        _groupHover={{transform: 'scale(1.05)'}}
                                    />

                                    {lunch.active && (
                                        <Flex
                                            position="absolute"
                                            top={3}
                                            right={3}
                                            bg="teal.500"
                                            p={2}
                                            borderRadius="full"
                                            boxShadow="md"
                                        >
                                            <FiStar color="white" size={18}/>
                                        </Flex>
                                    )}

                                    <Button
                                        size="sm"
                                        position="absolute"
                                        bottom={3}
                                        right={3}
                                        colorScheme="red"
                                        variant="solid"
                                        borderRadius="full"
                                        p={2}
                                        onClick={e => {
                                            e.stopPropagation();
                                            openDeleteDialog(lunch._id);
                                        }}
                                        loading={deletingId === lunch._id}
                                        _hover={{transform: 'scale(1.1)'}}
                                    >
                                        <FiTrash2 size={16}/>
                                    </Button>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                </Card.Body>
            </Card.Root>

            <DeleteConfirmationDialog/>
        </>
    );
};