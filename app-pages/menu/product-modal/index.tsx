"use client";
import { Box, Flex, Text, Heading, IconButton, Spinner, Center } from "@chakra-ui/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { getProductById } from "./actions";

type Product = {
    id: string;
    image: string | null;
    name: string;
    description: string | null;
};

export const ProductModal = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get("product");

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!productId) {
            setProduct(null);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError(false);

        getProductById(productId)
            .then((data) => {
                if (isMounted) {
                    setProduct(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [productId]);

    const closeModal = () => {
        const current = new URLSearchParams(searchParams.toString());
        current.delete("product");

        router.replace(`${window.location.pathname}?${current.toString()}`, {
            scroll: false,
        });
    };

    // Закрытие по Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    if (!productId) return null;

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            closeModal();
                        }}
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
                                        style={{
                                            objectFit: "contain",
                                            objectPosition: "center",
                                        }}
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

                            {/* ОПИСАНИЕ — ОТДЕЛЬНАЯ ПАНЕЛЬ */}
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
                                        "&::-webkit-scrollbar-thumb": {
                                            bg: "rgba(255,255,255,0.2)",
                                            borderRadius: "3px",
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            bg: "rgba(255,255,255,0.3)",
                                        },
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