import {Box, createListCollection, Flex, IconButton, Input, Portal, Select, Text} from "@chakra-ui/react";
import {FiChevronDown, FiEyeOff, FiFilter, FiRefreshCw, FiSearch, FiX} from "react-icons/fi";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {getCategories} from "@/app-pages/dashboard-products/actions";
import {ValueChangeDetails} from "@zag-js/select";
import {useDebounce} from "@/hooks/use-debounce";

export type CategoryItem = { label: string; value: string }

export const FilterSection = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {data: {data: categories = []} = {}} = useQuery<Awaited<ReturnType<typeof getCategories>>>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const categoryCollection = useMemo(() => {
        const items: CategoryItem[] = [
            { label: "Все категории", value: "" },
            ...categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
            })),
        ];
        return createListCollection<CategoryItem>({items})
    }, [categories]);

    const hiddenCollection = useMemo(() => createListCollection({
        items: [
            { label: "Все товары", value: "" },
            { label: "Только скрытые", value: "true" },
            { label: "Только видимые", value: "false" },
        ],
    }), []);

    const urlSearch = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const hidden = searchParams.get('hidden') || '';
    const [localSearch, setLocalSearch] = useState(urlSearch);
    const debouncedSearch = useDebounce(localSearch, 300);

    useEffect(() => {
        setLocalSearch(urlSearch);
    }, [urlSearch]);

    useEffect(() => {
        if (debouncedSearch !== urlSearch) {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearch) {
                params.set('search', debouncedSearch);
            } else {
                params.delete('search');
            }
            params.delete('page');
            router.push(`?${params.toString()}`, {scroll: false});
        }
    }, [debouncedSearch]);

    const setParam = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    };
    const setCategory = (e: ValueChangeDetails<CategoryItem>) => {
        const params = new URLSearchParams(searchParams);
        const val = e.value[0];
        if (val) {
            params.set('category', val);
        } else {
            params.delete('category');
        }
        params.delete('page');
        router.push(`?${params.toString()}`, {scroll: false});
    }
    const setHidden = (e: ValueChangeDetails<{ label: string; value: string }>) => {
        const params = new URLSearchParams(searchParams);
        const val = e.value[0];
        if (val) {
            params.set('hidden', val);
        } else {
            params.delete('hidden');
        }
        params.delete('page');
        router.push(`?${params.toString()}`, {scroll: false});
    }

    const clearParam = (key: string) => () => {
        if (key === 'search') setLocalSearch('');
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        router.push(`?${params.toString()}`, {scroll: false});
    };

    const resetAllFilters = () => {
        setLocalSearch('');
        router.push('?', {scroll: false})
    }

    const hasActiveFilters = !!urlSearch || !!category || !!hidden;

    return (
        <Box
            px={6}
            py={5}
            borderBottom="1px solid"
            borderColor="gray.800"
            bg="gray.950"
        >
            <Flex gap={4} align="center" flexWrap="wrap">
                <Box position="relative" flex="1" minW="200px">
                    <Input
                        value={localSearch}
                        onChange={setParam('search')}
                        placeholder="Поиск по названию..."
                        bg="gray.900"
                        border="1px solid"
                        borderColor="gray.800"
                        color="gray.200"
                        fontSize="sm"
                        fontWeight="medium"
                        h="44px"
                        pl="44px"
                        pr={localSearch ? '40px' : '16px'}
                        borderRadius="lg"
                        transition="all 0.2s"
                        _hover={{
                            borderColor: 'gray.700',
                        }}
                        _focus={{
                            borderColor: 'gray.600',
                            boxShadow: '0 0 0 1px gray.700',
                        }}
                        _placeholder={{color: 'gray.600'}}
                    />
                    <Box
                        position="absolute"
                        left="16px"
                        top="50%"
                        transform="translateY(-50%)"
                        color={localSearch ? 'gray.400' : 'gray.600'}
                        transition="color 0.2s ease"
                        pointerEvents="none"
                        zIndex={1}
                    >
                        <FiSearch size="20px"/>
                    </Box>
                    {localSearch && (
                        <IconButton
                            aria-label="Очистить поиск"
                            size="xs"
                            variant="ghost"
                            color="gray.500"
                            _hover={{color: 'gray.300', bg: 'gray.800'}}
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

                <Box position="relative" flex="1" minW="200px">
                    <Select.Root<CategoryItem>
                        collection={categoryCollection}
                        value={[category]}
                        onValueChange={setCategory}
                        positioning={{sameWidth: true}}
                    >
                        <Select.HiddenSelect/>
                        <Select.Control>
                            <Select.Trigger
                                h="44px"
                                bg="gray.900"
                                border="1px solid"
                                borderColor="gray.800"
                                borderRadius="lg"
                                transition="all 0.2s"
                                _hover={{
                                    borderColor: 'gray.700',
                                }}
                                _open={{
                                    borderColor: 'gray.600',
                                    boxShadow: '0 0 0 1px gray.700',
                                }}
                            >
                                <Flex align="center" gap={2} pl={3}>
                                    <Box color={category ? 'gray.400' : 'gray.600'}>
                                        <FiFilter size="16px"/>
                                    </Box>
                                    <Select.ValueText
                                        placeholder="Все категории"
                                        color="gray.200"
                                        _placeholder={{color: 'gray.600'}}
                                        fontSize="sm"
                                        fontWeight="medium"
                                    />
                                </Flex>
                                <Select.IndicatorGroup>
                                    <Select.Indicator
                                        asChild
                                        color="gray.500"
                                        _open={{color: 'gray.400', transform: 'rotate(180deg)'}}
                                    >
                                        <FiChevronDown size="16px"/>
                                    </Select.Indicator>
                                </Select.IndicatorGroup>
                            </Select.Trigger>
                        </Select.Control>
                        {category && (
                            <IconButton
                                aria-label="Очистить категорию"
                                size="xs"
                                variant="ghost"
                                color="gray.500"
                                _hover={{color: 'gray.300', bg: 'gray.800'}}
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
                                <FiX size="16px"/>
                            </IconButton>
                        )}
                        <Portal>
                            <Select.Positioner>
                                <Select.Content
                                    bg="gray.900"
                                    border="1px solid"
                                    borderColor="gray.800"
                                    borderRadius="lg"
                                    boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
                                    maxH="320px"
                                    overflowY="auto"
                                    py={1}
                                    mt={2}
                                >
                                    {categoryCollection.items.map((item) => (
                                        <Select.Item
                                            key={item.value}
                                            item={item}
                                            px={4}
                                            py={2.5}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color="gray.300"
                                            _highlighted={{
                                                bg: 'gray.800',
                                                color: 'gray.100',
                                                borderRadius: 'md',
                                                mx: 1,
                                            }}
                                            _selected={{
                                                bg: 'gray.800',
                                                color: 'gray.100',
                                                borderRadius: 'md',
                                                mx: 1,
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

                <Box position="relative" flex="1" minW="180px">
                    <Select.Root
                        collection={hiddenCollection}
                        value={hidden ? [hidden] : []}
                        onValueChange={setHidden}
                        positioning={{sameWidth: true}}
                    >
                        <Select.HiddenSelect/>
                        <Select.Control>
                            <Select.Trigger
                                h="44px"
                                bg="gray.900"
                                border="1px solid"
                                borderColor={hidden ? 'orange.800' : 'gray.800'}
                                borderRadius="lg"
                                transition="all 0.2s"
                                _hover={{
                                    borderColor: 'gray.700',
                                }}
                                _open={{
                                    borderColor: 'gray.600',
                                    boxShadow: '0 0 0 1px gray.700',
                                }}
                            >
                                <Flex align="center" gap={2} pl={3}>
                                    <Box color={hidden ? 'orange.400' : 'gray.600'}>
                                        <FiEyeOff size="16px"/>
                                    </Box>
                                    <Select.ValueText
                                        placeholder="Видимость"
                                        color="gray.200"
                                        _placeholder={{color: 'gray.600'}}
                                        fontSize="sm"
                                        fontWeight="medium"
                                    />
                                </Flex>
                                <Select.IndicatorGroup>
                                    <Select.Indicator
                                        asChild
                                        color="gray.500"
                                        _open={{color: 'gray.400', transform: 'rotate(180deg)'}}
                                    >
                                        <FiChevronDown size="16px"/>
                                    </Select.Indicator>
                                </Select.IndicatorGroup>
                            </Select.Trigger>
                        </Select.Control>
                        {hidden && (
                            <IconButton
                                aria-label="Сбросить фильтр видимости"
                                size="xs"
                                variant="ghost"
                                color="gray.500"
                                _hover={{color: 'gray.300', bg: 'gray.800'}}
                                position="absolute"
                                right="20px"
                                top="50%"
                                transform="translateY(-50%)"
                                onClick={clearParam('hidden')}
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
                                    bg="gray.900"
                                    border="1px solid"
                                    borderColor="gray.800"
                                    borderRadius="lg"
                                    boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
                                    py={1}
                                    mt={2}
                                >
                                    {hiddenCollection.items.map((item) => (
                                        <Select.Item
                                            key={item.value}
                                            item={item}
                                            px={4}
                                            py={2.5}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color="gray.300"
                                            _highlighted={{
                                                bg: 'gray.800',
                                                color: 'gray.100',
                                                borderRadius: 'md',
                                                mx: 1,
                                            }}
                                            _selected={{
                                                bg: 'gray.800',
                                                color: 'gray.100',
                                                borderRadius: 'md',
                                                mx: 1,
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
                    <IconButton
                        aria-label="Сбросить фильтры"
                        size="md"
                        variant="ghost"
                        onClick={resetAllFilters}
                        borderRadius="xl"
                        color="gray.600"
                        _hover={{color: 'gray.300', bg: 'gray.800'}}
                        h="44px"
                        minW="44px"
                    >
                        <FiRefreshCw size="18px"/>
                    </IconButton>
                )}
            </Flex>
        </Box>
    )
}