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

type Price = { size: string; price: number };

export type ProductInnerProps = {
    id: string;
    img: string | null;
    alt: string | null;
    title: string;
    description: string | null;
    prices: Price[] | null;
};

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhSPQAIZwPB9++2WgAAAABJRU5ErkJggg==";

const ProductImage = memo(function ProductImage({
                                                    img,
                                                    alt,
                                                    onError
                                                }: {
    img: string;
    alt: string;
    onError: () => void;
}) {
    return (
        <Image
            src={img.includes('?') ? `${img}&w=300` : `${img}?w=300`}
            alt={alt}
            fill
            loading="lazy"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 60vw, 45vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
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
                                                 id,
                                                 img,
                                                 alt,
                                                 title,
                                                 description,
                                                 prices
                                             }: ProductInnerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [added, setAdded] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
    const [imgError, setImgError] = useState(false);

    const disableMotion = useIsLowPerformanceDevice();
    const firstPrice = prices?.[0] ?? null;

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
                price: firstPrice.price,
                size: firstPrice.size
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
        }
    }, [prices, firstPrice, id, title, img]);

    const handleConfirm = useCallback(() => {
        if (!selectedPrice) return;

        addToCart({
            id,
            name: title,
            image: img ?? "",
            price: selectedPrice.price,
            size: selectedPrice.size
        });

        setAdded(true);
        setSelecting(false);
        setSelectedPrice(null);
        setTimeout(() => setAdded(false), 1200);
    }, [selectedPrice, id, title, img]);

    const handleCancel = useCallback(() => {
        setSelecting(false);
        setSelectedPrice(null);
    }, []);

    const openModal = useCallback(() => {
        if (!img) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("product", id);
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams, id, img]);

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
                                onError={() => setImgError(true)}
                            />
                        )}
                    </Box>
                )}

                <Flex direction="column" flex="1" p={{ base: 3, md: 6 }}>
                    <Stack gap={{ base: 1, md: 4 }}>
                        <Heading
                            as="h3"
                            fontSize={{ base: "md", md: "xl" }}
                            lineClamp={2}
                            color="whiteAlpha.900"
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
                                        >
                                            Отменить
                                        </Button>
                                        <Button
                                            size="sm"
                                            fontSize="xs"
                                            bg="gray.500"
                                            onClick={handleConfirm}
                                            px={2}
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
