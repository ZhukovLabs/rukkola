'use client';

import React, { useState, useTransition } from 'react';
import {
    Box,
    Button,
    Image,
    Text,
    VStack,
    SimpleGrid,
    Flex,
    Spinner,
    Dialog,
    Portal,
    Center,
} from '@chakra-ui/react';
import { FiUpload, FiStar, FiTrash2, FiPower } from 'react-icons/fi';
import { activeLunch, deleteLunch, deactivateLunch } from './actions';

type Lunch = {
    _id: string;
    image: string;
    active: boolean;
};

export const LunchGallery = ({ initialLunches }: { initialLunches: Lunch[] }) => {
    const [lunches, setLunches] = useState<Lunch[]>(initialLunches);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/lunches/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setLunches(prev => [{ _id: data.id, image: data.image, active: false }, ...prev]);
            } else {
                console.error('Upload failed', await res.text());
            }
        } catch (err) {
            console.error('Upload error', err);
        } finally {
            setLoading(false);
            setFile(null);
        }
    };

    const handleActivate = (id: string) => {
        startTransition(() => {
            void (async () => {
                const lunch = lunches.find(l => l._id === id)
                if (!lunch) return

                try {
                    if (lunch.active) {
                        const res = await deactivateLunch()
                        if (res?.success) {
                            setLunches(prev => prev.map(l => ({ ...l, active: false })))
                        }
                    } else {
                        const res = await activeLunch(id)
                        if (res?.success) {
                            setLunches(prev =>
                                prev.map(l => l._id === id ? { ...l, active: true } : { ...l, active: false })
                            )
                        } else {
                            console.error('Activate lunch failed:', res?.message)
                        }
                    }
                } catch (err) {
                    console.error('Activate lunch error', err)
                }
            })()
        })
    }

    const handleDeactivateAll = async () => {
        setDeactivating(true);
        try {
            const res = await deactivateLunch();
            if (res?.success) {
                setLunches(prev => prev.map(l => ({ ...l, active: false })));
            } else {
                console.error('Deactivate all failed:', res?.message);
            }
        } catch (err) {
            console.error('Deactivate all error', err);
        } finally {
            setDeactivating(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            const res = await deleteLunch(id);
            if (res?.success) {
                setLunches(prev => prev.filter(l => l._id !== id));
            } else {
                console.error('Delete lunch failed:', res?.message);
            }
        } catch (err) {
            console.error('Delete lunch error', err);
        } finally {
            setDeleting(null);
            setConfirmingId(null);
        }
    };

    const hoverShadow = '0 6px 18px rgba(2,6,23,0.35)';
    const activeBorder = '2px solid #2dd4bf';

    return (
        <Box mx="auto" bg="gray.900" borderRadius="2xl" position="relative" p={6}>
            <Text fontSize="1.5rem" fontWeight="bold" mb={4}>
                Галерея обедов
            </Text>

            <Flex justify="flex-end" mb={4}>
                <Button
                    size="md"
                    onClick={handleDeactivateAll}
                    loading={deactivating}
                    bg="linear-gradient(90deg, rgba(45,212,191,0.12), rgba(45,212,191,0.06))"
                    color="teal.100"
                    border="1px solid"
                    borderColor="rgba(45,212,191,0.12)"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(2,6,23,0.18)' }}
                    _active={{ transform: 'scale(0.98)' }}
                    borderRadius="lg"
                    fontWeight="600"
                    px={4}
                    py={2}
                    aria-label="Выключить отображение обеда"
                    title="Выключить отображение обеда"
                >
                    <Box as="span" display="inline-flex" alignItems="center" gap={2}>
                        <FiPower />
                        Выключить отображение обеда
                    </Box>
                </Button>
            </Flex>

            <VStack gap={5} align="stretch">
                <Box
                    border="2px dashed"
                    borderColor={file ? 'teal.400' : 'gray.600'}
                    borderRadius="xl"
                    p={6}
                    textAlign="center"
                    bg={isDragOver ? 'rgba(45,212,191,0.03)' : 'rgba(40,40,45,0.45)'}
                    cursor="pointer"
                    transition="all 0.18s ease"
                    _hover={{ bg: 'rgba(45,212,191,0.05)' }}
                    onClick={() => document.getElementById('lunch-image-input')?.click()}
                    onDragOver={e => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={e => {
                        e.preventDefault();
                        setIsDragOver(false);
                    }}
                    onDrop={e => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile && droppedFile.type.startsWith('image/')) setFile(droppedFile);
                    }}
                >
                    <input
                        id="lunch-image-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                    />

                    {file ? (
                        <Flex direction="column" align="center" gap={2}>
                            <Image
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                borderRadius="lg"
                                maxH="160px"
                                objectFit="cover"
                                w="auto"
                            />
                            <Flex align="center" gap={2}>
                                {loading ? (
                                    <Spinner color="teal.400" size="sm" />
                                ) : null}
                                <Text fontSize="xs" color="gray.300">{file.name}</Text>
                            </Flex>
                        </Flex>
                    ) : (
                        <Text color="gray.400" fontSize="sm">Перетащите файл сюда или нажмите для выбора</Text>
                    )}
                </Box>

                {file && (
                    <Button
                        onClick={handleUpload}
                        loading={loading}
                        loadingText="Загрузка..."
                        rounded="xl"
                        px={6}
                        py={3}
                        fontWeight="bold"
                        bg="rgba(255,255,255,0.06)"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.08)"
                        backdropFilter="blur(6px)"
                        boxShadow="0 6px 24px rgba(10, 10, 10, 0.12)"
                        _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                        _active={{ transform: "scale(0.99)" }}
                        aria-label="Загрузить новый обед"
                    >
                        <Box as="span" mr={3} style={{ display: "inline-flex", alignItems: "center" }}>
                            <FiUpload />
                        </Box>
                        Загрузить новый обед
                    </Button>
                )}

                <Box position="relative">
                    {isPending && (
                        <Center
                            position="absolute"
                            inset={0}
                            zIndex={40}
                            bg="rgba(0,0,0,0.4)"
                            borderRadius="lg"
                        >
                            <Flex
                                align="center"
                                gap={3}
                                bg="rgba(255,255,255,0.04)"
                                p={3}
                                px={5}
                                borderRadius="lg"
                                boxShadow="0 8px 24px rgba(2,6,23,0.32)"
                            >
                                <Spinner color="teal.300" size="lg" />
                                <Text color="teal.100" fontWeight="600">Сохранение...</Text>
                            </Flex>
                        </Center>
                    )}

                    <SimpleGrid columns={[2, 3, 4]} gap={4}>
                        {lunches.map(lunch => (
                            <Box
                                key={lunch._id}
                                position="relative"
                                borderRadius="lg"
                                overflow="hidden"
                                border={lunch.active ? activeBorder : '1px solid rgba(255,255,255,0.04)'}
                                boxShadow={hoverShadow}
                                transition="transform 0.18s ease, box-shadow 0.18s ease"
                                _hover={{ transform: 'translateY(-4px)' }}
                            >
                                <Image
                                    src={lunch.image}
                                    alt="lunch"
                                    objectFit="cover"
                                    w="100%"
                                    h="160px"
                                    borderRadius="lg"
                                    cursor="pointer"
                                    onClick={() => handleActivate(lunch._id)}
                                />

                                {lunch.active && (
                                    <Flex
                                        position="absolute"
                                        top={2}
                                        right={2}
                                        bg="teal.400"
                                        p={1}
                                        borderRadius="full"
                                        align="center"
                                        justify="center"
                                    >
                                        <FiStar color="white" size={14} />
                                    </Flex>
                                )}

                                <Button
                                    size="xs"
                                    position="absolute"
                                    bottom={2}
                                    right={2}
                                    colorScheme="red"
                                    rounded="md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmingId(lunch._id);
                                    }}
                                    loading={deleting === lunch._id}
                                >
                                    <FiTrash2 />
                                </Button>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </VStack>

            <Dialog.Root open={!!confirmingId} onOpenChange={() => setConfirmingId(null)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.400" backdropFilter="blur(3px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="gray.800" borderRadius="xl" p={5} color="white" maxW="sm" w="full">
                            <Dialog.Header mb={3}>
                                <Dialog.Title fontSize="lg" fontWeight="bold" color="teal.300">
                                    Удалить изображение?
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body mb={4}>
                                <Text color="gray.300" fontSize="sm">
                                    Это действие нельзя будет отменить.
                                    <br />
                                    Вы уверены, что хотите удалить обед?
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    p={2}
                                    color="gray.200"
                                    _hover={{
                                        bg: 'gray.500',
                                    }}
                                    variant="outline"
                                    onClick={() => setConfirmingId(null)}
                                    rounded="md"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    p={2}
                                    colorScheme="red"
                                    onClick={() => confirmingId && handleDelete(confirmingId)}
                                    rounded="md"
                                    loading={!!deleting}
                                >
                                    Удалить
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
};
