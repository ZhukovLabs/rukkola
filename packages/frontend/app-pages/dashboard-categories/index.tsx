'use client';

import {useEffect, useState, useCallback} from 'react';
import CategoriesTable from './categories-table';
import {AddCategoryButton} from './add-category-button';
import {AddCategoryDialog} from './add-category-modal';
import {Box, Heading, Card, Flex, Spinner, Center} from '@chakra-ui/react';
import {FiFolder} from 'react-icons/fi';
import {getCategories, type CategoryItem} from '@/lib/api/categories';

export const DashboardCategoriesPage = () => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <Center minH="200px">
                <Spinner size="xl" color="gray.300"/>
            </Center>
        );
    }

    const cats = JSON.parse(JSON.stringify(categories));

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
                                <FiFolder size={20} color="gray.400"/>
                            </Box>
                            <Heading size="lg" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                Категории
                            </Heading>
                        </Flex>
                        <AddCategoryButton/>
                    </Flex>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    <CategoriesTable categories={cats} onRefresh={fetchCategories}/>
                </Card.Body>
            </Card.Root>

            <AddCategoryDialog categories={cats} onRefresh={fetchCategories}/>
        </Box>
    );
};