import {Box, Button, createListCollection, Flex, IconButton, Input, Portal, Select, Text} from "@chakra-ui/react";
import {FiChevronDown, FiFilter, FiRefreshCw, FiSearch, FiX} from "react-icons/fi";
import {ChangeEvent, useMemo} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {getCategories} from "@/app-pages/dashboard-products/actions";
import {ValueChangeDetails} from "@zag-js/select";

export type CategoryItem = { label: string; value: string }

export const FilterSection = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {data: {data: categories = []} = {}} = useQuery<Awaited<ReturnType<typeof getCategories>>>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const categoryCollection = useMemo(() => {
        const items: CategoryItem[] = categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
        }))
        return createListCollection<CategoryItem>({items})
    }, [categories]);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const setParam = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, e.target.value);
        params.delete('page');
        router.push(`?${params.toString()}`, {scroll: false});
    };
    const setCategory = (e: ValueChangeDetails<CategoryItem>) => {
        const params = new URLSearchParams(searchParams);
        params.set('category', e.value[0]);
        params.delete('page');
        router.push(`?${params.toString()}`, {scroll: false});
    }

    const clearParam = (key: string) => () => {
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        router.push(`?${params.toString()}`, {scroll: false});
    };

    const resetAllFilters = () => {
        router.push('?', {scroll: false})
    }

    const hasActiveFilters = !!search || !!category;

    return (
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
                        value={search}
                        onChange={setParam('search')}
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
                        pr={search ? '48px' : '16px'}
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
                        color={search ? 'teal.300' : 'gray.500'}
                        transition="color 0.2s ease"
                        pointerEvents="none"
                        zIndex={1}
                    >
                        <FiSearch size="20px"/>
                    </Box>
                    {search && (
                        <IconButton
                            aria-label="Очистить поиск"
                            size="xs"
                            variant="ghost"
                            color="gray.400"
                            _hover={{color: 'white', bg: 'rgba(255,255,255,0.15)'}}
                            position="absolute"
                            right="10px"
                            top="50%"
                            transform="translateY(-50%)"
                            onClick={clearParam('search')}
                            borderRadius="full"
                            minW="36px"
                            h="36px"
                        >
                            <FiX size="18px"/>
                        </IconButton>
                    )}
                </Box>

                <Box position="relative" flex="1" minW="250px">
                    <Select.Root<CategoryItem>
                        collection={categoryCollection}
                        value={category ? [category] : []}
                        onValueChange={setCategory}
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
                                    <Box color={category ? 'teal.300' : 'gray.500'}>
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
                        {category && (
                            <IconButton
                                aria-label="Очистить категорию"
                                size="xs"
                                variant="ghost"
                                color="gray.400"
                                _hover={{color: 'white', bg: 'rgba(255,255,255,0.15)'}}
                                position="absolute"
                                right="20px"
                                top="50%"
                                transform="translateY(-50%)"
                                onClick={clearParam('category')}
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
    )
}