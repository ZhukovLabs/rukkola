'use client';

import {Box, Flex, Text, IconButton, Spinner, Center} from "@chakra-ui/react";
import Image from "next/image";
import {motion, AnimatePresence} from "framer-motion";
import {FiX} from "react-icons/fi";
import {useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {getProductById} from "./actions";
import {trackViewItem} from "@/lib/ecommerce-tracking";
import {useProductModal} from "./use-product-modal";
import {ProductInfo} from "./product-info";
import {useBodyScrollLock} from "@/hooks/use-body-scroll-lock";

export const ProductModal = () => {
    const {productId, close: closeModalState} = useProductModal();
    const [imageLoading, setImageLoading] = useState(false);

    useBodyScrollLock(!!productId);

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
            setImageLoading(true);
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
        <AnimatePresence>
            {productId && (
                <Box
                    position="fixed"
                    inset={0}
                    bg="#050505"
                    zIndex={9999}
                    onClick={handleBackdropClick}
                >
                    {/* Atmospheric Blurred Background */}
                    <Box position="absolute" inset={0} overflow="hidden" opacity={0.4}>
                        {imageSrc && (
                            <Image
                                src={imageSrc}
                                alt=""
                                fill
                                style={{objectFit: "cover", filter: "blur(80px)", transform: "scale(1.1)"}}
                                aria-hidden="true"
                            />
                        )}
                    </Box>

                    <motion.div
                        initial={{opacity: 0, scale: 0.98}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.98}}
                        transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0"
                        }}
                    >
                        <Flex
                            direction={{base: "column", md: "row"}}
                            w={{base: "100%", md: "92%", lg: "85%"}}
                            maxW="1600px"
                            h={{base: "100%", md: "85vh"}}
                            bg="rgba(10, 10, 12, 0.8)"
                            backdropFilter="blur(40px)"
                            borderRadius={{base: 0, md: "2xl"}}
                            position="relative"
                            overflow="hidden"
                            boxShadow="0 40px 100px -20px rgba(0,0,0,0.8)"
                            border="1px solid rgba(255,255,255,0.05)"
                        >
                            <IconButton
                                aria-label="Закрыть"
                                position="absolute"
                                top={{base: 4, md: 8}}
                                right={{base: 4, md: 8}}
                                zIndex={30}
                                size="lg"
                                variant="ghost"
                                color="whiteAlpha.600"
                                borderRadius="full"
                                _hover={{color: "white", bg: "whiteAlpha.100", transform: "rotate(90deg)"}}
                                transition="all 0.3s"
                                onClick={close}
                            >
                                <FiX size={32}/>
                            </IconButton>

                            {loading && (
                                <Center flex="1"><Spinner size="xl" color="whiteAlpha.300"/></Center>
                            )}

                            {error && (
                                <Center flex="1" flexDirection="column" color="white">
                                    <Text fontSize="2xl" fontWeight="200" mb={4}>Не удалось загрузить блюдо</Text>
                                    <Text fontSize="sm" color="whiteAlpha.400" cursor="pointer" onClick={close}>Вернуться в меню</Text>
                                </Center>
                            )}

                            {product && !loading && !error && (
                                <>
                                    <Box
                                        flex={{base: "none", md: "1"}}
                                        h={{base: "75vh", md: "100%"}}
                                        position="relative"
                                        onClick={(e) => e.stopPropagation()}
                                        overflow="hidden"
                                    >
                                        {imageLoading && (
                                            <Center position="absolute" inset={0} zIndex={10} bg="rgba(10,10,12,0.4)" backdropFilter="blur(10px)">
                                                <Spinner size="xl" color="whiteAlpha.400"/>
                                            </Center>
                                        )}
                                        <motion.div
                                            initial={{scale: 1.05}}
                                            animate={{scale: 1}}
                                            transition={{duration: 1.5, ease: "easeOut"}}
                                            style={{width: "100%", height: "100%"}}
                                        >
                                            {imageSrc ? (
                                                <Image
                                                    src={imageSrc}
                                                    alt={product.name}
                                                    fill
                                                    priority
                                                    placeholder="blur"
                                                    blurDataURL={product.blurDataURL || undefined}
                                                    style={{objectFit: "cover", objectPosition: "center"}}
                                                    onLoad={() => setImageLoading(false)}
                                                    onError={() => setImageLoading(false)}
                                                />
                                            ) : (
                                                <Center h="100%" bg="whiteAlpha.50">
                                                    <Text color="whiteAlpha.200" fontSize="sm" textTransform="uppercase" letterSpacing="widest">No Image</Text>
                                                </Center>
                                            )}
                                        </motion.div>
                                        {/* Mobile Shadow Overlay */}
                                        <Box
                                            display={{base: "block", md: "none"}}
                                            position="absolute"
                                            inset={0}
                                            bgGradient="linear(to-t, #0A0A0C 0%, transparent 40%)"
                                        />
                                    </Box>

                                    <Box
                                        flex={{base: "1", md: "1"}}
                                        position="relative"
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent={{base: "flex-start", md: "center"}}
                                        bg={{base: "#0A0A0C", md: "transparent"}}
                                        onClick={(e) => e.stopPropagation()}
                                        overflowY="auto"
                                        px={{base: 5, md: 12, lg: 20}}
                                        py={{base: 5, md: 12}}
                                    >
                                        <motion.div
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{delay: 0.2, duration: 0.8}}
                                        >
                                            <ProductInfo
                                                name={product.name}
                                                description={product.description}
                                                tags={product.tags}
                                            />
                                        </motion.div>
                                    </Box>
                                </>
                            )}
                        </Flex>
                    </motion.div>
                </Box>
            )}
        </AnimatePresence>
    );
};
