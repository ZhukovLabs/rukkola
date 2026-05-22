'use client';

import {
    Box,
    createListCollection,
    Flex,
    IconButton,
    Input,
    Portal,
    Select,
    Text,
} from '@chakra-ui/react';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    FiChevronDown,
    FiEyeOff,
    FiFilter,
    FiRefreshCw,
    FiSearch,
    FiX,
} from 'react-icons/fi';
import { ValueChangeDetails } from '@zag-js/select';
import { getCategories } from '@/app-pages/dashboard-products/actions';
import { useDebounce } from '@/hooks/use-debounce';

type FilterOption = {
    label: string;
    value: string;
};

type SearchFieldProps = {
    initialValue: string;
    onCommit: (value: string) => void;
    onClear: () => void;
};

const CONTROL_HEIGHT = '42px';
const INPUT_MIN_WIDTH = '200px';
const CATEGORY_SELECT_MIN_WIDTH = '200px';
const VISIBILITY_SELECT_MIN_WIDTH = '180px';
const DROPDOWN_MAX_HEIGHT = '320px';

const SELECT_TRIGGER_STYLES = {
    h: CONTROL_HEIGHT,
    bg: 'gray.800',
    border: '1px solid',
    borderColor: 'gray.700',
    borderRadius: 'xl',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    _hover: {
        borderColor: 'gray.600',
        bg: 'gray.800',
        transform: 'translateY(-1px)',
    },
    _open: {
        borderColor: 'gray.500',
        boxShadow: '0 0 0 1px gray.500, 0 8px 24px rgba(0,0,0,0.3)',
        bg: 'gray.850',
    },
};

const SEARCH_INPUT_STYLES = {
    bg: 'gray.800',
    border: '1px solid',
    borderColor: 'gray.700',
    color: 'gray.200',
    fontSize: 'sm',
    fontWeight: 'medium',
    h: CONTROL_HEIGHT,
    pl: '44px',
    borderRadius: 'xl',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    _hover: {
        borderColor: 'gray.600',
    },
    _focus: {
        borderColor: 'gray.500',
        boxShadow: '0 0 0 1px gray.500, 0 8px 24px rgba(0,0,0,0.3)',
        bg: 'gray.850',
        transform: 'translateY(-1px)',
    },
    _placeholder: {
        color: 'gray.600',
    },
};

const SELECT_VALUE_TEXT_STYLES = {
    color: 'gray.200',
    _placeholder: { color: 'gray.500' },
    fontSize: 'sm',
    fontWeight: 'medium',
    flex: '1',
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const SELECT_PANEL_STYLES = {
    bg: 'gray.800',
    border: '1px solid',
    borderColor: 'gray.700',
    borderRadius: 'xl',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    py: 1,
    mt: 2,
};

const SELECT_ITEM_STYLES = {
    px: 4,
    py: 2.5,
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'gray.400',
    _highlighted: {
        bg: 'gray.700',
        color: 'gray.100',
        borderRadius: 'lg',
        mx: 1,
    },
    _selected: {
        bg: 'gray.700',
        color: 'gray.100',
        borderRadius: 'lg',
        mx: 1,
    },
};

const SELECT_ITEM_ROW_STYLES = {
    align: 'center',
    justify: 'space-between',
    w: 'full',
    minW: 0,
    gap: 2,
};

const CLEAR_BUTTON_STYLES = {
    size: 'xs' as const,
    variant: 'ghost' as const,
    color: 'gray.500',
    _hover: { color: 'gray.300', bg: 'gray.800' },
    borderRadius: 'full',
    minW: '36px',
    h: '36px',
};

const EMPTY_CATEGORY_OPTION: FilterOption = {
    label: 'Все категории',
    value: '',
};

const VISIBILITY_OPTIONS: FilterOption[] = [
    { label: 'Все товары', value: '' },
    { label: 'Только скрытые', value: 'true' },
    { label: 'Только видимые', value: 'false' },
];

const buildUrl = (pathname: string, searchParams: URLSearchParams) => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
};

const getFirstValue = (details: ValueChangeDetails<FilterOption>) => details.value[0] ?? '';

const SearchField = ({ initialValue, onCommit, onClear }: SearchFieldProps) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const debouncedValue = useDebounce(inputValue, 300);

    useEffect(() => {
        onCommit(debouncedValue);
    }, [debouncedValue, onCommit]);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
        onClear();
    }, [onClear]);

    return (
        <Box position="relative" flex="1" minW={INPUT_MIN_WIDTH}>
            <Input
                value={inputValue}
                onChange={handleChange}
                placeholder="Поиск по названию..."
                {...SEARCH_INPUT_STYLES}
                pr={inputValue ? '40px' : '16px'}
            />
            <Box
                position="absolute"
                left="16px"
                top="50%"
                transform="translateY(-50%)"
                color={inputValue ? 'gray.400' : 'gray.600'}
                transition="color 0.2s ease"
                pointerEvents="none"
                zIndex={1}
            >
                <FiSearch size="20px" />
            </Box>
            {inputValue && (
                <IconButton
                    aria-label="Очистить поиск"
                    onClick={handleClear}
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    {...CLEAR_BUTTON_STYLES}
                >
                    <FiX size="18px" />
                </IconButton>
            )}
        </Box>
    );
};

export const FilterSection = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data: { data: categories = [] } = {} } = useQuery<Awaited<ReturnType<typeof getCategories>>>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const categoryCollection = useMemo(() => {
        const items: FilterOption[] = [
            EMPTY_CATEGORY_OPTION,
            ...categories.map((category) => ({
                label: category.name,
                value: category.id,
            })),
        ];

        return createListCollection<FilterOption>({ items });
    }, [categories]);

    const visibilityCollection = useMemo(
        () =>
            createListCollection<FilterOption>({
                items: VISIBILITY_OPTIONS,
            }),
        [],
    );

    const searchValue = searchParams.get('search') ?? '';
    const selectedCategoryId = searchParams.get('category') ?? '';
    const selectedVisibility = searchParams.get('hidden') ?? '';

    const updateQueryParams = useCallback(
        (updater: (params: URLSearchParams) => void) => {
            const nextParams = new URLSearchParams(searchParams.toString());
            updater(nextParams);
            router.replace(buildUrl(pathname, nextParams), { scroll: false });
        },
        [pathname, router, searchParams],
    );

    const commitSearchValue = useCallback(
        (nextSearchValue: string) => {
            if (nextSearchValue === searchValue) return;

            updateQueryParams((params) => {
                if (nextSearchValue) {
                    params.set('search', nextSearchValue);
                } else {
                    params.delete('search');
                }
                params.delete('page');
            });
        },
        [searchValue, updateQueryParams],
    );

    const handleCategoryChange = useCallback(
        (details: ValueChangeDetails<FilterOption>) => {
            const nextCategoryId = getFirstValue(details);

            updateQueryParams((params) => {
                if (nextCategoryId) {
                    params.set('category', nextCategoryId);
                } else {
                    params.delete('category');
                }
                params.delete('page');
            });
        },
        [updateQueryParams],
    );

    const handleVisibilityChange = useCallback(
        (details: ValueChangeDetails<FilterOption>) => {
            const nextVisibility = getFirstValue(details);

            updateQueryParams((params) => {
                if (nextVisibility) {
                    params.set('hidden', nextVisibility);
                } else {
                    params.delete('hidden');
                }
                params.delete('page');
            });
        },
        [updateQueryParams],
    );

    const clearFilter = useCallback(
        (key: 'search' | 'category' | 'hidden') => {
            updateQueryParams((params) => {
                params.delete(key);
                params.delete('page');
            });
        },
        [updateQueryParams],
    );

    const resetAllFilters = useCallback(() => {
        router.replace(pathname, { scroll: false });
    }, [pathname, router]);

    const hasActiveFilters = Boolean(searchValue || selectedCategoryId || selectedVisibility);

    const categoryTriggerPaddingRight = selectedCategoryId ? '104px' : '56px';
    const visibilityTriggerPaddingRight = selectedVisibility ? '104px' : '56px';

    return (
        <Box px={6} py={5} borderBottom="1px solid" borderColor="gray.800" bg="gray.950">
            <Flex gap={4} align="center" flexWrap="wrap">
                <SearchField
                    initialValue={searchValue}
                    onCommit={commitSearchValue}
                    onClear={() => clearFilter('search')}
                />

                <Box position="relative" flex="1" minW={CATEGORY_SELECT_MIN_WIDTH}>
                    <Select.Root<FilterOption>
                        collection={categoryCollection}
                        value={selectedCategoryId ? [selectedCategoryId] : []}
                        onValueChange={handleCategoryChange}
                        positioning={{ sameWidth: true }}
                    >
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger {...SELECT_TRIGGER_STYLES} pr={categoryTriggerPaddingRight}>
                                <Flex align="center" gap={2} pl="12px" flex="1" minW={0}>
                                    <Box color={selectedCategoryId ? 'gray.400' : 'gray.600'} flexShrink={0}>
                                        <FiFilter size="16px" />
                                    </Box>
                                    <Select.ValueText placeholder="Все категории" {...SELECT_VALUE_TEXT_STYLES} />
                                </Flex>
                                <Select.IndicatorGroup flexShrink={0}>
                                    <Select.Indicator
                                        asChild
                                        color="gray.500"
                                        _open={{ color: 'gray.400', transform: 'rotate(180deg)' }}
                                    >
                                        <FiChevronDown size="16px" />
                                    </Select.Indicator>
                                </Select.IndicatorGroup>
                            </Select.Trigger>
                        </Select.Control>

                        {selectedCategoryId && (
                            <IconButton
                                aria-label="Очистить категорию"
                                onClick={() => clearFilter('category')}
                                position="absolute"
                                right="20px"
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                                {...CLEAR_BUTTON_STYLES}
                            >
                                <FiX size="16px" />
                            </IconButton>
                        )}

                        <Portal>
                            <Select.Positioner>
                                <Select.Content {...SELECT_PANEL_STYLES} maxH={DROPDOWN_MAX_HEIGHT} overflowY="auto">
                                    {categoryCollection.items.map((item) => (
                                        <Select.Item key={item.value} item={item} {...SELECT_ITEM_STYLES}>
                                            <Flex {...SELECT_ITEM_ROW_STYLES}>
                                                <Text
                                                    flex="1"
                                                    minW={0}
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                    whiteSpace="nowrap"
                                                >
                                                    {item.label}
                                                </Text>
                                                <Select.ItemIndicator />
                                            </Flex>
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Positioner>
                        </Portal>
                    </Select.Root>
                </Box>

                <Box position="relative" flex="1" minW={VISIBILITY_SELECT_MIN_WIDTH}>
                    <Select.Root<FilterOption>
                        collection={visibilityCollection}
                        value={selectedVisibility ? [selectedVisibility] : []}
                        onValueChange={handleVisibilityChange}
                        positioning={{ sameWidth: true }}
                    >
                        <Select.HiddenSelect />
                        <Select.Control>
                            <Select.Trigger {...SELECT_TRIGGER_STYLES} pr={visibilityTriggerPaddingRight}>
                                <Flex align="center" gap={2} pl="12px" flex="1" minW={0}>
                                    <Box color={selectedVisibility ? 'orange.400' : 'gray.600'} flexShrink={0}>
                                        <FiEyeOff size="16px" />
                                    </Box>
                                    <Select.ValueText placeholder="Видимость" {...SELECT_VALUE_TEXT_STYLES} />
                                </Flex>
                                <Select.IndicatorGroup flexShrink={0}>
                                    <Select.Indicator
                                        asChild
                                        color="gray.500"
                                        _open={{ color: 'gray.400', transform: 'rotate(180deg)' }}
                                    >
                                        <FiChevronDown size="16px" />
                                    </Select.Indicator>
                                </Select.IndicatorGroup>
                            </Select.Trigger>
                        </Select.Control>

                        {selectedVisibility && (
                            <IconButton
                                aria-label="Сбросить фильтр видимости"
                                onClick={() => clearFilter('hidden')}
                                position="absolute"
                                right="20px"
                                top="50%"
                                transform="translateY(-50%)"
                                zIndex={2}
                                {...CLEAR_BUTTON_STYLES}
                            >
                                <FiX size="18px" />
                            </IconButton>
                        )}

                        <Portal>
                            <Select.Positioner>
                                <Select.Content {...SELECT_PANEL_STYLES}>
                                    {visibilityCollection.items.map((item) => (
                                        <Select.Item key={item.value} item={item} {...SELECT_ITEM_STYLES}>
                                            <Flex {...SELECT_ITEM_ROW_STYLES}>
                                                <Text
                                                    flex="1"
                                                    minW={0}
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                    whiteSpace="nowrap"
                                                >
                                                    {item.label}
                                                </Text>
                                                <Select.ItemIndicator />
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
                        onClick={resetAllFilters}
                        borderRadius="xl"
                        color="gray.600"
                        _hover={{ color: 'gray.300', bg: 'gray.800' }}
                        h={CONTROL_HEIGHT}
                        minW={CONTROL_HEIGHT}
                        variant="ghost"
                    >
                        <FiRefreshCw size="18px" />
                    </IconButton>
                )}
            </Flex>
        </Box>
    );
};