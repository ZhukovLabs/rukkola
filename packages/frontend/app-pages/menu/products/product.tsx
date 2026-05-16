'use client';

import {
    Flex,
    Text,
    Heading,
    Button,
    Stack,
    Box,
    Center,
    Icon
} from "@chakra-ui/react";
import Image from "next/image";
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiImage } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { addToCart } from "@/lib/local-storage";
import { useIsLowPerformanceDevice } from "@/hooks/use-is-low-performance-device";
import { trackViewItem, trackAddToCart } from "@/lib/ecommerce-tracking";
import { useProductModal } from "../product-modal/use-product-modal";

const MotionFlex = motion.create(Flex);

type Price = { size: string; price: number };

export type ProductInnerProps = {
    index?: number;
    id: string;
    img: string | null;
    alt: string | null;
    title: string;
    description: string | null;
    prices: Price[] | null;
    blurDataURL?: string | null;
    tags?: { text: string; color: string }[] | null;
};

const DEFAULT_BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhSPQAIZwPB9++2WgAAAABJRU5ErkJggg==";

const ProductImage = memo(function ProductImage({
                                                    img,
                                                    alt,
                                                    blurDataURL,
                                                    onError,
                                                    priority
                                                }: {
    img: string;
    alt: string;
    blurDataURL?: string | null;
    onError: () => void;
    priority?: boolean;
}) {
    return (
        <Image
            src={img.includes('?') ? `${img}&w=450` : `${img}?w=450`}
            alt={alt}
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 60vw, 45vw"
            placeholder="blur"
            blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
            style={{ objectFit: "cover", objectPosition: "center" }}
            onError={onError}
            unoptimized
        />
    );
});

const PriceButton = memo(function PriceButton({
                                                  price,
                                                  selected,
                                                  onClick
                                              }: {
    price: Price;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            size="sm"
            borderRadius="full"
            px={{ base: 2, md: 4 }}
            py={{ base: 1, md: 2 }}
            fontSize={{ base: "xs", md: "sm" }}
            bg={selected ? "gray.500" : "gray.800"}
            color={selected ? "white" : "gray.300"}
            borderWidth="1px"
            borderColor="gray.500"
            _hover={{ bg: selected ? "gray.600" : "gray.700", color: "white" }}
            onClick={onClick}
        >
            {price.size} — {price.price.toFixed(2).replace(".", ",")} руб.
        </Button>
    );
});

export const Product = memo(function Product({
                                                 index,
                                                 id,
                                                 img,
                                                 alt,
                                                 title,
                                                 description,
                                                 prices,
                                                 blurDataURL,
                                                 tags
                                                 }: ProductInnerProps) {
                                                 const router = useRouter();
                                                 const searchParams = useSearchParams();
                                                 const { open: openProductModal } = useProductModal();
                                                 const [added, setAdded] = useState(false);

    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
    const [imgError, setImgError] = useState(false);

    const disableMotion = useIsLowPerformanceDevice();
    const firstPrice = prices?.[0] ?? null;
    const priority = typeof index === 'number' && index < 8;

    const handleAddClick = useCallback(() => {
        if (!prices?.length || !firstPrice) return;

        if (prices.length > 1) {
            setSelecting(true);
            setSelectedPrice(firstPrice);
        } else {
            addToCart({
                id,
                name: title,
                image: img ?? "",
                blurDataURL: blurDataURL ?? undefined,
                price: firstPrice.price,
                size: firstPrice.size
            });
            trackAddToCart({
                id: id,
                name: title,
                price: firstPrice.price,
                quantity: 1
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
        }
    }, [prices, firstPrice, id, title, img, blurDataURL]);

    const handleConfirm = useCallback(() => {
        if (!selectedPrice) return;

        addToCart({
            id,
            name: title,
            image: img ?? "",
            blurDataURL: blurDataURL ?? undefined,
            price: selectedPrice.price,
            size: selectedPrice.size
        });
        trackAddToCart({
            id: id,
            name: title,
            price: selectedPrice.price,
            quantity: 1
        });

        setAdded(true);
        setSelecting(false);
        setSelectedPrice(null);
        setTimeout(() => setAdded(false), 1200);
    }, [selectedPrice, id, title, img, blurDataURL]);

    const handleCancel = useCallback(() => {
        setSelecting(false);
        setSelectedPrice(null);
    }, []);

    const openModal = useCallback(() => {
        if (!img) return;
        openProductModal(id);
    }, [id, img, openProductModal]);

    const handleHover = useCallback(() => {
        if (img) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("product", id);
            router.prefetch(`?${params.toString()}`);
            fetch(`/api/menu/product/${id}`, { method: 'HEAD' }).catch(() => {});
        }
    }, [router, searchParams, id, img]);

    const Container = disableMotion ? Box : motion.article;

    return (
        <Container
            initial={disableMotion ? undefined : { opacity: 0, y: 24 }}
            animate={disableMotion ? undefined : { opacity: 1, y: 0 }}
            transition={disableMotion ? undefined : { duration: 0.4 }}
            style={{ display: "flex" }}
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                w="100%"
                borderWidth="1px"
                borderRadius={{ base: "md", md: "xl" }}
                borderColor="gray.700"
                bg="gray.800"
                overflow="hidden"
                _hover={{
                    borderColor: "gray.500",
                    boxShadow: "0 6px 18px rgba(128,128,128,0.15)"
                }}
            >
                {img && (
                    <Box
                        position="relative"
                        w={{ base: "100%", md: "45%" }}
                        aspectRatio={{ base: 3 / 2, md: undefined }}
                        flexShrink={0}
                        overflow="hidden"
                        cursor="zoom-in"
                        onClick={openModal}
                        onMouseEnter={handleHover}
                    >
                        {imgError ? (
                            <Center position="absolute" inset={0} bg="gray.700">
                                <Icon as={FiImage} boxSize={6} color="gray.400" />
                            </Center>
                        ) : (
                            <ProductImage
                                img={img}
                                alt={alt || title}
                                blurDataURL={blurDataURL}
                                onError={() => setImgError(true)}
                                priority={priority}
                            />
                        )}

                        <AnimatePresence>
                            {tags && tags.length > 0 && (
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    zIndex={10}
                                    pointerEvents="none"
                                    overflow="hidden"
                                    w="full"
                                    h="full"
                                >
                                    {tags.map((tag, idx) => (
                                        <Box
                                            key={idx}
                                            as={motion.div}
                                            initial={{ opacity: 0, x: { base: 100, md: -100 } }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ 
                                                delay: 0.2 + idx * 0.15,
                                                duration: 0.6,
                                                ease: [0.23, 1, 0.32, 1]
                                            } as any}
                                            position="absolute"
                                            top={`${16 + (idx * 32)}px`}
                                            left={{ base: 'auto', md: '-10px' }}
                                            right={{ base: '-10px', md: 'auto' }}
                                        >
                                            <Flex
                                                align="center"
                                                gap={3}
                                                pl={{ base: 8, md: 6 }}
                                                pr={{ base: 6, md: 8 }}
                                                py={1.5}
                                                bg={{
                                                    base: `linear-gradient(270deg, ${tag.color} 0%, ${tag.color}E6 70%, transparent 100%)`,
                                                    md: `linear-gradient(90deg, ${tag.color} 0%, ${tag.color}E6 70%, transparent 100%)`
                                                }}
                                                color="white"
                                                boxShadow={`4px 4px 15px rgba(0,0,0,0.3), 0 0 10px ${tag.color}40`}
                                                transform="none"
                                                style={{
                                                    clipPath: { 
                                                        base: 'polygon(8% 0%, 100% 0%, 100% 100%, 8% 100%)', 
                                                        md: 'polygon(0% 0%, 92% 100%, 92% 100%, 0% 100%)' // Fallback for safety, actual is below
                                                    },
                                                } as any}
                                                // Using sx for complex responsive clipPath to ensure accuracy
                                                sx={{
                                                    clipPath: {
                                                        base: 'polygon(8% 0%, 100% 0%, 100% 100%, 8% 100%)',
                                                        md: 'polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%)'
                                                    }
                                                }}
                                                borderLeft={{ base: "none", md: "4px solid" }}
                                                borderRight={{ base: "4px solid", md: "none" }}
                                                borderColor="whiteAlpha.600"
                                            >
                                                <Box 
                                                    w="6px" 
                                                    h="6px" 
                                                    borderRadius="full" 
                                                    bg="white" 
                                                    boxShadow="0 0 8px white"
                                                />
                                                <Text
                                                    fontSize="9px"
                                                    fontWeight="900"
                                                    textTransform="uppercase"
                                                    letterSpacing="0.15em"
                                                    lineHeight="1"
                                                    textShadow="0 1px 3px rgba(0,0,0,0.3)"
                                                >
                                                    {tag.text}
                                                </Text>
                                            </Flex>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </AnimatePresence>
                    </Box>
                )}

                <Flex direction="column" flex="1" p={{ base: 3, md: 6 }}>
                    <Stack gap={{ base: 1, md: 4 }}>
                        <Heading
                            as="h3"
                            fontSize={{ base: "md", md: "xl" }}
                            color="whiteAlpha.900"
                            overflowWrap="break-word"
                            wordBreak="break-word"
                            hyphens="auto"
                        >
                            {title}
                        </Heading>

                        {description && (
                            <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color="gray.400"
                                lineClamp={{base: 2, sm: 3, md: 4}}
                                mb={{base: 2, md: 3}}
                            >
                                {description}
                            </Text>
                        )}
                    </Stack>

                    <Flex direction="column" mt="auto" gap={{ base: 2, md: 3 }}>
                        {!selecting && prices?.map(p => (
                            <Flex key={p.size} justify="space-between" align="center">
                                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400">
                                    {p.size}
                                </Text>
                                <Text fontSize={{ base: "sm", md: "md" }} color="gray.300">
                                    {p.price.toFixed(2).replace(".", ",")} руб.
                                </Text>
                            </Flex>
                        ))}

                        {selecting && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Flex gap={1} direction="column" mb={{base: 2, md: 3}}>
                                        {prices?.map(p => (
                                            <PriceButton
                                                key={p.size}
                                                price={p}
                                                selected={selectedPrice?.size === p.size}
                                                onClick={() => setSelectedPrice(p)}
                                            />
                                        ))}
                                    </Flex>

                                    <Flex justify="space-between" mt={2}>
                                        <Button
                                            size="sm"
                                            fontSize="xs"
                                            bg="red.500"
                                            onClick={handleCancel}
                                            px={2}
                                            borderRadius="full"
                                        >
                                            Отменить
                                        </Button>
                                        <Button
                                            size="sm"
                                            fontSize="xs"
                                            bg="gray.500"
                                            onClick={handleConfirm}
                                            px={2}
                                            borderRadius="full"
                                        >
                                            Подтвердить
                                        </Button>
                                    </Flex>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {!selecting && (
                            <Button
                                size="sm"
                                fontSize="xs"
                                borderRadius="full"
                                borderWidth="1px"
                                borderColor="gray.500"
                                bg={added ? "gray.500" : "gray.800"}
                                color={added ? "white" : "gray.300"}
                                onClick={handleAddClick}
                            >
                                {added ? (
                                    <Flex align="center" gap={1}>
                                        <FiCheck size={14} /> Добавлено
                                    </Flex>
                                ) : (
                                    "Добавить"
                                )}
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </Container>
    );
});
