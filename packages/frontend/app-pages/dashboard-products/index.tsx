'use client'

import {Box, Heading, Card, Flex} from '@chakra-ui/react'
import {useSearchParams, useRouter} from 'next/navigation'
import {Pagination} from '@/components/pagination'
import {CreateProductButton} from './create-product-button'
import {FilterSection} from "./filter-section";
import {ProductsTable} from "./products-table";
import {useProductsTable} from "./hooks/use-products-table";
import dynamic from 'next/dynamic'
import {FiPackage} from 'react-icons/fi'

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
                                <FiPackage size={20} color="gray.400"/>
                            </Box>
                            <Heading size="lg" fontWeight="bold" letterSpacing="tight" color="gray.100">
                                Товары
                            </Heading>
                        </Flex>
                        <CreateProductButton/>
                    </Flex>
                </Card.Header>

                <FilterSection/>

                <Card.Body px={0} py={0}>
                    <ProductsTable/>
                </Card.Body>

                <Card.Footer p={5} borderTop="1px solid" borderColor="gray.800" bg="gray.950">
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPageParam}/>
                </Card.Footer>
            </Card.Root>

            <CreateProductModal/>
            <EditProductModal/>
        </Box>
    )
}