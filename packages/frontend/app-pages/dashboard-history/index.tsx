'use client';

import {
    Badge,
    Box,
    Card,
    Center,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Portal,
    Select,
    Spinner,
    Text,
    VStack,
    createListCollection,
} from '@chakra-ui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ChangeEvent, ElementType} from 'react';
import {FiActivity, FiClock, FiFilter, FiRefreshCw, FiUser} from 'react-icons/fi';
import {AuditLogDto} from '@rukkola/shared';
import {auditLogsApi, getUsers} from '@/lib/api';
import type {SerializedUser} from '@/lib/api/users';
import {useAuth} from '@/lib/auth/auth-context';
import {useDebounce} from '@/hooks/use-debounce';
import {Pagination} from '@/components/pagination';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    {label: 'Новые сначала', value: 'createdAt_desc'},
    {label: 'Старые сначала', value: 'createdAt_asc'},
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

const ENTITY_TYPE_OPTIONS = [
    {label: 'Все действия', value: ''},
    {label: 'Авторизация', value: 'auth'},
    {label: 'Пользователи', value: 'user'},
    {label: 'Товары', value: 'product'},
    {label: 'Категории', value: 'category'},
    {label: 'Обеды', value: 'lunch'},
] as const;

const ENTITY_TYPE_LABELS: Record<string, string> = {
    auth: 'Авторизация',
    user: 'Пользователь',
    product: 'Товар',
    category: 'Категория',
    lunch: 'Обед',
};

const ACTION_CONFIG: Record<string, {colorScheme: string; icon: ElementType}> = {
    'Удаление': {colorScheme: 'red', icon: FiActivity},
    'Создание': {colorScheme: 'green', icon: FiActivity},
    'Вход': {colorScheme: 'teal', icon: FiUser},
    'Выход': {colorScheme: 'gray', icon: FiUser},
    'Блокировка': {colorScheme: 'red', icon: FiActivity},
    'Неудачная': {colorScheme: 'orange', icon: FiActivity},
};

const DATE_INPUT_STYLES = {
    bg: 'gray.800',
    border: '1px solid',
    borderColor: 'gray.700',
    color: 'gray.200',
    borderRadius: 'xl',
    size: 'sm' as const,
    h: '36px',
    w: 'full',
    _hover: {borderColor: 'gray.600'},
    _focus: {borderColor: 'gray.500', boxShadow: '0 0 0 1px gray.500'},
    _placeholder: {color: 'gray.500'},
    css: {
        '&::-webkit-calendar-picker-indicator': {
            filter: 'invert(0.7)',
            cursor: 'pointer',
        },
    },
};

const SELECT_TRIGGER_STYLES = {
    bg: 'gray.800',
    borderColor: 'gray.700',
    color: 'gray.200',
    borderRadius: 'xl',
    w: '100%',
    minW: 0,
};

const SELECT_CONTENT_STYLES = {
    bg: 'gray.800',
    borderColor: 'gray.700',
    borderRadius: 'xl',
};

const EMPTY_FILTER_VALUE = '';

const RU_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

function getActionConfig(action: string) {
    for (const [key, config] of Object.entries(ACTION_CONFIG)) {
        if (action.includes(key)) {
            return config;
        }
    }

    return {
        colorScheme: 'blue',
        icon: FiActivity,
    };
}

function formatRelativeTime(dateString: string): string | null {
    const now = Date.now();
    const date = new Date(dateString).getTime();

    if (Number.isNaN(date)) {
        return null;
    }

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return null;
}

function formatFullDate(dateString: string): string {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return RU_DATE_FORMATTER.format(date);
}

function parseUserAgent(userAgent: string): string | null {
    if (!userAgent || userAgent === 'unknown') {
        return null;
    }

    const parts: string[] = [];

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        parts.push('Chrome');
    } else if (userAgent.includes('Edg')) {
        parts.push('Edge');
    } else if (userAgent.includes('Firefox')) {
        parts.push('Firefox');
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        parts.push('Safari');
    }

    if (userAgent.includes('Macintosh')) {
        parts.push('macOS');
    } else if (userAgent.includes('Windows')) {
        parts.push('Windows');
    } else if (userAgent.includes('Linux')) {
        parts.push('Linux');
    } else if (userAgent.includes('iPhone')) {
        parts.push('iOS');
    } else if (userAgent.includes('Android')) {
        parts.push('Android');
    }

    return parts.length > 0 ? parts.join(', ') : null;
}

function buildDateRangeEnd(dateTo: string): string | undefined {
    return dateTo ? `${dateTo}T23:59:59.999` : undefined;
}

export const DashboardHistoryPage = () => {
    const {user} = useAuth();

    const [logs, setLogs] = useState<AuditLogDto[]>([]);
    const [users, setUsers] = useState<SerializedUser[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [sortValue, setSortValue] = useState<SortValue>(SORT_OPTIONS[0].value);
    const [selectedUserId, setSelectedUserId] = useState(EMPTY_FILTER_VALUE);
    const [selectedEntityType, setSelectedEntityType] = useState(EMPTY_FILTER_VALUE);

    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [refreshKey, setRefreshKey] = useState(0);

    const debouncedDateFrom = useDebounce(dateFrom, 400);
    const debouncedDateTo = useDebounce(dateTo, 400);

    const isAdmin = user?.role === 'admin';

    const sortCollection = useMemo(
        () => createListCollection({items: [...SORT_OPTIONS]}),
        [],
    );

    const entityTypeCollection = useMemo(
        () => createListCollection({items: [...ENTITY_TYPE_OPTIONS]}),
        [],
    );

    const userCollection = useMemo(
        () =>
            createListCollection({
                items: [
                    {
                        label: 'Все пользователи',
                        value: EMPTY_FILTER_VALUE,
                    },
                    ...users.map((currentUser) => ({
                        label: `${currentUser.name} @${currentUser.username}`,
                        value: currentUser._id,
                    })),
                ],
            }),
        [users],
    );

    useEffect(() => {
        if (!isAdmin) {
            return;
        }

        getUsers()
            .then((response) => {
                if (response.success && response.data) {
                    setUsers(response.data);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch users:', error);
            });
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) {
            return;
        }

        const loadLogs = async () => {
            const [sortField, sortOrder] = sortValue.split('_') as [string, 'asc' | 'desc'];

            try {
                const response = await auditLogsApi.getLogs({
                    page,
                    limit: PAGE_SIZE,
                    sortBy: sortField,
                    sortOrder,
                    userId: selectedUserId || undefined,
                    entityType: selectedEntityType || undefined,
                    dateFrom: debouncedDateFrom || undefined,
                    dateTo: buildDateRangeEnd(debouncedDateTo),
                });

                if (response.success && response.data) {
                    setLogs(response.data.logs);
                    setTotal(response.data.total);
                    setTotalPages(response.data.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadLogs();
    }, [
        isAdmin,
        page,
        sortValue,
        selectedUserId,
        selectedEntityType,
        debouncedDateFrom,
        debouncedDateTo,
        refreshKey,
    ]);

    const markForReload = useCallback(() => {
        setLoading(true);
        setRefreshKey((current) => current + 1);
    }, []);

    const handleSortChange = useCallback((details: {value: string[]}) => {
        const nextValue = (details.value[0] ?? SORT_OPTIONS[0].value) as SortValue;
        setLoading(true);
        setPage(1);
        setSortValue(nextValue);
    }, []);

    const handleUserFilterChange = useCallback((details: {value: string[]}) => {
        setLoading(true);
        setPage(1);
        setSelectedUserId(details.value[0] ?? EMPTY_FILTER_VALUE);
    }, []);

    const handleEntityTypeChange = useCallback((details: {value: string[]}) => {
        setLoading(true);
        setPage(1);
        setSelectedEntityType(details.value[0] ?? EMPTY_FILTER_VALUE);
    }, []);

    const handleDateFromChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setPage(1);
        setDateFrom(event.target.value);
    }, []);

    const handleDateToChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setPage(1);
        setDateTo(event.target.value);
    }, []);

    const handlePageChange = useCallback((nextPage: number) => {
        setLoading(true);
        setPage(nextPage);
    }, []);

    const handleRefresh = useCallback(() => {
        markForReload();
    }, [markForReload]);

    const handleResetDates = useCallback(() => {
        setLoading(true);
        setPage(1);
        setDateFrom('');
        setDateTo('');
    }, []);

    if (!isAdmin) {
        return null;
    }

    return (
        <Box minH="100vh">
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
                    <Flex justify="space-between" align="center" gap={4}>
                        <Flex align="center" gap={3} minW={0}>
                            <Box
                                bg="gray.800"
                                borderRadius="lg"
                                p={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="gray.700"
                                flexShrink={0}
                            >
                                <FiActivity size={20} color="white" />
                            </Box>

                            <VStack align="start" gap={0} minW={0}>
                                <Heading
                                    size="lg"
                                    fontWeight="bold"
                                    letterSpacing="tight"
                                    color="gray.100"
                                >
                                    История изменений
                                </Heading>
                                <Text color="gray.500" fontSize="sm">
                                    Отслеживание действий пользователей
                                </Text>
                            </VStack>
                        </Flex>

                        <HStack gap={3} flexShrink={0}>
                            <Text
                                color="gray.500"
                                fontSize="sm"
                                display={{base: 'none', md: 'block'}}
                            >
                                Всего: {total}
                            </Text>

                            <IconButton
                                aria-label="Обновить"
                                onClick={handleRefresh}
                                loading={loading}
                                variant="outline"
                                borderColor="gray.700"
                                color="gray.400"
                                _hover={{bg: 'gray.800', color: 'white'}}
                                size="sm"
                            >
                                <FiRefreshCw />
                            </IconButton>
                        </HStack>
                    </Flex>
                </Card.Header>

                <Card.Body px={{base: 4, md: 6}} py={4}>
                    <Flex
                        mb={5}
                        gap={3}
                        w="full"
                        direction={{base: 'column', md: 'row'}}
                        align={{base: 'stretch', md: 'center'}}
                    >
                        <Box minW={0} w="full" flex={{md: '0 1 260px'}}>
                            <Select.Root
                                collection={entityTypeCollection}
                                value={[selectedEntityType]}
                                onValueChange={handleEntityTypeChange}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                        <HStack gap={2} w="full" minW={0}>
                                            <Box flexShrink={0}>
                                                <FiFilter />
                                            </Box>
                                            <Box flex="1" minW={0} overflow="hidden">
                                                <Select.ValueText
                                                    placeholder="Все действия"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                    display="block"
                                                />
                                            </Box>
                                        </HStack>
                                    </Select.Trigger>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content {...SELECT_CONTENT_STYLES}>
                                            {entityTypeCollection.items.map((item) => (
                                                <Select.Item
                                                    key={item.value}
                                                    item={item}
                                                    color="gray.200"
                                                    _hover={{bg: 'gray.700'}}
                                                >
                                                    {item.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        <Box minW={0} w="full" flex={{md: '0 1 260px'}}>
                            <Select.Root
                                collection={userCollection}
                                value={[selectedUserId]}
                                onValueChange={handleUserFilterChange}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                        <HStack gap={2} w="full" minW={0}>
                                            <Box flexShrink={0}>
                                                <FiFilter />
                                            </Box>
                                            <Box flex="1" minW={0} overflow="hidden">
                                                <Select.ValueText
                                                    placeholder="Все пользователи"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                    display="block"
                                                />
                                            </Box>
                                        </HStack>
                                    </Select.Trigger>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content {...SELECT_CONTENT_STYLES}>
                                            {userCollection.items.map((item) => (
                                                <Select.Item
                                                    key={item.value}
                                                    item={item}
                                                    color="gray.200"
                                                    _hover={{bg: 'gray.700'}}
                                                >
                                                    {item.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        <Box minW={0} w="full" flex={{md: '0 1 240px'}}>
                            <Select.Root
                                collection={sortCollection}
                                value={[sortValue]}
                                onValueChange={handleSortChange}
                                size="sm"
                            >
                                <Select.HiddenSelect />
                                <Select.Control>
                                    <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                        <HStack gap={2} w="full" minW={0}>
                                            <Box flexShrink={0}>
                                                <FiClock />
                                            </Box>
                                            <Box flex="1" minW={0} overflow="hidden">
                                                <Select.ValueText
                                                    placeholder="Сортировка"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                    display="block"
                                                />
                                            </Box>
                                        </HStack>
                                    </Select.Trigger>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content {...SELECT_CONTENT_STYLES}>
                                            {sortCollection.items.map((item) => (
                                                <Select.Item
                                                    key={item.value}
                                                    item={item}
                                                    color="gray.200"
                                                    _hover={{bg: 'gray.700'}}
                                                >
                                                    {item.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        <Box flex={1} minW={0} w="full">
                            <Flex
                                gap={2}
                                align="stretch"
                                direction={{base: 'column', sm: 'row'}}
                                w="full"
                                minW={0}
                            >
                                <Box position="relative" flex={1} minW={0} w="full">
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={handleDateFromChange}
                                        placeholder="Дата с"
                                        aria-label="Дата с"
                                        {...DATE_INPUT_STYLES}
                                    />
                                </Box>

                                <Text
                                    color="gray.500"
                                    fontSize="sm"
                                    flexShrink={0}
                                    display={{base: 'none', sm: 'block'}}
                                    alignSelf="center"
                                >
                                    —
                                </Text>

                                <Box position="relative" flex={1} minW={0} w="full">
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={handleDateToChange}
                                        placeholder="Дата по"
                                        aria-label="Дата по"
                                        {...DATE_INPUT_STYLES}
                                    />
                                </Box>

                                {(dateFrom || dateTo) && (
                                    <IconButton
                                        aria-label="Сбросить даты"
                                        size="sm"
                                        variant="ghost"
                                        color="gray.400"
                                        _hover={{color: 'white', bg: 'gray.700'}}
                                        onClick={handleResetDates}
                                        h="36px"
                                        minW="36px"
                                        alignSelf={{base: 'flex-end', sm: 'center'}}
                                    >
                                        <FiRefreshCw />
                                    </IconButton>
                                )}
                            </Flex>
                        </Box>
                    </Flex>

                    {loading && logs.length === 0 ? (
                        <Center p={10}>
                            <VStack gap={4}>
                                <Spinner size="xl" color="gray.400" />
                                <Text color="gray.500">Загрузка истории...</Text>
                            </VStack>
                        </Center>
                    ) : logs.length === 0 ? (
                        <Center p={10}>
                            <VStack gap={3}>
                                <Box color="gray.600">
                                    <FiClock size={40} />
                                </Box>
                                <Text color="gray.500" fontSize="lg">
                                    История изменений пуста
                                </Text>
                                <Text color="gray.600" fontSize="sm">
                                    Действия администраторов будут отображаться здесь
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack gap={3} align="stretch">
                            {logs.map((log) => {
                                const actionConfig = getActionConfig(log.action);
                                const ActionIcon = actionConfig.icon;
                                const relativeTime = formatRelativeTime(log.createdAt);
                                const fullDate = formatFullDate(log.createdAt);
                                const deviceInfo = parseUserAgent(log.userAgent || '');

                                return (
                                    <Box
                                        key={log.id}
                                        bg="gray.900"
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="gray.800"
                                        _hover={{
                                            borderColor: 'gray.700',
                                            bg: 'gray.800',
                                        }}
                                        transition="all 0.2s"
                                        overflow="hidden"
                                    >
                                        <Flex
                                            gap={4}
                                            p={{base: 3, md: 4}}
                                            align="start"
                                        >
                                            <Flex
                                                flexShrink={0}
                                                align="center"
                                                justify="center"
                                                bg={`${actionConfig.colorScheme}.900`}
                                                borderRadius="lg"
                                                p={{base: 2, md: 2.5}}
                                                boxSize={{base: '40px', md: '44px'}}
                                            >
                                                <ActionIcon
                                                    size={18}
                                                    color="white"
                                                />
                                            </Flex>

                                            <Box flex="1" minW={0}>
                                                <Flex
                                                    justify="space-between"
                                                    align={{
                                                        base: 'flex-start',
                                                        md: 'center',
                                                    }}
                                                    direction={{
                                                        base: 'column',
                                                        md: 'row',
                                                    }}
                                                    gap={{base: 1, md: 0}}
                                                    mb={1}
                                                >
                                                    <HStack
                                                        gap={2}
                                                        wrap="wrap"
                                                        align="center"
                                                    >
                                                        <Badge
                                                            colorScheme={actionConfig.colorScheme}
                                                            variant="subtle"
                                                            px={2}
                                                            py={0.5}
                                                            borderRadius="md"
                                                            fontSize="xs"
                                                            fontWeight="semibold"
                                                        >
                                                            {log.action}
                                                        </Badge>

                                                        {log.entityType &&
                                                            ENTITY_TYPE_LABELS[log.entityType] && (
                                                                <HStack
                                                                    gap={1.5}
                                                                    align="center"
                                                                >
                                                                    <Box
                                                                        w="6px"
                                                                        h="6px"
                                                                        borderRadius="full"
                                                                        bg="teal.400"
                                                                    />
                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="gray.400"
                                                                        whiteSpace="nowrap"
                                                                    >
                                                                        {
                                                                            ENTITY_TYPE_LABELS[log.entityType]
                                                                        }
                                                                    </Text>
                                                                </HStack>
                                                            )}
                                                    </HStack>

                                                    <HStack gap={2} flexShrink={0}>
                                                        <Text
                                                            color="gray.400"
                                                            fontSize="xs"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {relativeTime
                                                                ? `${relativeTime} · `
                                                                : ''}
                                                            {fullDate}
                                                        </Text>
                                                    </HStack>
                                                </Flex>

                                                <Text
                                                    color="gray.300"
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                    wordBreak="break-word"
                                                    whiteSpace="pre-wrap"
                                                    mb={1}
                                                >
                                                    {log.details}
                                                    {deviceInfo && (
                                                        <Text
                                                            as="span"
                                                            color="gray.500"
                                                            fontSize="sm"
                                                            whiteSpace="nowrap"
                                                        >
                                                            {' '}
                                                            · {deviceInfo}
                                                        </Text>
                                                    )}
                                                </Text>

                                                <HStack gap={1.5} wrap="wrap">
                                                    <Box
                                                        bg="gray.700"
                                                        borderRadius="md"
                                                        px={2}
                                                        py={0.5}
                                                    >
                                                        <Text
                                                            fontSize="xs"
                                                            color="gray.300"
                                                            fontWeight="medium"
                                                            truncate
                                                        >
                                                            {log.user.name}
                                                        </Text>
                                                    </Box>
                                                    <Text fontSize="xs" color="gray.400">
                                                        @{log.user.username}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        </Flex>
                                    </Box>
                                );
                            })}
                        </VStack>
                    )}
                </Card.Body>

                {totalPages > 1 && (
                    <Card.Footer
                        p={5}
                        borderTop="1px solid"
                        borderColor="gray.800"
                        bg="gray.950"
                    >
                        <Flex justify="center" w="full">
                            <VStack gap={3}>
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                                <Text color="gray.500" fontSize="sm">
                                    Страница {page} из {totalPages}
                                </Text>
                            </VStack>
                        </Flex>
                    </Card.Footer>
                )}
            </Card.Root>
        </Box>
    );
};