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
import { FiX } from "react-icons/fi";
import { useEffect, useState, useCallback, useRef } from "react";
import { getProductById } from "./actions";
import { trackViewItem } from "@/lib/ecommerce-tracking";
import { useProductModal } from "./use-product-modal";

type Product = {
    id: string;
    image: string | null;
    blurDataURL: string | null;
    name: string;
    description: string | null;
    tags?: { text: string; color: string }[] | null;
};

const productCache = new Map<string, Product>();
const cacheTimeout = 5 * 60 * 1000;
const cacheTimestamp = new Map<string, number>();

export const ProductModal = () => {
    const { productId, close: closeModalState } = useProductModal();

    const prevProductIdRef = useRef<string | null>(null);
    const scrollYRef = useRef(0);
    const closeLockRef = useRef(false);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const restoreBodyAndScroll = useCallback(() => {
        const html = document.documentElement;
        const body = document.body;

        const prevHtmlScrollBehavior = html.style.scrollBehavior;
        const prevBodyScrollBehavior = body.style.scrollBehavior;

        html.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";

        body.style.overflow = "";
        body.style.position = "";
        body.style.width = "";
        body.style.top = "";

        window.scrollTo(0, scrollYRef.current);

        html.style.scrollBehavior = prevHtmlScrollBehavior;
        body.style.scrollBehavior = prevBodyScrollBehavior;
    }, []);

    const closeModal = useCallback(() => {
        if (closeLockRef.current) return;
        closeLockRef.current = true;

        restoreBodyAndScroll();

        setIsModalVisible(false);
        setProduct(null);
        setLoading(false);
        setImageLoading(false);
        setError(false);

        closeModalState();

        window.setTimeout(() => {
            closeLockRef.current = false;
        }, 0);
    }, [closeModalState, restoreBodyAndScroll]);

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
            setLoading(false);
            setError(false);
            setImageLoading(true);
            return;
        }

        setLoading(true);
        setError(false);
        setImageLoading(true);

        try {
            const data = await getProductById(productId);

            if (!data) {
                closeModal();
                return;
            }

            productCache.set(productId, data);
            cacheTimestamp.set(productId, now);
            setProduct(data);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [closeModal, productId]);

    useEffect(() => {
        if (productId === prevProductIdRef.current) return;
        prevProductIdRef.current = productId;

        if (productId) {
            setIsModalVisible(true);
            setImageLoading(true);
            fetchProduct();
            return;
        }

        setIsModalVisible(false);
        setProduct(null);
        setLoading(false);
        setImageLoading(false);
        setError(false);
    }, [fetchProduct, productId]);

    useEffect(() => {
        if (product && productId) {
            trackViewItem({
                id: productId,
                name: product.name,
                price: 0,
            });
        }
    }, [product, productId]);

    useEffect(() => {
        if (!isModalVisible) return;

        scrollYRef.current = window.scrollY;

        const body = document.body;
        const html = document.documentElement;

        const originalBodyOverflow = body.style.overflow;
        const originalBodyPosition = body.style.position;
        const originalBodyWidth = body.style.width;
        const originalBodyTop = body.style.top;
        const originalHtmlScrollBehavior = html.style.scrollBehavior;
        const originalBodyScrollBehavior = body.style.scrollBehavior;

        html.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";

        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.width = "100%";
        body.style.top = `-${scrollYRef.current}px`;

        return () => {
            body.style.overflow = originalBodyOverflow;
            body.style.position = originalBodyPosition;
            body.style.width = originalBodyWidth;
            body.style.top = originalBodyTop;
            html.style.scrollBehavior = originalHtmlScrollBehavior;
            body.style.scrollBehavior = originalBodyScrollBehavior;
        };
    }, [isModalVisible]);

    const handleClose = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        closeModal();
    }, [closeModal]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [handleClose]);

    if (!productId && !isModalVisible) return null;

    return (
        <Box
            position="fixed"
            inset={0}
            bg="black"
            zIndex={9999}
            overflow="hidden"
            onClick={handleClose}
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
                        top={{ base: 4, md: 6 }}
                        right={{ base: 4, md: 6 }}
                        zIndex={20}
                        size="lg"
                        borderRadius="full"
                        bg="whiteAlpha.200"
                        backdropFilter="blur(10px)"
                        color="white"
                        border="1px solid rgba(255,255,255,0.2)"
                        boxShadow="0 4px 12px rgba(0,0,0,0.5)"
                        _hover={{
                            bg: "whiteAlpha.300",
                            transform: "scale(1.1)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
                        }}
                        _active={{ bg: "whiteAlpha.400" }}
                        transition="all 0.2s"
                        onClick={handleClose}
                    >
                        <FiX size={32} />
                    </IconButton>

                    {loading && (
                        <Center flex="1">
                            <Spinner size="xl" color="gray.300" />
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
                            <Box
                                flex="1"
                                position="relative"
                                minH="0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {product.image ? (
                                    <Box position="relative" w="100%" h="100%">
                                        {imageLoading && (
                                            <Center position="absolute" inset={0}>
                                                <Spinner size="xl" color="gray.300" />
                                            </Center>
                                        )}
                                        <Image
                                            src={
                                                product.image.includes("?")
                                                    ? `${product.image}&w=1920`
                                                    : `${product.image}?w=1920`
                                            }
                                            alt={product.name}
                                            fill
                                            priority
                                            placeholder="blur"
                                            blurDataURL={product.blurDataURL || undefined}
                                            style={{
                                                objectFit: "contain",
                                                objectPosition: "center",
                                            }}
                                            sizes="100vw"
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                        />

                                        {product.tags && product.tags.length > 0 && (
                                            <Flex
                                                position="absolute"
                                                top={{ base: 4, md: 10 }}
                                                left={{ base: 4, md: 10 }}
                                                direction="column"
                                                align="flex-start"
                                                gap={3}
                                                pointerEvents="none"
                                            >
                                                {product.tags.map((tag, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.3 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
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
                                                            <Box 
                                                                w="10px" 
                                                                h="10px" 
                                                                borderRadius="full" 
                                                                bg={tag.color} 
                                                                boxShadow={`0 0 12px ${tag.color}`}
                                                            />
                                                            <Text
                                                                fontSize={{ base: "11px", md: "14px" }}
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
                                        <Text color="whiteAlpha.400" fontSize="lg">
                                            Изображение отсутствует
                                        </Text>
                                    </Center>
                                )}
                            </Box>

                            <Box
                                bg="rgba(15, 15, 18, 0.7)"
                                backdropFilter="blur(30px)"
                                borderTop="1px solid rgba(255,255,255,0.08)"
                                p={{ base: 6, md: 10 }}
                                maxH="45vh"
                                overflowY="auto"
                                onClick={(e) => e.stopPropagation()}
                                css={{
                                    "&::-webkit-scrollbar": { width: "4px" },
                                    "&::-webkit-scrollbar-track": { bg: "transparent" },
                                    "&::-webkit-scrollbar-thumb": {
                                        bg: "rgba(255,255,255,0.15)",
                                        borderRadius: "10px",
                                    },
                                }}
                            >
                                <Box maxW="1000px" mx="auto">
                                    <Heading
                                        fontSize={{ base: "2xl", md: "4xl" }}
                                        fontWeight="800"
                                        color="white"
                                        mb={product.description ? 6 : 0}
                                        letterSpacing="-0.03em"
                                        lineHeight="1.1"
                                    >
                                        {product.name}
                                    </Heading>

                                    {product.description && (
                                        <Text
                                            fontSize={{ base: "md", md: "lg" }}
                                            color="whiteAlpha.700"
                                            lineHeight="1.8"
                                            whiteSpace="pre-wrap"
                                            fontWeight="450"
                                        >
                                            {product.description}
                                        </Text>
                                    )}
                                </Box>
                            </Box>
                        </Flex>
                    )}
                </Flex>
            </motion.div>
        </Box>
    );
};