'use client';

import {memo, useCallback, useMemo} from 'react';
import {
    Box,
    Flex,
    Spinner,
    Table,
    Text,
    useBreakpointValue,
} from '@chakra-ui/react';
import {FiSearch} from 'react-icons/fi';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {ProductRow} from './product-row';
import {SortableRow} from './sortable-row';
import {SkeletonRows} from './skeleton-rows';
import {useProductsTable} from './hooks/use-products-table';
import {useConfirmationDialog} from '@/hooks/use-confirmation-dialog';

type Column = {
    key: string;
    label: string;
    minW?: number | string;
};

const COLUMNS: Column[] = [
    {key: 'move', label: '#', minW: 50},
    {key: 'photo', label: 'Фото'},
    {key: 'name', label: 'Название', minW: 200},
    {key: 'description', label: 'Описание', minW: 250},
    {key: 'prices', label: 'Цены', minW: 180},
    {key: 'categories', label: 'Категории', minW: 200},
    {key: 'actions', label: 'Действия', minW: 150},
];

const PAGE_SIZE = 10;

export const ProductsTable = memo(() => {
    const {
        data: {products, total},
        page,
        isFetching,
        isPending,
        loadingId,
        deletePending,
        toggleVisibility,
        togglingAlcoholId,
        toggleAlcohol,
        deleteMutation,
        swapMutation,
        moveMutation,
        movingId,
    } = useProductsTable();

    const productIds = useMemo(() => products.map((p) => p.id), [products]);

    const {openDialog, ConfirmationDialog} = useConfirmationDialog({
        onConfirm: (id: string) => {
            deleteMutation.mutate(id)
        }
    });

    const emptySize = useBreakpointValue({base: '24px', md: '32px'});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = productIds.indexOf(active.id as string);
            const newIndex = productIds.indexOf(over.id as string);

            if (oldIndex === -1 || newIndex === -1) return;

            // Build new order: remove from old position, insert at new position
            const reordered = [...productIds];
            reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, active.id as string);

            const pageOffset = (page - 1) * PAGE_SIZE;

            swapMutation.mutate({
                orderedIds: reordered,
                pageOffset,
            });
        }
    }, [productIds, page, swapMutation]);

    const handleMoveToPosition = useCallback((productId: string, newPosition: number) => {
        moveMutation.mutate({ productId, newPosition });
    }, [moveMutation]);

    const renderEmptyState = () => (
        <Table.Row>
            <Table.Cell colSpan={COLUMNS.length + 1} textAlign="center" py={{base: 8, md: 12}}>
                <Flex direction="column" align="center" gap={3} color="gray.500">
                    <FiSearch size={emptySize}/>
                    <Text fontSize={{base: 'md', md: 'lg'}} fontWeight="medium">
                        Товары не найдены
                    </Text>
                    <Text fontSize="sm" opacity={0.8}>
                        Попробуйте изменить поиск или фильтр
                    </Text>
                </Flex>
            </Table.Cell>
        </Table.Row>
    );

    const renderContent = () => {
        if (products.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return products.map((product: any, index: number) => {
                const absolutePosition = (page - 1) * PAGE_SIZE + index;
                return (
                    <SortableRow key={product.id} id={product.id}>
                        <ProductRow
                            product={product as never}
                            position={absolutePosition}
                            totalItems={total}
                            onToggle={toggleVisibility.mutate}
                            onDelete={openDialog}
                            loadingId={loadingId}
                            deletePending={deletePending}
                            onToggleAlcohol={toggleAlcohol.mutate}
                            togglingAlcoholId={togglingAlcoholId}
                            onMoveToPosition={handleMoveToPosition}
                            isMoving={movingId === product.id}
                        />
                    </SortableRow>
                );
            });
        }

        return isPending ? <SkeletonRows columnsCount={COLUMNS.length + 1}/> : renderEmptyState();
    };

    return (
        <Box
            overflowX="auto"
            position="relative"
            borderRadius="md"
            shadow="md"
            bg="gray.800"
        >
            {isFetching && (
                <Flex
                    position="absolute"
                    inset={0}
                    justify="center"
                    align="center"
                    bg="rgba(0, 0, 0, 0.7)"
                    backdropFilter="blur(8px)"
                    zIndex={10}
                    rounded="md"
                >
                    <Spinner size="xl" color="gray.300"/>
                </Flex>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Table.Root size={{base: 'sm', md: 'md', lg: 'lg'}} variant="outline" w="full">
                    <Table.Header bg="gray.900" borderBottomWidth="2px" borderColor="gray.700">
                        <Table.Row>
                            <Table.ColumnHeader minW="40px" w="40px"/>
                            {COLUMNS.map(({key, label, minW}) => (
                                <Table.ColumnHeader
                                    key={key}
                                    minW={minW}
                                    color="gray.200"
                                    p={{base: 3, md: 4}}
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                    whiteSpace="nowrap"
                                >
                                    {label}
                                </Table.ColumnHeader>
                            ))}
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <SortableContext
                            items={productIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {renderContent()}
                        </SortableContext>
                    </Table.Body>
                </Table.Root>
            </DndContext>

            <ConfirmationDialog/>
        </Box>
    );
});

ProductsTable.displayName = 'ProductsTable';