'use client';

import {useEffect, useState, useCallback, useMemo} from 'react';
import CategoriesTable from './categories-table';
import {AddCategoryButton} from './add-category-button';
import {AddCategoryDialog} from './add-category-modal';
import {Box, Heading, Card, Flex, Spinner, Center, Input} from '@chakra-ui/react';
import {FiFolder, FiSearch} from 'react-icons/fi';
import {getCategories, type CategoryItem} from '@/lib/api/categories';

export const DashboardCategoriesPage = () => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const result = await getCategories();
            if (result.success && result.data) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            setLoading(false);
        };
        init();
    }, [fetchCategories]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories;
        const query = searchQuery.toLowerCase();
        return categories.filter(cat => 
            cat.name.toLowerCase().includes(query)
        );
    }, [categories, searchQuery]);

    if (loading) {
        return (
            <Center minH="400px">
                <Spinner size="xl" color="purple.500" thickness="4px" />
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
                                bg="purple.900/30"
                                borderRadius="2xl"
                                p={3}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="purple.800/50"
                                shadow="0 0 15px rgba(168, 85, 247, 0.1)"
                            >
                                <FiFolder size={24} color="#A855F7"/>
                            </Box>
                            <Box>
                                <Heading size="xl" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                    Категории
                                </Heading>
                                <Box fontSize="xs" color="gray.500" fontWeight="medium">
                                    {categories.length} {categories.length === 1 ? 'категория' : 'категорий'} всего
                                </Box>
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
                                    border="1px solid"
                                    borderColor="gray.700"
                                    borderRadius="xl"
                                    _focus={{
                                        borderColor: 'purple.500',
                                        boxShadow: '0 0 0 1px purple.500',
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
                    <CategoriesTable categories={filteredCategories} onRefresh={fetchCategories} isSearching={searchQuery.length > 0}/>
                </Card.Body>
            </Card.Root>

            <AddCategoryDialog categories={categories} onRefresh={fetchCategories}/>
        </Box>
    );
};