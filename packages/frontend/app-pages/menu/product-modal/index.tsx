'use client';

import {
    Box,
    Flex,
    Text,
    Heading,
    IconButton,
    Spinner,
    Center,
} from "@chakra-ui/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { getProductById } from "./actions";

type Product = {
    id: string;
    image: string | null;
    name: string;
    description: string | null;
};

const productCache = new Map<string, Product>();
const cacheTimeout = 5 * 60 * 1000;
const cacheTimestamp = new Map<string, number>();

export const ProductModal = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get("product");
    const prevProductIdRef = useRef<string | null>(null);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchProduct = useCallback(async () => {
        if (!productId) {
            setProduct(null);
            return;
        }

        const now = Date.now();
        const cached = productCache.get(productId);
        const cachedTime = cacheTimestamp.get(productId);

        if (cached && cachedTime && now - cachedTime < cacheTimeout) {
            setProduct(cached);
            return;
        }

        setLoading(true);
        setError(false);

        try {
            const data = await getProductById(productId);
            if (data) {
                productCache.set(productId, data);
                cacheTimestamp.set(productId, now);
            }
            setProduct(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId === prevProductIdRef.current) return;
        prevProductIdRef.current = productId;
        
        if (productId) {
            setIsModalVisible(true);
        }
        
        fetchProduct();
    }, [fetchProduct, productId]);

    useEffect(() => {
        if (!productId && isModalVisible) {
            setIsModalVisible(false);
        }
    }, [productId, isModalVisible]);

    useEffect(() => {
        if (isModalVisible) {
            const originalStyle = document.body.style.cssText;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${window.scrollY}px`;
            
            return () => {
                const scrollY = parseInt(document.body.style.top || '0', 10);
                document.body.style.cssText = originalStyle;
                window.scrollTo(0, -scrollY);
            };
        }
    }, [isModalVisible]);

    const closeModal = useCallback(() => {
        const current = new URLSearchParams(searchParams.toString());
        current.delete("product");

        router.replace(`${window.location.pathname}?${current.toString()}`, { scroll: false });
    }, [router, searchParams]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [closeModal]);

    if (!productId && !isModalVisible) return null;

    return (
        <Box
            position="fixed"
            inset={0}
            bg="black"
            zIndex={9999}
            overflow="hidden"
            onClick={closeModal}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: "100%", height: "100%" }}
            >
                <Flex h="100%" direction="column" position="relative">
                    <IconButton
                        aria-label="Закрыть"
                        position="absolute"
                        top={{ base: 2, md: 4 }}
                        right={{ base: 2, md: 4 }}
                        zIndex={20}
                        size="lg"
                        borderRadius="full"
                        bg="blackAlpha.800"
                        color="white"
                        _hover={{ bg: "blackAlpha.900" }}
                        onClick={(e) => { e.stopPropagation(); closeModal(); }}
                    >
                        <FiX size={28} />
                    </IconButton>

                    {loading && (
                        <Center flex="1">
                            <Spinner size="xl" color="teal.300" />
                        </Center>
                    )}

                    {error && (
                        <Center flex="1" flexDirection="column" color="white" px={6}>
                            <Text fontSize="xl" fontWeight="bold" mb={2}>
                                Ошибка загрузки
                            </Text>
                            <Text fontSize="sm" color="gray.400">
                                Попробуйте позже
                            </Text>
                        </Center>
                    )}

                    {product && !loading && !error && (
                        <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
                            <Box flex="1" position="relative" minH="0" onClick={(e) => e.stopPropagation()}>
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        priority
                                        style={{ objectFit: "contain", objectPosition: "center" }}
                                        sizes="100vw"
                                    />
                                ) : (
                                    <Center h="100%" bg="gray.900">
                                        <Text color="gray.500" fontSize="lg">
                                            Изображение отсутствует
                                        </Text>
                                    </Center>
                                )}
                            </Box>

                            {product.description && (
                                <Box
                                    bg="blackAlpha.900"
                                    backdropFilter="blur(12px)"
                                    borderTop="1px solid rgba(255,255,255,0.12)"
                                    p={{ base: 4, md: 6 }}
                                    maxH="40vh"
                                    overflowY="auto"
                                    css={{
                                        "&::-webkit-scrollbar": { width: "6px" },
                                        "&::-webkit-scrollbar-track": { bg: "transparent" },
                                        "&::-webkit-scrollbar-thumb": { bg: "rgba(255,255,255,0.2)", borderRadius: "3px" },
                                        "&::-webkit-scrollbar-thumb:hover": { bg: "rgba(255,255,255,0.3)" },
                                    }}
                                >
                                    <Box maxW="900px" mx="auto">
                                        <Heading
                                            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                                            fontWeight="bold"
                                            color="white"
                                            mb={3}
                                            letterSpacing="tight"
                                        >
                                            {product.name}
                                        </Heading>
                                        <Text
                                            fontSize={{ base: "sm", md: "md" }}
                                            color="gray.100"
                                            lineHeight="tall"
                                            whiteSpace="pre-wrap"
                                        >
                                            {product.description}
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                        </Flex>
                    )}
                </Flex>
            </motion.div>
        </Box>
    );
};
