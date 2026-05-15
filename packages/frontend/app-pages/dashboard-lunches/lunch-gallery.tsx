'use client';

import React, {useReducer, useTransition} from 'react';
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
} from '@chakra-ui/react';
import {FiUploadCloud, FiTrash2, FiPower, FiImage, FiCheck, FiX, FiStar, FiAlertCircle} from 'react-icons/fi';
import {uploadLunch, activeLunch, deleteLunch, deactivateLunch} from './actions';
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog';
import {useToast} from '@/components/toast-container';
import {revalidateMenu} from '@/lib/api/revalidate';

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

    const {openDialog: openDeleteDialog, confirmationDialog: deleteConfirmationDialog} = useConfirmationDialog<string>({
        onConfirm: async (id: string) => {
            dispatch({type: 'SET_DELETING', payload: id});
            try {
                const res = await deleteLunch(id);
                if (res?.success) {
                    dispatch({type: 'REMOVE_LUNCH', payload: id});
                    revalidateMenu();
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
        try {
            const res = await uploadLunch(file);
            if (res?.success && res?.data) {
                dispatch({type: 'ADD_LUNCH', payload: {id: res.data.id, image: res.data.image}});
                revalidateMenu();
                toast.showSuccess('Изображение успешно загружено');
            } else {
                toast.showError(res?.message || 'Не удалось загрузить изображение');
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
                        revalidateMenu();
                        toast.showInfo('Отображение обеда выключено');
                    } else {
                        toast.showError(res?.message || 'Не удалось выключить отображение');
                    }
                } else {
                    const res = await activeLunch(id);
                    if (res?.success) {
                        dispatch({type: 'UPDATE_ACTIVE', payload: {id, active: true}});
                        revalidateMenu();
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
            <Box
                mb={6}
                p={4}
                borderRadius="xl"
                bg="blue.900/30"
                border="1px solid"
                borderColor="blue.500/50"
                color="blue.200"
            >
                <HStack gap={3}>
                    <Icon as={FiAlertCircle} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                        Пожалуйста, удаляйте старые изображения, если они больше не нужны — это поможет серверу работать быстрее.
                    </Text>
                </HStack>
            </Box>

            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.800"
                bg="gray.950"
                overflow="hidden"
            >
                <Card.Header
                    bg="gray.900"
                    borderTopRadius="2xl"
                    py={4}
                    px={6}
                    borderBottom="1px solid"
                    borderColor="gray.800"
                >
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap={3}>
                            <Box
                                bg="gray.800"
                                borderRadius="lg"
                                p={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="gray.700"
                            >
                                <FiImage size={20} color="white"/>
                            </Box>
                            <Heading size="lg" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                Галерея обедов
                            </Heading>
                        </Flex>

                        {lunches.some(l => l.active) && (
                            <Button
                                size="sm"
                                onClick={handleDeactivateAll}
                                variant="outline"
                                borderColor="gray.600"
                                color="gray.300"
                                _hover={{bg: 'gray.800', borderColor: 'gray.500'}}
                                borderRadius="lg"
                                px={3}
                            >
                                <FiPower size={14}/>
                                Скрыть обед
                            </Button>
                        )}
                    </Flex>
                </Card.Header>

                <Card.Body p={{base: 4, md: 6}}>
                    <Box
                        border="2px dashed"
                        borderColor={file ? 'cyan.600' : isDragOver ? 'cyan.500' : 'gray.700'}
                        borderRadius="xl"
                        p={{base: 6, md: 8}}
                        textAlign="center"
                        bg={isDragOver ? 'cyan.900/30' : 'gray.800/40'}
                        cursor="pointer"
                        transition="all 0.2s ease"
                        _hover={{borderColor: 'gray.500', bg: 'gray.800/60'}}
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
                            <Flex direction="column" align="center" gap={3}>
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    maxH="200px"
                                    borderRadius="lg"
                                    objectFit="cover"
                                    border="1px solid"
                                    borderColor="gray.700"
                                />
                                <HStack gap={1.5} color="gray.400">
                                    <Icon as={FiCheck} boxSize={3} color="cyan.400"/>
                                    <Text fontSize="sm" color="gray.400">{file.name}</Text>
                                </HStack>
                            </Flex>
                        ) : (
                            <Flex direction="column" align="center" gap={2}>
                                <Icon as={FiUploadCloud} boxSize={8} color="gray.500"/>
                                <Text color="gray.400" fontSize="sm">
                                    Перетащите изображение или нажмите для выбора
                                </Text>
                            </Flex>
                        )}
                    </Box>

                    {file && (
                        <Flex justify="center" mt={4}>
                            <Button
                                onClick={handleUpload}
                                colorPalette="cyan"
                                size="sm"
                                borderRadius="lg"
                                px={5}
                            >
                                <FiUploadCloud size={15}/>
                                Загрузить
                            </Button>
                        </Flex>
                    )}

                    <Box position="relative" minHeight="160px" mt={6}>
                        {isPending && (
                            <Center
                                position="absolute"
                                inset={0}
                                bg="blackAlpha.600"
                                borderRadius="xl"
                                zIndex={10}
                            >
                                <HStack gap={3} bg="gray.800" px={5} py={3} borderRadius="lg" border="1px solid" borderColor="gray.700">
                                    <Spinner size="sm" color="cyan.400"/>
                                    <Text color="gray.300" fontSize="sm">Сохранение...</Text>
                                </HStack>
                            </Center>
                        )}

                        {lunches.length === 0 && !isPending ? (
                            <Flex direction="column" align="center" gap={3} py={10}>
                                <Icon as={FiImage} boxSize={7} color="gray.600"/>
                                <Text color="gray.500" fontSize="sm">Нет загруженных изображений</Text>
                            </Flex>
                        ) : (
                            <SimpleGrid columns={[2, 3, 4, 5]} gap={4}>
                                {lunches.map(lunch => (
                                    <Box
                                        key={lunch._id}
                                        position="relative"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        border="1px solid"
                                        borderColor={lunch.active ? 'cyan.500' : 'gray.700'}
                                        transition="all 0.2s ease"
                                        cursor="pointer"
                                        _hover={{borderColor: lunch.active ? 'cyan.400' : 'gray.500'}}
                                        onClick={() => handleActivate(lunch._id)}
                                    >
                                        <Image
                                            src={lunch.image}
                                            alt="Обед"
                                            width="full"
                                            height="160px"
                                            objectFit="cover"
                                        />

                                        {lunch.active && (
                                            <Flex
                                                position="absolute"
                                                top={2}
                                                left={2}
                                                bg="cyan.500"
                                                color="white"
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="md"
                                                alignItems="center"
                                                gap={1}
                                                fontSize="2xs"
                                                fontWeight="bold"
                                                boxShadow="0 2px 8px rgba(0,200,200,0.3)"
                                            >
                                                <FiStar size={9}/>
                                                Активен
                                            </Flex>
                                        )}

                                        <Button
                                            size="sm"
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            variant="solid"
                                            borderRadius="full"
                                            w={6}
                                            h={6}
                                            minW={6}
                                            p={0}
                                            bg="blackAlpha.700"
                                            color="gray.300"
                                            _hover={{bg: 'red.500', color: 'white'}}
                                            onClick={e => {
                                                e.stopPropagation();
                                                openDeleteDialog(lunch._id);
                                            }}
                                            loading={deletingId === lunch._id}
                                        >
                                            <FiTrash2 size={11}/>
                                        </Button>

                                        {!lunch.active && (
                                            <Flex
                                                position="absolute"
                                                bottom={0}
                                                left={0}
                                                right={0}
                                                bg="blackAlpha.500"
                                                py={1}
                                                justify="center"
                                            >
                                                <Text fontSize="2xs" color="gray.300">
                                                    Нажмите для активации
                                                </Text>
                                            </Flex>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        )}
                    </Box>
                </Card.Body>
            </Card.Root>

            {deleteConfirmationDialog}
        </>
    );
};