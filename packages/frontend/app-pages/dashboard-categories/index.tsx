'use client';

import {useState, useMemo} from 'react';
import CategoriesTable from './categories-table';
import {AddCategoryButton} from './add-category-button';
import {AddCategoryDialog} from './add-category-modal';
import {Box, Heading, Card, Flex, Spinner, Center, Input, Icon, VStack, Text} from '@chakra-ui/react';
import {FiFolder, FiSearch} from 'react-icons/fi';
import {getCategories, type CategoryItem} from '@/lib/api/categories';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth/auth-context';

export const DashboardCategoriesPage = () => {
    const {status} = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const {data: categories = [], isLoading} = useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: async () => {
            const result = await getCategories();
            if (result.success && result.data) {
                return result.data;
            }
            return [] as CategoryItem[];
        },
        staleTime: 0,
    });

    if (status === 'loading') {
        return (
            <Center minH="400px">
                <VStack gap={4}>
                    <Spinner size="xl" color="green.500" />
                    <Text color="gray.500" fontSize="sm">Загрузка...</Text>
                </VStack>
            </Center>
        );
    }

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(query)
        );
    }, [categories, searchQuery]);

    if (isLoading) {
        return (
            <Center minH="400px">
                <Spinner size="xl" color="green.500" />
            </Center>
        );
    }

    return (
        <Box pb={8}>
            <Card.Root
                w="100%"
                borderRadius="3xl"
                shadow="2xl"
                border="1px solid"
                borderColor="gray.800"
                bg="gray.950"
                overflow="hidden"
            >
                <Card.Header
                    bg="gray.900"
                    borderTopRadius="3xl"
                    py={6}
                    px={8}
                    borderBottom="1px solid"
                    borderColor="gray.800"
                >
                    <Flex justify="space-between" align="center" gap={4} wrap="wrap">
                        <Flex align="center" gap={4}>
                            <Box
                                bg="green.900/20"
                                borderRadius="2xl"
                                p={3}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="green.800/30"
                                shadow="0 0 15px rgba(72, 187, 120, 0.1)"
                            >
                                <Icon as={FiFolder} boxSize={6} color="green.400"/>
                            </Box>
                            <Box>
                                <Heading size="xl" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                    Категории
                                </Heading>
                                <Flex align="center" gap={2}>
                                    <Box boxSize="6px" borderRadius="full" bg="green.500" shadow="0 0 8px rgba(72, 187, 120, 0.6)" />
                                    <Box fontSize="xs" color="gray.500" fontWeight="medium">
                                        {categories.length} {categories.length === 1 ? 'категория' : 'категорий'} всего
                                    </Box>
                                </Flex>
                            </Box>
                        </Flex>

                        <Flex gap={4} flex={1} justify="flex-end" minW={{ base: "full", md: "auto" }}>
                            <Box maxW="300px" w="full" position="relative">
                                <Box
                                    position="absolute"
                                    left={4}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    color="gray.500"
                                    zIndex={1}
                                    pointerEvents="none"
                                >
                                    <FiSearch size={18} />
                                </Box>
                                <Input
                                    placeholder="Поиск категорий..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    pl={12}
                                    bg="gray.800"
                                    color="gray.100"
                                    border="1px solid"
                                    borderColor="gray.700"
                                    borderRadius="xl"
                                    _focus={{
                                        borderColor: 'green.500',
                                        boxShadow: '0 0 0 1px green.500',
                                        bg: 'gray.850'
                                    }}
                                    _hover={{ borderColor: 'gray.600' }}
                                    fontSize="sm"
                                    h="42px"
                                />
                            </Box>
                            <AddCategoryButton/>
                        </Flex>
                    </Flex>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    <CategoriesTable categories={filteredCategories} isSearching={searchQuery.length > 0}/>
                </Card.Body>
            </Card.Root>

            <AddCategoryDialog categories={categories}/>
        </Box>
    );
};