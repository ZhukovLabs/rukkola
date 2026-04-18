'use client';

import {useEffect, useState} from 'react';
import CategoriesTable from './categories-table';
import {AddCategoryButton} from './add-category-button';
import {AddCategoryDialog} from './add-category-modal';
import {Box, Heading, Flex, Spinner, Center} from '@chakra-ui/react';
import {getCategories, type CategoryItem} from '@/lib/api/categories';

export const DashboardCategoriesPage = () => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getCategories();
                if (result.success && result.data) {
                    setCategories(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <Center minH="200px">
                <Spinner size="xl" color="gray.300"/>
            </Center>
        );
    }

    const cats = JSON.parse(JSON.stringify(categories));

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Heading size="lg" color="gray.300">
                    Управление категориями
                </Heading>
                <AddCategoryButton/>
            </Flex>

            <CategoriesTable categories={cats}/>
            <AddCategoryDialog categories={cats}/>
        </Box>
    );
};
