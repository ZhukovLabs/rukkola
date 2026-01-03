'use client';

import {memo} from 'react';
import {
    Box,
    Flex,
    Spinner,
    Table,
    Text,
    useBreakpointValue,
} from '@chakra-ui/react';
import {FiSearch} from 'react-icons/fi';

import {ProductType} from '@/models/product';
import {ProductRow} from './product-row';
import {SkeletonRows} from './skeleton-rows';
import {useProductsTable} from './hooks/use-products-table';
import {useConfirmationDialog} from '@/hooks/use-delete-product-confirmation';

type Column = {
    key: string;
    label: string;
    minW?: number | string;
};

const COLUMNS: Column[] = [
    {key: 'photo', label: 'Фото'},
    {key: 'name', label: 'Название', minW: 200},
    {key: 'description', label: 'Описание', minW: 250},
    {key: 'prices', label: 'Цены', minW: 180},
    {key: 'categories', label: 'Категории', minW: 200},
    {key: 'actions', label: 'Действия', minW: 150},
];

export const ProductsTable = memo(() => {
    const {
        data: {products},
        isFetching,
        isPending,
        loadingId,
        deletePending,
        toggleVisibility,
        deleteMutation
    } = useProductsTable();

    const {openDialog, ConfirmationDialog} = useConfirmationDialog({
        onConfirm: deleteMutation.mutate
    });

    const emptySize = useBreakpointValue({base: '24px', md: '32px'});

    const renderEmptyState = () => (
        <Table.Row>
            <Table.Cell colSpan={COLUMNS.length} textAlign="center" py={{base: 8, md: 12}}>
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
            return products.map((product: ProductType) => (
                <ProductRow
                    key={product.id}
                    product={product}
                    onToggle={toggleVisibility.mutate}
                    onDelete={openDialog}
                    loadingId={loadingId}
                    deletePending={deletePending}
                />
            ));
        }

        return isPending ? <SkeletonRows/> : renderEmptyState();
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
                    <Spinner size="xl" color="teal.300"/>
                </Flex>
            )}

            <Table.Root size={{base: 'sm', md: 'md', lg: 'lg'}} variant="outline" w="full">
                <Table.Header bg="gray.900" borderBottomWidth="2px" borderColor="gray.700">
                    <Table.Row>
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
                    {renderContent()}
                </Table.Body>
            </Table.Root>

            <ConfirmationDialog/>
        </Box>
    );
});

ProductsTable.displayName = 'ProductsTable';