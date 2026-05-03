'use client';

import {
    Box,
    Heading,
    Text,
    Badge,
    Spinner,
    Center,
    VStack,
    HStack,
    IconButton,
    Flex,
    Select,
    Portal,
    createListCollection,
    Input,
    Card,
} from '@chakra-ui/react';
import {useEffect, useState, useCallback} from 'react';
import {auditLogsApi, getUsers} from '@/lib/api';
import {useAuth} from '@/lib/auth/auth-context';
import {AuditLogDto} from '@rukkola/shared';
import {FiRefreshCw, FiClock, FiUser, FiActivity, FiFilter} from 'react-icons/fi';
import {Pagination} from '@/components/pagination';
import type {SerializedUser} from '@/lib/api/users';
import {useDebounce} from '@/hooks/use-debounce';

const PAGE_SIZE = 20;

const ACTION_CONFIG: Record<string, {colorScheme: string; icon: React.ElementType}> = {
    'Удаление': {colorScheme: 'red', icon: FiActivity},
    'Создание': {colorScheme: 'green', icon: FiActivity},
    'Вход': {colorScheme: 'teal', icon: FiUser},
    'Выход': {colorScheme: 'gray', icon: FiUser},
};

const SORT_OPTIONS = [
    {label: 'Новые сначала', value: 'createdAt_desc'},
    {label: 'Старые сначала', value: 'createdAt_asc'},
];

const sortCollection = createListCollection({items: SORT_OPTIONS});

function getActionConfig(action: string) {
    for (const [key, config] of Object.entries(ACTION_CONFIG)) {
        if (action.includes(key)) return config;
    }
    return {colorScheme: 'blue', icon: FiActivity};
}

function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return '';
}

function formatFullDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const DashboardHistoryPage = () => {
    const {user} = useAuth();
    const [logs, setLogs] = useState<AuditLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [filterUserId, setFilterUserId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const debouncedDateFrom = useDebounce(dateFrom, 400);
    const debouncedDateTo = useDebounce(dateTo, 400);
    const [users, setUsers] = useState<SerializedUser[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        getUsers().then((res) => {
            if (res.success && res.data) setUsers(res.data);
        }).catch(() => {
        });
    }, [user]);

    const fetchLogs = useCallback(async (params?: {
        pageNum?: number;
        sort?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string
    }) => {
        const pageNum = params?.pageNum ?? page;
        const sort = params?.sort ?? sortBy;
        const userId = params?.userId ?? filterUserId;
        const dFrom = params?.dateFrom ?? debouncedDateFrom;
        const dTo = params?.dateTo ?? debouncedDateTo;

        setLoading(true);
        try {
            const [sortField, sortOrder] = sort.split('_');
            const response = await auditLogsApi.getLogs({
                page: pageNum,
                limit: PAGE_SIZE,
                sortBy: sortField,
                sortOrder: sortOrder as 'asc' | 'desc',
                userId: userId || undefined,
                dateFrom: dFrom || undefined,
                dateTo: dTo ? `${dTo}T23:59:59` : undefined,
            });
            if (response.success && response.data) {
                setLogs(response.data.logs);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, filterUserId, debouncedDateFrom, debouncedDateTo]);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        fetchLogs({pageNum: 1});
    }, [user]);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        fetchLogs({pageNum: 1, dateFrom: debouncedDateFrom, dateTo: debouncedDateTo});
    }, [debouncedDateFrom, debouncedDateTo]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    const handleSortChange = (details: {value: string[]}) => {
        const sort = details.value[0];
        setSortBy(sort);
        fetchLogs({pageNum: 1, sort});
    };

    const handleUserFilterChange = (details: {value: string[]}) => {
        const userId = details.value[0];
        setFilterUserId(userId);
        fetchLogs({pageNum: 1, userId});
    };

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFrom(e.target.value);
    };

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateTo(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        fetchLogs({pageNum: newPage});
    };

    const handleRefresh = () => {
        fetchLogs({pageNum: page});
    };

    const userFilterCollection = createListCollection({
        items: [
            {label: 'Все пользователи', value: ''},
            ...users.map((u) => ({label: `${u.name} @${u.username}`, value: u._id})),
        ],
    });

    const dateInputStyles = {
        bg: 'gray.800',
        border: '1px solid',
        borderColor: 'gray.700',
        color: 'gray.200',
        borderRadius: 'xl',
        size: 'sm' as const,
        h: '36px',
        _hover: {borderColor: 'gray.600'},
        _focus: {borderColor: 'gray.500', boxShadow: '0 0 0 1px gray.500'},
        css: {'&::-webkit-calendar-picker-indicator': {filter: 'invert(0.7)', cursor: 'pointer'}},
    };

    const selectContentStyles = {
        bg: 'gray.800',
        borderColor: 'gray.700',
        borderRadius: 'xl',
    };

    const selectTriggerStyles = {
        bg: 'gray.800',
        borderColor: 'gray.700',
        color: 'gray.200',
        borderRadius: 'xl',
        w: '100%',
    };

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
                                <FiActivity size={20} color="white"/>
                            </Box>
                            <VStack align="start" gap={0}>
                                <Heading size="lg" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                    История изменений
                                </Heading>
                                <Text color="gray.500" fontSize="sm">
                                    Отслеживание действий пользователей
                                </Text>
                            </VStack>
                        </Flex>
                        <HStack gap={3}>
                            <Text color="gray.500" fontSize="sm" display={{base: 'none', md: 'block'}}>
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
                                <FiRefreshCw/>
                            </IconButton>
                        </HStack>
                    </Flex>
                </Card.Header>

                <Card.Body px={{base: 4, md: 6}} py={4}>
                    <Flex
                        mb={5}
                        gap={3}
                        direction={{base: 'column', md: 'row'}}
                        align={{base: 'stretch', md: 'center'}}
                    >
                        <Box minW={{md: '220px'}} flex={{md: '0 1 260px'}}>
                            <Select.Root
                                collection={userFilterCollection}
                                value={[filterUserId]}
                                onValueChange={handleUserFilterChange}
                                size="sm"
                            >
                                <Select.HiddenSelect/>
                                <Select.Control>
                                    <Select.Trigger {...selectTriggerStyles}>
                                        <HStack gap={2} w="full">
                                            <Box flexShrink={0}><FiFilter/></Box>
                                            <Select.ValueText placeholder="Все пользователи" lineClamp={1}
                                                              wordBreak="break-word"/>
                                        </HStack>
                                    </Select.Trigger>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content {...selectContentStyles}>
                                            {userFilterCollection.items.map((item) => (
                                                <Select.Item key={item.value} item={item} color="gray.200"
                                                            _hover={{bg: 'gray.700'}}>
                                                    {item.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        <Box minW={{md: '200px'}} flex={{md: '0 1 240px'}}>
                            <Select.Root
                                collection={sortCollection}
                                value={[sortBy]}
                                onValueChange={handleSortChange}
                                size="sm"
                            >
                                <Select.HiddenSelect/>
                                <Select.Control>
                                    <Select.Trigger {...selectTriggerStyles}>
                                        <HStack gap={2} w="full">
                                            <Box flexShrink={0}><FiClock/></Box>
                                            <Select.ValueText placeholder="Сортировка" lineClamp={1}/>
                                        </HStack>
                                    </Select.Trigger>
                                </Select.Control>
                                <Portal>
                                    <Select.Positioner>
                                        <Select.Content {...selectContentStyles}>
                                            {sortCollection.items.map((item) => (
                                                <Select.Item key={item.value} item={item} color="gray.200"
                                                            _hover={{bg: 'gray.700'}}>
                                                    {item.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Portal>
                            </Select.Root>
                        </Box>

                        <Box flex={1} minW={{md: '280px'}}>
                            <Flex gap={2} align="center">
                                <Box position="relative" flex={1}>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={handleDateFromChange}
                                        placeholder="С"
                                        {...dateInputStyles}
                                    />
                                </Box>
                                <Text color="gray.500" fontSize="sm" flexShrink={0}>—</Text>
                                <Box position="relative" flex={1}>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={handleDateToChange}
                                        placeholder="По"
                                        {...dateInputStyles}
                                    />
                                </Box>
                                {(dateFrom || dateTo) && (
                                    <IconButton
                                        aria-label="Сбросить даты"
                                        size="sm"
                                        variant="ghost"
                                        color="gray.400"
                                        _hover={{color: 'white', bg: 'gray.700'}}
                                        onClick={() => {
                                            setDateFrom('');
                                            setDateTo('');
                                        }}
                                        h="36px"
                                        minW="36px"
                                    >
                                        <FiRefreshCw/>
                                    </IconButton>
                                )}
                            </Flex>
                        </Box>
                    </Flex>

                    {loading && logs.length === 0 ? (
                        <Center p={10}>
                            <VStack gap={4}>
                                <Spinner size="xl" color="gray.400"/>
                                <Text color="gray.500">Загрузка истории...</Text>
                            </VStack>
                        </Center>
                    ) : logs.length === 0 ? (
                        <Center p={10}>
                            <VStack gap={3}>
                                <Box color="gray.600"><FiClock size={40}/></Box>
                                <Text color="gray.500" fontSize="lg">История изменений пуста</Text>
                                <Text color="gray.600" fontSize="sm">Действия администраторов будут отображаться
                                    здесь</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack gap={3} align="stretch">
                            {logs.map((log) => {
                                const config = getActionConfig(log.action);
                                const Icon = config.icon;

                                return (
                                    <Box
                                        key={log.id}
                                        bg="gray.900"
                                        borderRadius="xl"
                                        border="1px solid"
                                        borderColor="gray.800"
                                        _hover={{borderColor: 'gray.700', bg: 'gray.800'}}
                                        transition="all 0.2s"
                                        overflow="hidden"
                                    >
                                        <Flex gap={4} p={{base: 3, md: 4}} align="start">
                                            <Flex
                                                flexShrink={0}
                                                align="center"
                                                justify="center"
                                                bg={`${config.colorScheme}.900`}
                                                borderRadius="lg"
                                                p={{base: 2, md: 2.5}}
                                                boxSize={{base: '40px', md: '44px'}}
                                            >
                                                <Icon size={18} color="white"/>
                                            </Flex>

                                            <Box flex="1" minW={0}>
                                                <Flex
                                                    justify="space-between"
                                                    align={{base: 'flex-start', md: 'center'}}
                                                    direction={{base: 'column', md: 'row'}}
                                                    gap={{base: 1, md: 0}}
                                                    mb={1}
                                                >
                                                    <HStack gap={2} wrap="wrap">
                                                        <Badge
                                                            colorScheme={config.colorScheme}
                                                            variant="subtle"
                                                            px={2}
                                                            py={0.5}
                                                            borderRadius="md"
                                                            fontSize="xs"
                                                            fontWeight="semibold"
                                                        >
                                                            {log.action}
                                                        </Badge>
                                                    </HStack>
                                                    <HStack gap={2} flexShrink={0}>
                                                        <Text color="gray.500" fontSize="xs" whiteSpace="nowrap">
                                                            {formatTimeAgo(log.createdAt) && `${formatTimeAgo(log.createdAt)} · `}
                                                            {formatFullDate(log.createdAt)}
                                                        </Text>
                                                    </HStack>
                                                </Flex>

                                                <Text color="gray.300" fontSize="sm" mb={1.5} fontWeight="medium"
                                                      lineClamp={2} wordBreak="break-word">
                                                    {log.details}
                                                </Text>

                                                <HStack gap={1.5}>
                                                    <Box
                                                        bg="gray.700"
                                                        borderRadius="md"
                                                        px={2}
                                                        py={0.5}
                                                    >
                                                        <Text fontSize="xs" color="gray.300" fontWeight="medium"
                                                              lineClamp={1}>
                                                            {log.user.name}
                                                        </Text>
                                                    </Box>
                                                    <Text fontSize="xs" color="gray.500">
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
                    <Card.Footer p={5} borderTop="1px solid" borderColor="gray.800" bg="gray.950">
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
