'use client';

import React, {useReducer, useState} from 'react';
import {
    Box,
    Button,
    Image,
    Text,
    SimpleGrid,
    Flex,
    Spinner,
    Center,
    Card,
    Icon,
    HStack,
    Heading,
    VStack,
    Badge,
    IconButton,
} from '@chakra-ui/react';
import {
    FiUploadCloud,
    FiTrash2,
    FiPower,
    FiImage,
    FiCheck,
    FiStar,
    FiAlertCircle,
    FiPlus,
} from 'react-icons/fi';
import {motion, AnimatePresence} from 'framer-motion';
import {useMutation} from '@tanstack/react-query';
import {uploadLunch, activeLunch, deleteLunch, deactivateLunch} from './actions';
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog';
import {useToast} from '@/components/toast-container';
import {revalidateMenu} from '@/lib/api/revalidate';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

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

    const toast = useToast();
    const {lunches, file, isDragOver, deletingId} = state;

    const activeLunchItem = lunches.find(l => l.active);

    const deleteMutation = useMutation({
        mutationFn: deleteLunch,
        onMutate: (id: string) => dispatch({type: 'SET_DELETING', payload: id}),
        onSuccess: (res, id) => {
            if (res?.success) {
                dispatch({type: 'REMOVE_LUNCH', payload: id});
                revalidateMenu();
                toast.showSuccess('Изображение удалено');
            } else {
                toast.showError(res?.message || 'Не удалось удалить изображение');
            }
        },
        onError: () => toast.showError('Не удалось удалить изображение'),
        onSettled: () => dispatch({type: 'SET_DELETING', payload: null}),
    });

    const uploadMutation = useMutation({
        mutationFn: uploadLunch,
        onSuccess: (res) => {
            if (res?.success && res?.data) {
                dispatch({type: 'ADD_LUNCH', payload: {id: res.data.id, image: res.data.image}});
                revalidateMenu();
                toast.showSuccess('Изображение успешно загружено');
            } else {
                toast.showError(res?.message || 'Не удалось загрузить изображение');
            }
        },
        onError: () => toast.showError('Ошибка при загрузке изображения'),
    });

    const activateMutation = useMutation({
        mutationFn: activeLunch,
        onSuccess: (res, id) => {
            if (res?.success) {
                dispatch({type: 'UPDATE_ACTIVE', payload: {id, active: true}});
                revalidateMenu();
                toast.showSuccess('Обед активирован для отображения');
            } else {
                toast.showError(res?.message || 'Не удалось активировать обед');
            }
        },
        onError: () => toast.showError('Не удалось изменить статус обеда'),
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateLunch,
        onSuccess: (res) => {
            if (res?.success) {
                dispatch({type: 'DEACTIVATE_ALL'});
                revalidateMenu();
                toast.showInfo('Отображение обеда выключено');
            } else {
                toast.showError(res?.message || 'Не удалось выключить отображение');
            }
        },
        onError: () => toast.showError('Не удалось выключить отображение'),
    });

    const {openDialog: openDeleteDialog, confirmationDialog: deleteConfirmationDialog} = useConfirmationDialog<string>({
        onConfirm: (id: string) => {
            deleteMutation.mutate(id);
        },
        title: 'Удалить изображение обеда?',
        description: 'Это действие нельзя отменить. Изображение будет удалено навсегда.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
    });

    const handleUpload = () => {
        if (!file) return;
        uploadMutation.mutate(file);
    };

    const handleActivate = (id: string) => {
        const lunch = lunches.find(l => l._id === id);
        if (!lunch) return;
        if (lunch.active) {
            deactivateMutation.mutate(undefined as never);
        } else {
            activateMutation.mutate(id);
        }
    };

    const handleDeactivateAll = () => {
        deactivateMutation.mutate(undefined as never);
    };

    const isPending = deleteMutation.isPending || uploadMutation.isPending || activateMutation.isPending || deactivateMutation.isPending;

    return (
        <VStack gap={8} align="stretch" w="100%">
            {/* Header & Tips */}
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
                <VStack align="flex-start" gap={1}>
                    <Heading size="2xl" fontWeight="black" letterSpacing="tight" color="gray.100">
                        Галерея обедов
                    </Heading>
                    <Text color="gray.400" fontSize="md">
                        Управляйте изображениями ежедневных обедов
                    </Text>
                </VStack>

                <Box
                    p={4}
                    borderRadius="2xl"
                    bg="blue.900/20"
                    border="1px solid"
                    borderColor="blue.500/30"
                    backdropFilter="blur(10px)"
                    maxW={{base: '100%', md: '400px'}}
                >
                    <HStack gap={3} align="flex-start">
                        <Icon as={FiAlertCircle} boxSize={5} color="blue.400" mt={0.5}/>
                        <Text fontSize="xs" color="blue.100" lineHeight="tall">
                            Совет: Регулярно удаляйте старые изображения. Это поможет поддерживать порядок и ускорит
                            работу системы.
                        </Text>
                    </HStack>
                </Box>
            </Flex>

            {/* Active Lunch Section */}
            {activeLunchItem && (
                <MotionBox
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    mb={2}
                >
                    <Card.Root
                        variant="subtle"
                        overflow="hidden"
                        bg="cyan.950/20"
                        border="1px solid"
                        borderColor="cyan.500/40"
                        borderRadius="2xl"
                    >
                        <Card.Body p={6}>
                            <Flex direction={{base: 'column', md: 'row'}} gap={6} align="center">
                                <Box
                                    position="relative"
                                    w={{base: '100%', md: '300px'}}
                                    h="200px"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    boxShadow="2xl"
                                >
                                    <Image
                                        src={activeLunchItem.image}
                                        alt="Текущий обед"
                                        w="full"
                                        h="full"
                                        objectFit="cover"
                                    />
                                    <Badge
                                        position="absolute"
                                        top={3}
                                        left={3}
                                        colorPalette="cyan"
                                        variant="solid"
                                        size="lg"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                    >
                                        <Icon as={FiStar}/>
                                        АКТИВЕН
                                    </Badge>
                                </Box>

                                <VStack align="flex-start" gap={4} flex={1}>
                                    <Box>
                                        <Text color="cyan.400" fontWeight="bold" fontSize="sm" textTransform="uppercase"
                                              letterSpacing="widest">
                                            Текущее отображение
                                        </Text>
                                        <Heading size="xl" color="white" mt={1}>
                                            Это изображение сейчас видят пользователи
                                        </Heading>
                                    </Box>
                                    <Button
                                        onClick={handleDeactivateAll}
                                        variant="outline"
                                        colorPalette="cyan"
                                        size="lg"
                                        borderRadius="xl"
                                    >
                                        <FiPower/>
                                        Скрыть из меню
                                    </Button>
                                </VStack>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                </MotionBox>
            )}

            {/* Main Content Area */}
            <SimpleGrid columns={{base: 1, lg: 3}} gap={8}>
                {/* Upload Panel */}
                <Box>
                    <VStack align="flex-start" gap={4} position="sticky" top={6}>
                        <Heading size="md" color="gray.200" fontWeight="bold">
                            Загрузить новое
                        </Heading>
                        <Card.Root
                            w="100%"
                            bg="gray.900/50"
                            border="1px solid"
                            borderColor="gray.800"
                            borderRadius="2xl"
                            overflow="hidden"
                        >
                            <Card.Body p={6}>
                                <MotionBox
                                    whileHover={{scale: 1.01}}
                                    whileTap={{scale: 0.99}}
                                    border="2px dashed"
                                    borderColor={file ? 'cyan.500' : isDragOver ? 'cyan.400' : 'gray.700'}
                                    borderRadius="xl"
                                    p={8}
                                    textAlign="center"
                                    bg={isDragOver ? 'cyan.950/30' : 'gray.950/40'}
                                    cursor="pointer"
                                    transitionProperty="all"
                                    transitionDuration="300ms"
                                    transitionTimingFunction="ease"
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
                                        onChange={e => dispatch({
                                            type: 'SET_FILE',
                                            payload: e.target.files?.[0] ?? null
                                        })}
                                    />

                                    <AnimatePresence mode="wait">
                                        {file ? (
                                            <MotionFlex
                                                key="preview"
                                                initial={{opacity: 0, scale: 0.9}}
                                                animate={{opacity: 1, scale: 1}}
                                                exit={{opacity: 0, scale: 0.9}}
                                                direction="column"
                                                align="center"
                                                gap={4}
                                            >
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    maxH="180px"
                                                    borderRadius="lg"
                                                    objectFit="cover"
                                                    boxShadow="lg"
                                                />
                                                <HStack gap={2} bg="gray.800" px={3} py={1} borderRadius="full">
                                                    <Icon as={FiCheck} color="cyan.400"/>
                                                    <Text fontSize="xs" color="gray.300" maxW="150px" truncate>
                                                        {file.name}
                                                    </Text>
                                                </HStack>
                                            </MotionFlex>
                                        ) : (
                                            <MotionFlex
                                                key="empty"
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                exit={{opacity: 0}}
                                                direction="column"
                                                align="center"
                                                gap={3}
                                            >
                                                <Center boxSize={12} bg="gray.800" borderRadius="xl" color="gray.500">
                                                    <FiPlus size={24}/>
                                                </Center>
                                                <VStack gap={1}>
                                                    <Text color="gray.200" fontWeight="bold">Нажмите или
                                                        перетащите</Text>
                                                    <Text color="gray.500" fontSize="xs">PNG, JPG до 5МБ</Text>
                                                </VStack>
                                            </MotionFlex>
                                        )}
                                    </AnimatePresence>
                                </MotionBox>

                                {file && (
                                    <Button
                                        mt={6}
                                        w="full"
                                        colorPalette="cyan"
                                        size="lg"
                                        borderRadius="xl"
                                        onClick={handleUpload}
                                    >
                                        <FiUploadCloud/> Загрузить фото
                                    </Button>
                                )}
                            </Card.Body>
                        </Card.Root>
                    </VStack>
                </Box>

                {/* Gallery Grid */}
                <Box gridColumn={{lg: 'span 2'}}>
                    <VStack align="flex-start" gap={4}>
                        <Heading size="md" color="gray.200" fontWeight="bold">
                            Архив изображений
                        </Heading>

                        <Box position="relative" w="100%" minH="400px">
                            {isPending && (
                                <Center
                                    position="absolute"
                                    inset={0}
                                    bg="blackAlpha.700"
                                    backdropFilter="blur(4px)"
                                    borderRadius="2xl"
                                    zIndex={10}
                                >
                                    <VStack gap={3}>
                                        <Spinner size="xl" color="cyan.500"/>
                                        <Text color="white" fontWeight="bold">Обновление...</Text>
                                    </VStack>
                                </Center>
                            )}

                            {lunches.length === 0 && !isPending ? (
                                <Center w="100%" h="400px" bg="gray.900/30" borderRadius="2xl" border="1px dashed"
                                        borderColor="gray.800">
                                    <VStack gap={3}>
                                        <Icon as={FiImage} boxSize={10} color="gray.700"/>
                                        <Text color="gray.600" fontWeight="medium">В архиве пока пусто</Text>
                                    </VStack>
                                </Center>
                            ) : (
                                <SimpleGrid columns={{base: 2, sm: 3, md: 4}} gap={4}>
                                    <AnimatePresence>
                                        {lunches.map((lunch, index) => (
                                            <MotionBox
                                                key={lunch._id}
                                                layout
                                                initial={{opacity: 0, scale: 0.9}}
                                                animate={{opacity: 1, scale: 1}}
                                                exit={{opacity: 0, scale: 0.8}}
                                                transition={{duration: 0.2, delay: index * 0.05}}
                                                position="relative"
                                                borderRadius="xl"
                                                overflow="hidden"
                                                data-group
                                                role="group"
                                                cursor="pointer"
                                                boxShadow="md"
                                                border="2px solid"
                                                borderColor={lunch.active ? 'cyan.500' : 'transparent'}
                                                onClick={() => handleActivate(lunch._id)}
                                            >
                                                <Image
                                                    src={lunch.image}
                                                    alt="Обед"
                                                    w="full"
                                                    h="160px"
                                                    objectFit="cover"
                                                    transition="transform 0.5s ease"
                                                    _groupHover={{transform: 'scale(1.1)'}}
                                                />

                                                {/* Overlay */}
                                                <Box
                                                    position="absolute"
                                                    inset={0}
                                                    bgGradient="linear(to-t, blackAlpha.800, transparent, blackAlpha.400)"
                                                    opacity={lunch.active ? 1 : 0}
                                                    transition="opacity 0.3s"
                                                    _groupHover={{opacity: 1}}
                                                />

                                                {/* Delete Button */}
                                                <IconButton
                                                    aria-label="Удалить"
                                                    size="sm"
                                                    colorPalette="red"
                                                    variant="solid"
                                                    borderRadius="lg"
                                                    position="absolute"
                                                    top={2}
                                                    right={2}
                                                    zIndex={2}
                                                    opacity={0.85}
                                                    _hover={{opacity: 1, bg: 'red.600'}}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteDialog(lunch._id);
                                                    }}
                                                    loading={deletingId === lunch._id}
                                                >

                                                    <FiTrash2 size={14}/>
                                                </IconButton>

                                                {lunch.active && (
                                                    <Badge
                                                        position="absolute"
                                                        top={2}
                                                        left={2}
                                                        colorPalette="cyan"
                                                        variant="solid"
                                                        size="xs"
                                                        borderRadius="md"
                                                    >
                                                        <Icon as={FiStar} mr={1}/> АКТИВЕН
                                                    </Badge>
                                                )}

                                                <Flex
                                                    position="absolute"
                                                    bottom={2}
                                                    left={2}
                                                    right={2}
                                                    justify="center"
                                                    opacity={lunch.active ? 0 : 0}
                                                    transform="translateY(10px)"
                                                    transition="all 0.2s"
                                                    _groupHover={{
                                                        opacity: lunch.active ? 0 : 1,
                                                        transform: 'translateY(0)'
                                                    }}
                                                >
                                                    <Text fontSize="xs" color="white" fontWeight="bold"
                                                          textShadow="0 2px 4px rgba(0,0,0,0.5)">
                                                        Активировать
                                                    </Text>
                                                </Flex>
                                            </MotionBox>
                                        ))}
                                    </AnimatePresence>
                                </SimpleGrid>
                            )}
                        </Box>
                    </VStack>
                </Box>
            </SimpleGrid>

            {deleteConfirmationDialog}
        </VStack>
    );
};
