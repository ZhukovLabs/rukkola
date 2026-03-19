import {connectToDatabase} from '@/lib/mongoose'
import {Category} from '@/models/category'
import CategoriesTable from './categories-table'
import {AddCategoryButton} from './add-category-button'
import {AddCategoryDialog} from './add-category-modal'
import {Box, Heading, Flex} from '@chakra-ui/react'

export const DashboardCategoriesPage = async () => {
    await connectToDatabase()
    const categories = await Category.find().sort({order: 1}).lean()

    const cats = JSON.parse(JSON.stringify(categories));

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Heading size="lg" color="teal.300">
                    Управление категориями
                </Heading>
                <AddCategoryButton/>
            </Flex>

            <CategoriesTable categories={cats}/>
            <AddCategoryDialog categories={cats}/>
        </Box>
    )
}
