'use client';

import {Box, Flex, Text, IconButton, Spinner, Center} from "@chakra-ui/react";
import Image from "next/image";
import {motion} from "framer-motion";
import {FiX} from "react-icons/fi";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getProductById, type Product} from "./actions";
import {trackViewItem} from "@/lib/ecommerce-tracking";
import {useProductModal} from "./use-product-modal";
import {ProductInfo} from "./product-info";
import {useEffect} from "react";

export const ProductModal = () => {
    const {productId, close: closeModalState} = useProductModal();
    const [imageLoading, setImageLoading] = useState(false);

    const close = () => {
        setImageLoading(false);
        closeModalState();
    };

    const {data: product, isLoading: loading, isError: error} = useQuery({
        queryKey: ["product-modal", productId],
        queryFn: () => getProductById(productId!),
        enabled: !!productId,
    });

    useEffect(() => {
        if (product && productId) {
            trackViewItem({id: productId, name: product.name, price: 0});
        }
    }, [product, productId]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [close]);

    if (!productId && !product) return null;

    const handleBackdropClick = () => {
        if (!loading) close();
    };

    const imageSrc = product?.image
        ? product.image.includes("?") ? `${product.image}&w=1920` : `${product.image}?w=1920`
        : null;

    return (
        <Box position="fixed" inset={0} bg="black" zIndex={9999} overflow="hidden" onClick={handleBackdropClick}>
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} style={{width: "100%", height: "100%"}}>
                <Flex h="100%" direction="column" position="relative">
                    <IconButton
                        aria-label="Закрыть"
                        position="absolute"
                        top={{base: 4, md: 6}}
                        right={{base: 4, md: 6}}
                        zIndex={20}
                        size="lg"
                        borderRadius="full"
                        bg="whiteAlpha.200"
                        backdropFilter="blur(10px)"
                        color="white"
                        border="1px solid rgba(255,255,255,0.2)"
                        boxShadow="0 4px 12px rgba(0,0,0,0.5)"
                        _hover={{bg: "whiteAlpha.300", transform: "scale(1.1)", boxShadow: "0 6px 16px rgba(0,0,0,0.6)"}}
                        _active={{bg: "whiteAlpha.400"}}
                        transition="all 0.2s"
                        onClick={close}
                    >
                        <FiX size={32}/>
                    </IconButton>

                    {loading && (
                        <Center flex="1"><Spinner size="xl" color="gray.300"/></Center>
                    )}

                    {error && (
                        <Center flex="1" flexDirection="column" color="white" px={6}>
                            <Text fontSize="xl" fontWeight="bold" mb={2}>Ошибка загрузки</Text>
                            <Text fontSize="sm" color="gray.400">Попробуйте позже</Text>
                        </Center>
                    )}

                    {product && !loading && !error && (
                        <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
                            <Box flex="1" position="relative" minH="0" onClick={(e) => e.stopPropagation()}>
                                {imageSrc ? (
                                    <Box position="relative" w="100%" h="100%">
                                        {imageLoading && (
                                            <Center position="absolute" inset={0}><Spinner size="xl" color="gray.300"/></Center>
                                        )}
                                        <Image
                                            src={imageSrc}
                                            alt={product.name}
                                            fill
                                            priority
                                            placeholder="blur"
                                            blurDataURL={product.blurDataURL || undefined}
                                            style={{objectFit: "contain", objectPosition: "center"}}
                                            sizes="100vw"
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                        />

                                        {product.tags && product.tags.length > 0 && (
                                            <Flex
                                                position="absolute"
                                                top={{base: 4, md: 10}}
                                                left={{base: 4, md: 10}}
                                                direction="column"
                                                align="flex-start"
                                                gap={3}
                                                pointerEvents="none"
                                            >
                                                {product.tags.map((tag, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{opacity: 0, x: -30}}
                                                        animate={{opacity: 1, x: 0}}
                                                        transition={{delay: 0.3 + idx * 0.1, duration: 0.6, ease: "easeOut"}}
                                                    >
                                                        <Flex
                                                            align="center"
                                                            gap={3}
                                                            px={5}
                                                            py={2.5}
                                                            borderRadius="2xl"
                                                            bg="rgba(0, 0, 0, 0.7)"
                                                            backdropFilter="blur(20px)"
                                                            border="1px solid"
                                                            borderColor={`${tag.color}50`}
                                                            boxShadow={`0 10px 40px -10px ${tag.color}40`}
                                                        >
                                                            <Box w="10px" h="10px" borderRadius="full" bg={tag.color} boxShadow={`0 0 12px ${tag.color}`}/>
                                                            <Text
                                                                fontSize={{base: "11px", md: "14px"}}
                                                                fontWeight="900"
                                                                color="white"
                                                                textTransform="uppercase"
                                                                letterSpacing="0.08em"
                                                            >
                                                                {tag.text}
                                                            </Text>
                                                        </Flex>
                                                    </motion.div>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                ) : (
                                    <Center h="100%" bg="rgba(10, 10, 12, 0.9)">
                                        <Text color="whiteAlpha.400" fontSize="lg">Изображение отсутствует</Text>
                                    </Center>
                                )}
                            </Box>

                            <Box onClick={(e) => e.stopPropagation()}>
                                <ProductInfo name={product.name} description={product.description}/>
                            </Box>
                        </Flex>
                    )}
                </Flex>
            </motion.div>
        </Box>
    );
};
