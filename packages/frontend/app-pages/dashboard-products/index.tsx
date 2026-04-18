'use client'

import {Box, Heading, Card} from '@chakra-ui/react'
import {useSearchParams, useRouter} from 'next/navigation'
import {Pagination} from '@/components/pagination'
import {CreateProductButton} from './create-product-button'
import {FilterSection} from "./filter-section";
import {ProductsTable} from "./products-table";
import {useProductsTable} from "./hooks/use-products-table";
import dynamic from 'next/dynamic'

const CreateProductModal = dynamic(
    () => import('./modals/create-modal-product').then(mod => ({default: mod.CreateProductModal})),
    {ssr: false}
)

const EditProductModal = dynamic(
    () => import('./modals/edit-product-modal').then(mod => ({default: mod.EditProductModal})),
    {ssr: false}
)

export const ProductsPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const {page, data: {totalPages}} = useProductsTable();

    const setPageParam = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`?${params.toString()}`, {scroll: false})
    }

    return (
        <Box minH="100vh">
            <CreateProductButton/>

            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.900"
                overflow="hidden"
            >
                <Card.Header
                    bgGradient="linear(to-r, gray.600, cyan.600)"
                    borderTopRadius="2xl"
                    py={4}
                    textAlign="center"
                    color="white"
                    backdropFilter="blur(10px)"
                >
                    <Heading size="lg" fontWeight="bold" letterSpacing="tight">
                        Список товаров
                    </Heading>
                </Card.Header>

                <FilterSection/>

                <Card.Body px={0} py={0}>
                    <ProductsTable/>
                </Card.Body>

                <Card.Footer p={5} borderTop="1px solid" borderColor="gray.800" bg="gray.900">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPageParam}/>
                </Card.Footer>
            </Card.Root>

            <CreateProductModal/>
            <EditProductModal/>
        </Box>
    )
}