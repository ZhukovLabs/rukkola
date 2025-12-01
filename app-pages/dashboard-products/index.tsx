'use client'

import {
    Box,
    Flex,
    Spinner,
    Table,
    Heading,
    Card,
    Input,
    IconButton,
    Select,
    Portal,
    createListCollection,
    Text,
    Button,
} from '@chakra-ui/react'
import {useQuery, useMutation} from '@tanstack/react-query'
import {useSearchParams, useRouter} from 'next/navigation'
import {useState, useEffect, useMemo} from 'react'
import {deleteProduct, getProducts, toggleProductVisibility, getCategories} from './actions'
import {ProductRow} from './product-row'
import {Pagination} from './pagination'
import {EditProductModal} from "./edit-product-modal"
import {ProductType} from "@/models/product"
import {SkeletonRows} from "./skeleton-rows"
import {CreateProductModal} from "./create-modal-product"
import {CreateProductButton} from "./create-product-button"
import {FiSearch, FiX, FiFilter, FiChevronDown, FiRefreshCw} from 'react-icons/fi'
import {CategoryType} from '@/models/category'

export const ProductsPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [deletePending, setDeletePending] = useState<string | null>(null)

    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    const urlSearch = searchParams.get('search') || ''
    const urlCategory = searchParams.get('category') || ''
    const [searchInput, setSearchInput] = useState(urlSearch)
    const [categoryInput, setCategoryInput] = useState(urlCategory)

    useEffect(() => {
        setSearchInput(urlSearch)
        setCategoryInput(urlCategory)
    }, [urlSearch, urlCategory])

    const {data: categories = []} = useQuery<CategoryType[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    })

    const categoryCollection = useMemo(() => {
        const items = categories.map(cat => ({
            label: cat.name,
            value: cat._id.toString(),
        }))
        return createListCollection({items})
    }, [categories])

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            const trimmed = searchInput.trim()

            if (trimmed && trimmed !== urlSearch) {
                params.set('search', trimmed)
                params.set('page', '1')
            } else if (!trimmed && urlSearch) {
                params.delete('search')
            } else {
                return
            }

            router.push(`?${params.toString()}`, {scroll: false})
        }, 300)

        return () => clearTimeout(timer)
    }, [searchInput, urlSearch])

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)

            if (categoryInput && categoryInput !== urlCategory) {
                params.set('category', categoryInput)
                params.set('page', '1')
            } else if (!categoryInput && urlCategory) {
                params.delete('category')
            } else {
                return
            }

            router.push(`?${params.toString()}`, {scroll: false})
        }, 300)

        return () => clearTimeout(timer)
    }, [categoryInput, urlCategory])

    const {data, isFetching, isPending, refetch} = useQuery({
        queryKey: ['products', page, urlSearch, urlCategory],
        queryFn: () => getProducts(page, 10, urlSearch, urlCategory),
        placeholderData: (prev) => prev,
    })

    const {products = [], totalPages = 1} = data ?? {}

    const setPageParam = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`?${params.toString()}`, {scroll: false})
    }

    const toggleVisibility = useMutation({
        mutationFn: toggleProductVisibility,
        onMutate: (id) => setLoadingId(id),
        onSuccess: async () => await refetch(),
        onSettled: () => setLoadingId(null),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onMutate: (id) => setDeletePending(id),
        onSuccess: async () => await refetch(),
        onSettled: () => setDeletePending(null),
    })

    const clearSearch = () => setSearchInput('')
    const clearCategory = () => setCategoryInput('')

    const resetAllFilters = () => {
        setSearchInput('')
        setCategoryInput('')
        router.push('?', {scroll: false})
    }

    const hasActiveFilters = !!urlSearch || !!urlCategory

    return (
        <Box minH="100vh">
            <CreateProductModal refetch={refetch}/>
            <EditProductModal refetch={refetch}/>

            <CreateProductButton/>

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
                    <Heading size="lg" fontWeight="bold" letterSpacing="tight">
                        Список товаров
                    </Heading>
                </Card.Header>

                <Box
                    px={6}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.800"
                    bg="rgba(20, 20, 25, 0.6)"
                    backdropFilter="blur(12px)"
                >
                    <Flex gap={4} align="center" flexWrap="wrap">
                        <Box position="relative" flex="1" minW="250px">
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Поиск по названию..."
                                bg="rgba(30, 30, 35, 0.95)"
                                backdropFilter="blur(16px)"
                                border="1px solid"
                                borderColor="gray.600"
                                color="white"
                                fontSize="sm"
                                fontWeight="medium"
                                h="48px"
                                pl="48px"
                                pr={searchInput ? '48px' : '16px'}
                                borderRadius="xl"
                                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                _hover={{
                                    borderColor: 'teal.500',
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                                }}
                                _placeholder={{color: 'gray.500'}}
                            />

                            <Box
                                position="absolute"
                                left="16px"
                                top="50%"
                                transform="translateY(-50%)"
                                color={searchInput ? 'teal.300' : 'gray.500'}
                                transition="color 0.2s ease"
                                pointerEvents="none"
                                zIndex={1}
                            >
                                <FiSearch size="20px"/>
                            </Box>

                            {searchInput && (
                                <IconButton
                                    aria-label="Очистить поиск"
                                    size="xs"
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{color: 'white', bg: 'rgba(255,255,255,0.15)'}}
                                    _active={{transform: 'scale(0.85) rotate(90deg)'}}
                                    position="absolute"
                                    right="10px"
                                    top="50%"
                                    transform="translateY(-50%)"
                                    onClick={clearSearch}
                                    borderRadius="full"
                                    minW="36px"
                                    h="36px"
                                >
                                    <FiX size="18px"/>
                                </IconButton>
                            )}
                        </Box>

                        <Box position="relative" flex="1" minW="250px">
                            <Select.Root
                                collection={categoryCollection}
                                value={categoryInput ? [categoryInput] : []}
                                onValueChange={(e) => setCategoryInput(e.value[0] || '')}
                                positioning={{sameWidth: true}}
                            >
                                <Select.HiddenSelect/>
                                <Select.Control>
                                    <Select.Trigger
                                        h="48px"
                                        bg="rgba(30, 30, 35, 0.95)"
                                        backdropFilter="blur(16px)"
                                        border="1px solid"
                                        borderColor="gray.600"
                                        borderRadius="xl"
                                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                        _hover={{
                                            borderColor: 'teal.500',
                                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
                                        }}
                                        _open={{
                                            borderColor: 'teal.400',
                                            boxShadow: '0 0 0 2px rgba(45, 212, 191, 0.3)',
                                        }}
                                    >
                                        <Flex align="center" gap={2} pl={3}>
                                            <Box color={categoryInput ? 'teal.300' : 'gray.500'}>
                                                <FiFilter size="18px"/>
                                            </Box>
                                            <Select.ValueText
                                                placeholder="Все категории"
                                                color="white"
                                                _placeholder={{color: 'gray.400'}}
                                                fontSize="sm"
                                                fontWeight="medium"
                                            />
                                        </Flex>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator
                                                asChild
                                                color="gray.400"
                                                _open={{color: 'teal.300', transform: 'rotate(180deg)'}}
                                            >
                                                <FiChevronDown size="18px"/>
                                            </Select.Indicator>
                                        </Select.IndicatorGroup>
                                    </Select.Trigger>
                                </Select.Control>

                                {categoryInput && (
                                    <IconButton
                                        aria-label="Очистить категорию"
                                        size="xs"
                                        variant="ghost"
                                        color="gray.400"
                                        _hover={{color: 'white', bg: 'rgba(255,255,255,0.15)'}}
                                        _active={{transform: 'scale(0.85) rotate(90deg)'}}
                                        position="absolute"
                                        right="40px"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={clearCategory}
                                        borderRadius="full"
                                        minW="36px"
                                        h="36px"
                                        zIndex={2}
                                    >
                                        <FiX size="18px"/>
                                    </IconButton>
                                )}

                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content
                                            bg="rgba(30, 30, 35, 0.98)"
                                            backdropFilter="blur(20px)"
                                            border="1px solid"
                                            borderColor="gray.700"
                                            borderRadius="xl"
                                            boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
                                            maxH="320px"
                                            overflowY="auto"
                                            py={2}
                                            mt={2}
                                        >
                                            {categoryCollection.items.map((item) => (
                                                <Select.Item
                                                    key={item.value}
                                                    item={item}
                                                    px={4}
                                                    py={3}
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                    color="white"
                                                    _highlighted={{
                                                        bg: 'teal.700',
                                                        color: 'white',
                                                        borderRadius: 'md',
                                                        mx: 2,
                                                    }}
                                                    _selected={{
                                                        bg: 'teal.600',
                                                        color: 'white',
                                                        borderRadius: 'md',
                                                        mx: 2,
                                                    }}
                                                >
                                                    <Flex align="center" justify="space-between" w="full">
                                                        <Text>{item.label}</Text>
                                                        <Select.ItemIndicator/>
                                                    </Flex>
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        {hasActiveFilters && (
                            <Button
                                colorScheme="teal"
                                size="md"
                                onClick={resetAllFilters}
                                borderRadius="xl"
                                fontWeight="medium"
                                minW="140px"
                                h="48px"
                                _hover={{
                                    bg: 'teal.500',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)',
                                }}
                                _active={{transform: 'scale(0.98)'}}
                            >
                                <FiRefreshCw/> Сбросить
                            </Button>
                        )}
                    </Flex>
                </Box>

                <Card.Body px={0} py={0}>
                    <Box overflowX="auto" position="relative">
                        {isFetching && (
                            <Flex
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                justify="center"
                                align="center"
                                bg="rgba(0,0,0,0.3)"
                                backdropFilter="blur(4px)"
                                zIndex={10}
                            >
                                <Spinner size="xl" color="teal.400"/>
                            </Flex>
                        )}

                        <Table.Root size="md" variant="outline" w="100%">
                            <Table.Header bg="gray.800">
                                <Table.Row>
                                    {['Фото', 'Название', 'Описание', 'Цены', 'Категории', 'Действия'].map(col => (
                                        <Table.ColumnHeader
                                            key={col}
                                            minW={col === 'Фото' ? undefined : 200}
                                            color="gray.200"
                                            p={4}
                                            fontWeight="semibold"
                                        >
                                            {col}
                                        </Table.ColumnHeader>
                                    ))}
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {products.length > 0 ? (
                                    products.map((product: ProductType) => (
                                        <ProductRow
                                            key={product._id}
                                            p={product}
                                            router={router}
                                            onToggle={(id: string) => toggleVisibility.mutate(id)}
                                            onDelete={(id: string) => confirm('Удалить товар?') && deleteMutation.mutate(id)}
                                            loadingId={loadingId}
                                            deletePending={deletePending}
                                        />
                                    ))
                                ) : isPending ? (
                                    <SkeletonRows/>
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} textAlign="center" py={12}>
                                            <Flex direction="column" align="center" gap={3} color="gray.500">
                                                <FiSearch size="32px"/>
                                                <Text fontSize="lg" fontWeight="medium">
                                                    Товары не найдены
                                                </Text>
                                                <Text fontSize="sm">
                                                    Попробуйте изменить поиск или фильтр
                                                </Text>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Card.Body>

                <Card.Footer p={5} borderTop="1px solid" borderColor="gray.800" bg="gray.900">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPageParam}/>
                </Card.Footer>
            </Card.Root>
        </Box>
    )
}