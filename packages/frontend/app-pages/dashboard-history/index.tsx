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
    Icon,
    Button,
    Grid,
} from '@chakra-ui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ChangeEvent, ElementType} from 'react';
import {
    FiActivity,
    FiClock,
    FiFilter,
    FiRefreshCw,
    FiPackage,
    FiGrid,
    FiCoffee,
    FiUsers,
    FiLock,
    FiUnlock,
    FiLogIn,
    FiLogOut,
    FiPlus,
    FiTrash2,
    FiEdit2,
    FiMonitor,
    FiSmartphone,
    FiCalendar,
    FiX,
    FiInfo,
} from 'react-icons/fi';
import {AuditLogDto} from '@rukkola/shared';
import {auditLogsApi, getUsers} from '@/lib/api';
import type {SerializedUser} from '@/lib/api/users';
import {useAuth} from '@/lib/auth/auth-context';
import {useDebounce} from '@/hooks/use-debounce';
import {Pagination} from '@/components/pagination';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    {label: 'Сначала новые', value: 'createdAt_desc'},
    {label: 'Сначала старые', value: 'createdAt_asc'},
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

const ENTITY_TYPE_OPTIONS = [
    {label: 'Все сущности', value: '', icon: FiFilter},
    {label: 'Авторизация', value: 'auth', icon: FiLock},
    {label: 'Пользователи', value: 'user', icon: FiUsers},
    {label: 'Товары', value: 'product', icon: FiPackage},
    {label: 'Категории', value: 'category', icon: FiGrid},
    {label: 'Обеды', value: 'lunch', icon: FiCoffee},
] as const;

const ENTITY_TYPE_LABELS: Record<string, {label: string; icon: ElementType; color: string}> = {
    auth: {label: 'Авторизация', icon: FiLock, color: 'purple'},
    user: {label: 'Пользователь', icon: FiUsers, color: 'blue'},
    product: {label: 'Товар', icon: FiPackage, color: 'orange'},
    category: {label: 'Категория', icon: FiGrid, color: 'green'},
    lunch: {label: 'Обед', icon: FiCoffee, color: 'pink'},
};

const ACTION_CONFIG: Record<string, {colorPalette: string; icon: ElementType}> = {
    'Удаление': {colorPalette: 'red', icon: FiTrash2},
    'Создание': {colorPalette: 'green', icon: FiPlus},
    'Обновление': {colorPalette: 'blue', icon: FiEdit2},
    'Вход': {colorPalette: 'teal', icon: FiLogIn},
    'Выход': {colorPalette: 'gray', icon: FiLogOut},
    'Блокировка': {colorPalette: 'red', icon: FiLock},
    'Разблокировка': {colorPalette: 'green', icon: FiUnlock},
    'Неудачная': {colorPalette: 'orange', icon: FiLock},
};

const DATE_INPUT_STYLES = {
    bg: 'gray.900',
    border: '1px solid',
    borderColor: 'gray.800',
    color: 'gray.200',
    borderRadius: 'xl',
    size: 'sm' as const,
    h: '38px',
    w: 'full',
    px: 3,
    _hover: {borderColor: 'gray.700', bg: 'gray.800/60'},
    _focus: {borderColor: 'teal.500/50', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500/30)'},
    _placeholder: {color: 'gray.600'},
    css: {
        '&::-webkit-calendar-picker-indicator': {
            filter: 'invert(0.7)',
            cursor: 'pointer',
        },
    },
};

const SELECT_TRIGGER_STYLES = {
    bg: 'gray.900',
    borderColor: 'gray.800',
    color: 'gray.200',
    borderRadius: 'xl',
    w: '100%',
    h: '38px',
    _hover: {borderColor: 'gray.700', bg: 'gray.800/60'},
    _focus: {borderColor: 'teal.500/50', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500/30)'},
};

const SELECT_CONTENT_STYLES = {
    bg: 'gray.900',
    borderColor: 'gray.800',
    borderRadius: 'xl',
    boxShadow: 'xl',
};

const EMPTY_FILTER_VALUE = '';

const DAY_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function getDayLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const dateStr = date.toDateString();
    if (dateStr === now.toDateString()) {
        return 'Сегодня';
    }
    if (dateStr === yesterday.toDateString()) {
        return 'Вчера';
    }

    return DAY_FORMATTER.format(date);
}

const SummaryStat = ({label, value, icon: IconComponent, colorPalette}: {label: string; value: string | number; icon: ElementType; colorPalette: string}) => (
    <Box
        flex="1"
        bg="gray.950"
        p={5}
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.800"
        position="relative"
        overflow="hidden"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
            borderColor: 'gray.700',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px -10px rgba(0,0,0,0.5)',
        }}
    >
        <Box
            position="absolute"
            top="-15px"
            right="-15px"
            color={`${colorPalette}.500`}
            opacity={0.05}
            transform="rotate(-15deg)"
            pointerEvents="none"
        >
            <IconComponent size={70} />
        </Box>
        <VStack align="start" gap={1.5}>
            <HStack gap={2} color="gray.500">
                <IconComponent size={14} />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                    {label}
                </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="black" color="white" letterSpacing="tight">
                {value}
            </Text>
        </VStack>
    </Box>
);

function getActionConfig(action: string) {
    for (const [key, config] of Object.entries(ACTION_CONFIG)) {
        if (action.includes(key)) {
            return config;
        }
    }

    return {
        colorPalette: 'blue',
        icon: FiActivity,
    };
}

function parseDeviceIcon(userAgent: string): ElementType {
    if (!userAgent) return FiMonitor;
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) return FiSmartphone; 
    return FiMonitor;
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

    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;

    return null;
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

const LogDetails = ({log}: {log: AuditLogDto}) => {
    const [isOpen, setIsOpen] = useState(false);
    const actionConfig = getActionConfig(log.action);
    const ActionIcon = actionConfig.icon;
    const relativeTime = formatRelativeTime(log.createdAt);
    const timeOnly = new Date(log.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const deviceInfo = parseUserAgent(log.userAgent || '');
    const DeviceIcon = parseDeviceIcon(log.userAgent || '');

    const entityLabel = log.entityType ? ENTITY_TYPE_LABELS[log.entityType] : null;

    return (
        <Box
            bg="gray.950"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.800"
            _hover={{
                borderColor: 'gray.700',
                bg: 'gray.900/40',
                transform: 'translateX(4px)',
            }}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            overflow="hidden"
            position="relative"
        >
            <Flex gap={4} p={4} align="start">
                <Box position="relative" flexShrink={0}>
                    <Flex
                        align="center"
                        justify="center"
                        bg="gray.900"
                        borderRadius="xl"
                        boxSize="44px"
                        border="1px solid"
                        borderColor="gray.800"
                        shadow={`0 0 20px -5px var(--chakra-colors-${actionConfig.colorPalette}-500/20)`}
                    >
                        <ActionIcon size={20} color={`var(--chakra-colors-${actionConfig.colorPalette}-400)`} />
                    </Flex>
                </Box>

                <Box flex="1" minW={0}>
                    <Flex
                        justify="space-between"
                        align="start"
                        direction={{base: 'column', sm: 'row'}}
                        gap={2}
                    >
                        <VStack align="start" gap={1}>
                            <HStack gap={2}>
                                <Badge
                                    variant="subtle"
                                    colorPalette={actionConfig.colorPalette}
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                    fontSize="10px"
                                    fontWeight="black"
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                >
                                    {log.action}
                                </Badge>
                                {entityLabel && (
                                    <HStack gap={1.5} color={`${entityLabel.color}.400`}>
                                        <entityLabel.icon size={12} />
                                        <Text fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="wider">
                                            {entityLabel.label}
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>
                            <Text
                                color="gray.100"
                                fontSize="sm"
                                fontWeight="semibold"
                                lineHeight="1.4"
                            >
                                {log.details}
                            </Text>
                        </VStack>

                        <VStack align={{base: 'start', sm: 'end'}} gap={0} flexShrink={0}>
                            <Text fontSize="xs" fontWeight="black" color="teal.500">
                                {relativeTime || timeOnly}
                            </Text>
                            <Text fontSize="10px" color="gray.600" fontWeight="medium">
                                {timeOnly}
                            </Text>
                        </VStack>
                    </Flex>

                    <Flex
                        justify="space-between"
                        align="center"
                        mt={3}
                        pt={3}
                        borderTop="1px solid"
                        borderColor="gray.900"
                    >
                        <HStack gap={3}>
                            <HStack gap={2}>
                                <Flex align="center" justify="center" boxSize="18px" bg="gray.800" borderRadius="full">
                                    <FiUsers size={10} color="var(--chakra-colors-gray-50)" />
                                </Flex>
                                <Text fontSize="xs" color="gray.300" fontWeight="bold">
                                    {log.user.name}
                                </Text>
                                <Text fontSize="10px" color="gray.600" fontWeight="medium">
                                    @{log.user.username}
                                </Text>
                            </HStack>

                            <HStack gap={3} color="gray.600" display={{base: 'none', md: 'flex'}} ml={2}>
                                {deviceInfo && (
                                    <HStack gap={1}>
                                        <DeviceIcon size={12} />
                                        <Text fontSize="10px" fontWeight="medium">{deviceInfo}</Text>
                                    </HStack>
                                )}
                                {log.ip && (
                                    <HStack gap={1}>
                                        <FiActivity size={10} />
                                        <Text fontSize="10px" fontFamily="mono" fontWeight="medium">
                                            {log.ip}
                                        </Text>
                                    </HStack>
                                )}
                            </HStack>
                        </HStack>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => setIsOpen(!isOpen)}
                                h="24px"
                                px={2.5}
                                borderRadius="lg"
                                fontSize="10px"
                                colorPalette="gray"
                                fontWeight="bold"
                            >
                                {isOpen ? <FiX size={12} /> : <FiInfo size={12} />}
                                {isOpen ? 'Закрыть' : 'Подробности'}
                            </Button>
                        )}
                    </Flex>

                    {isOpen && log.metadata && (
                        <Box
                            mt={3}
                            p={3}
                            bg="gray.900"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="gray.800"
                            position="relative"
                        >
                            <Box position="absolute" top={2} right={3} color="gray.700">
                                <FiInfo size={12} />
                            </Box>
                            <pre
                                style={{
                                    fontSize: '11px',
                                    color: 'var(--chakra-colors-gray-400)',
                                    fontFamily: 'var(--chakra-fonts-mono)',
                                    lineHeight: '1.5',
                                    overflowX: 'auto',
                                }}
                            >
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </Box>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};

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

    const groupedLogs = useMemo(() => {
        const groups: Array<{dateLabel: string; items: AuditLogDto[]}> = [];
        let currentGroup: {dateLabel: string; items: AuditLogDto[]} | null = null;

        logs.forEach((log) => {
            const dateLabel = getDayLabel(log.createdAt);
            if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
                currentGroup = {dateLabel, items: []};
                groups.push(currentGroup);
            }
            currentGroup.items.push(log);
        });

        return groups;
    }, [logs]);

    if (!isAdmin) {
        return null;
    }

    return (
        <Box minH="100vh" pb={8}>
            <VStack gap={6} align="stretch">
                <Flex
                    direction={{base: 'column', md: 'row'}}
                    gap={4}
                    w="full"
                >
                    <SummaryStat
                        label="Всего действий"
                        value={total}
                        icon={FiActivity}
                        colorPalette="teal"
                    />
                    <SummaryStat
                        label="Последнее действие"
                        value={logs[0] ? formatRelativeTime(logs[0].createdAt) || 'только что' : '—'}
                        icon={FiClock}
                        colorPalette="blue"
                    />
                </Flex>

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
                        bg="gray.900/50"
                        py={4}
                        px={5}
                        borderBottom="1px solid"
                        borderColor="gray.800"
                    >
                        <Flex justify="space-between" align="center">
                            <Flex align="center" gap={4}>
                                <Flex
                                    bg="teal.500"
                                    borderRadius="xl"
                                    boxSize="40px"
                                    align="center"
                                    justify="center"
                                    shadow="0 0 20px rgba(20, 184, 166, 0.3)"
                                >
                                    <FiActivity size={20} color="white" />
                                </Flex>

                                <VStack align="start" gap={0}>
                                    <Heading
                                        size="md"
                                        fontWeight="black"
                                        color="white"
                                        letterSpacing="tight"
                                    >
                                        Журнал активности
                                    </Heading>
                                    <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                                        Аудит всех изменений системы
                                    </Text>
                                </VStack>
                            </Flex>

                            <IconButton
                                aria-label="Обновить"
                                onClick={handleRefresh}
                                loading={loading}
                                variant="subtle"
                                colorPalette="teal"
                                size="sm"
                                borderRadius="xl"
                            >
                                <FiRefreshCw size={16} />
                            </IconButton>
                        </Flex>
                    </Card.Header>

                    <Card.Body px={5} py={6}>
                        <Box
                            mb={8}
                            p={5}
                            bg="gray.900/40"
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor="gray.800"
                        >
                            <Grid
                                templateColumns={{
                                    base: '1fr',
                                    md: 'repeat(2, 1fr)',
                                    lg: 'repeat(4, 1fr)',
                                }}
                                gap={4}
                            >
                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} ml={1}>
                                        <FiFilter size={12} color="var(--chakra-colors-gray-500)" />
                                        <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">Сущность</Text>
                                    </HStack>
                                    <Select.Root
                                        collection={entityTypeCollection}
                                        value={[selectedEntityType]}
                                        onValueChange={handleEntityTypeChange}
                                        size="sm"
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                                <HStack gap={2} w="full">
                                                    <Box flexShrink={0} color="teal.500">
                                                        {selectedEntityType ? (
                                                            <Box as={ENTITY_TYPE_LABELS[selectedEntityType]?.icon ?? FiFilter} fontSize="14px" />
                                                        ) : (
                                                            <FiFilter size={14} />
                                                        )}
                                                    </Box>
                                                    <Select.ValueText placeholder="Все сущности" fontWeight="bold" fontSize="xs" />
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
                                                            _hover={{bg: 'gray.800', color: 'teal.400'}}
                                                            fontSize="xs"
                                                            borderRadius="lg"
                                                            cursor="pointer"
                                                            m={1}
                                                        >
                                                            <HStack gap={3}>
                                                                <item.icon size={14} color="var(--chakra-colors-teal-500)" />
                                                                <Text fontWeight="bold">{item.label}</Text>
                                                            </HStack>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                </VStack>

                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} ml={1}>
                                        <FiUsers size={12} color="var(--chakra-colors-gray-500)" />
                                        <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">Пользователь</Text>
                                    </HStack>
                                    <Select.Root
                                        collection={userCollection}
                                        value={[selectedUserId]}
                                        onValueChange={handleUserFilterChange}
                                        size="sm"
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                                <HStack gap={2} w="full">
                                                    <Box flexShrink={0} color="teal.500">
                                                        <FiUsers size={14} />
                                                    </Box>
                                                    <Select.ValueText placeholder="Все пользователи" fontWeight="bold" fontSize="xs" />
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
                                                            _hover={{bg: 'gray.800', color: 'teal.400'}}
                                                            fontSize="xs"
                                                            borderRadius="lg"
                                                            cursor="pointer"
                                                            m={1}
                                                        >
                                                            <Text fontWeight="bold">{item.label}</Text>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                </VStack>

                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} ml={1}>
                                        <FiCalendar size={12} color="var(--chakra-colors-gray-500)" />
                                        <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">Период</Text>
                                    </HStack>
                                    <Flex gap={2}>
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={handleDateFromChange}
                                            {...DATE_INPUT_STYLES}
                                            fontSize="xs"
                                            fontWeight="bold"
                                        />
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={handleDateToChange}
                                            {...DATE_INPUT_STYLES}
                                            fontSize="xs"
                                            fontWeight="bold"
                                        />
                                        {(dateFrom || dateTo) && (
                                            <IconButton
                                                aria-label="Сбросить"
                                                size="sm"
                                                variant="subtle"
                                                colorPalette="red"
                                                onClick={handleResetDates}
                                                h="38px"
                                                minW="38px"
                                                borderRadius="xl"
                                            >
                                                <FiX size={14} />
                                            </IconButton>
                                        )}
                                    </Flex>
                                </VStack>

                                <VStack align="stretch" gap={2}>
                                    <HStack gap={2} ml={1}>
                                        <FiClock size={12} color="var(--chakra-colors-gray-500)" />
                                        <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">Сортировка</Text>
                                    </HStack>
                                    <Select.Root
                                        collection={sortCollection}
                                        value={[sortValue]}
                                        onValueChange={handleSortChange}
                                        size="sm"
                                    >
                                        <Select.HiddenSelect />
                                        <Select.Control>
                                            <Select.Trigger {...SELECT_TRIGGER_STYLES}>
                                                <HStack gap={2} w="full">
                                                    <Box flexShrink={0} color="teal.500">
                                                        <FiClock size={14} />
                                                    </Box>
                                                    <Select.ValueText placeholder="Сортировка" fontWeight="bold" fontSize="xs" />
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
                                                            _hover={{bg: 'gray.800', color: 'teal.400'}}
                                                            fontSize="xs"
                                                            borderRadius="lg"
                                                            cursor="pointer"
                                                            m={1}
                                                        >
                                                            <Text fontWeight="bold">{item.label}</Text>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Portal>
                                    </Select.Root>
                                </VStack>
                            </Grid>
                        </Box>

                        {loading && logs.length === 0 ? (
                            <Center p={16}>
                                <VStack gap={4}>
                                    <Spinner size="xl" color="teal.500" />
                                    <Text color="gray.500" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">Загрузка данных...</Text>
                                </VStack>
                            </Center>
                        ) : logs.length === 0 ? (
                            <Center p={16} bg="gray.900/20" borderRadius="2xl" border="2px dashed" borderColor="gray.800">
                                <VStack gap={4}>
                                    <Box p={4} bg="gray.900" borderRadius="2xl" color="gray.700">
                                        <FiActivity size={40} />
                                    </Box>
                                    <VStack gap={1}>
                                        <Text color="gray.100" fontSize="lg" fontWeight="black">История пуста</Text>
                                        <Text color="gray.600" fontSize="sm" fontWeight="medium">Попробуйте изменить параметры фильтрации</Text>
                                    </VStack>
                                    {(selectedUserId || selectedEntityType || dateFrom || dateTo) && (
                                        <Button
                                            size="sm"
                                            variant="subtle"
                                            colorPalette="teal"
                                            onClick={() => {
                                                setSelectedUserId(EMPTY_FILTER_VALUE);
                                                setSelectedEntityType(EMPTY_FILTER_VALUE);
                                                setDateFrom('');
                                                setDateTo('');
                                            }}
                                            borderRadius="xl"
                                            mt={2}
                                        >
                                            Сбросить все фильтры
                                        </Button>
                                    )}
                                </VStack>
                            </Center>
                        ) : (
                            <VStack gap={8} align="stretch">
                                {groupedLogs.map((group) => (
                                    <VStack key={group.dateLabel} gap={4} align="stretch">
                                        <HStack gap={3} px={2}>
                                            <Flex align="center" gap={2}>
                                                <Box boxSize="8px" borderRadius="full" bg="teal.500" shadow="0 0 10px var(--chakra-colors-teal-500)" />
                                                <Text fontSize="sm" fontWeight="black" color="white" letterSpacing="tight">
                                                    {group.dateLabel}
                                                </Text>
                                            </Flex>
                                            <Box flex="1" h="1px" bg="gray.800" />
                                            <Badge variant="subtle" colorPalette="gray" borderRadius="full" px={2} fontSize="10px">
                                                {group.items.length}
                                            </Badge>
                                        </HStack>

                                        <VStack gap={3} align="stretch">
                                            {group.items.map((log) => (
                                                <LogDetails key={log.id} log={log} />
                                            ))}
                                        </VStack>
                                    </VStack>
                                ))}
                            </VStack>
                        )}
                    </Card.Body>

                    {totalPages > 1 && (
                        <Card.Footer
                            p={6}
                            borderTop="1px solid"
                            borderColor="gray.800"
                            bg="gray.900/30"
                        >
                            <Flex justify="center" w="full">
                                <VStack gap={3}>
                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                    <HStack gap={2}>
                                        <Text color="gray.600" fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                                            Страница {page} из {totalPages}
                                        </Text>
                                        <Box boxSize="4px" borderRadius="full" bg="gray.800" />
                                        <Text color="gray.600" fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
                                            Всего {total} записей
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Flex>
                        </Card.Footer>
                    )}
                </Card.Root>
            </VStack>
        </Box>
    );
};
