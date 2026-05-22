'use client'

import {Box, Heading, Card, Flex, Text, Icon} from '@chakra-ui/react'
import {useSearchParams, useRouter} from 'next/navigation'
import {Pagination} from '@/components/pagination'
import {CreateProductButton} from './create-product-button'
import {FilterSection} from "./filter-section";
import {ProductsTable} from "./products-table";
import {useProductsTable} from "./hooks/use-products-table";
import dynamic from 'next/dynamic'
import {FiPackage} from 'react-icons/fi'
import {motion} from 'framer-motion'

const MotionBox = motion.create(Box);

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

    const {page, data: {totalPages, total}} = useProductsTable();

    const setPageParam = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`?${params.toString()}`, {scroll: false})
    }

    return (
        <Box minH="100vh" pb={12}>
            <Flex direction="column" gap={8}>
                <MotionBox
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, ease: "easeOut"}}
                >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={6}>
                        <Flex align="center" gap={5}>
                            <Box
                                bg="orange.900/20"
                                borderRadius="2xl"
                                p={3.5}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                border="1px solid"
                                borderColor="orange.800/30"
                                shadow="0 0 20px rgba(237, 137, 54, 0.15)"
                            >
                                <Icon as={FiPackage} boxSize={7} color="orange.400"/>
                            </Box>
                            <Box>
                                <Heading size="2xl" fontWeight="bold" letterSpacing="tight" color="white" mb={1}>
                                    Товары
                                </Heading>
                                <Flex align="center" gap={2}>
                                    <Box boxSize="6px" borderRadius="full" bg="orange.500" shadow="0 0 8px rgba(237, 137, 54, 0.6)" />
                                    <Text color="gray.500" fontSize="sm" fontWeight="medium">
                                        {total} {total === 1 ? 'позиция' : total > 1 && total < 5 ? 'позиции' : 'позиций'} в меню
                                    </Text>
                                </Flex>
                            </Box>
                        </Flex>
                        
                        <CreateProductButton/>
                    </Flex>
                </MotionBox>

                <MotionBox
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.2, ease: "easeOut"}}
                >
                    <Card.Root
                        w="100%"
                        borderRadius="3xl"
                        shadow="0 30px 60px rgba(0,0,0,0.5)"
                        border="1px solid"
                        borderColor="gray.800"
                        bg="gray.950"
                        overflow="hidden"
                        backdropFilter="blur(10px)"
                    >
                        <FilterSection/>

                        <Card.Body px={0} py={0}>
                            <ProductsTable/>
                        </Card.Body>

                        <Box borderTop="1px solid" borderColor="gray.800" />

                        <Card.Footer 
                            p={8} 
                            bg="gray.950"
                            justifyContent="center"
                        >
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPageParam}/>
                        </Card.Footer>
                    </Card.Root>
                </MotionBox>
            </Flex>

            <CreateProductModal/>
            <EditProductModal/>
        </Box>
    )
}
