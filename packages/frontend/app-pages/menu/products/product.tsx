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
import {memo, useState, useCallback} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {FiCheck, FiImage} from "react-icons/fi";
import {useRouter, useSearchParams} from "next/navigation";
import {addToCart} from "@/lib/local-storage";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";
import {trackAddToCart} from "@/lib/ecommerce-tracking";
import {useProductModal} from "../product-modal/use-product-modal";

const MotionArticle = motion.article;

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

const DEFAULT_BLUR_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhSPQAIZwPB9++2WgAAAABJRU5ErkJggg==";

const solidGradient = (color: string) =>
    `linear-gradient(135deg, ${color} 0%, ${color}dd 55%, ${color}aa 100%)`;

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
            style={{objectFit: "cover", objectPosition: "center"}}
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
            px={{base: 2, md: 4}}
            py={{base: 1, md: 2}}
            fontSize={{base: "xs", md: "sm"}}
            bg={selected ? "gray.500" : "gray.800"}
            color={selected ? "white" : "gray.300"}
            borderWidth="1px"
            borderColor="gray.500"
            _hover={{bg: selected ? "gray.600" : "gray.700", color: "white"}}
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
    const {open: openProductModal} = useProductModal();

    const [added, setAdded] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
    const [imgError, setImgError] = useState(false);

    const disableMotion = useIsLowPerformanceDevice();
    const firstPrice = prices?.[0] ?? null;
    const priority = typeof index === "number" && index < 8;

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
                id,
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
            id,
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
        if (!img) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("product", id);

        router.prefetch(`?${params.toString()}`);
        fetch(`/api/menu/product/${id}`, {method: "HEAD"}).catch(() => {
        });
    }, [router, searchParams, id, img]);

    const Container = disableMotion ? Box : MotionArticle;

    return (
        <Container
            initial={disableMotion ? undefined : {opacity: 0, y: 24}}
            animate={disableMotion ? undefined : {opacity: 1, y: 0}}
            transition={disableMotion ? undefined : {duration: 0.4}}
            style={{display: "flex"}}
        >
            <Flex
                direction={{base: "column", md: "row"}}
                w="100%"
                borderWidth="1px"
                borderRadius={{base: "md", md: "xl"}}
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
                        w={{base: "100%", md: "45%"}}
                        aspectRatio={{base: 3 / 2}}
                        flexShrink={0}
                        overflow="hidden"
                        cursor="zoom-in"
                        onClick={openModal}
                        onMouseEnter={handleHover}
                    >
                        {imgError ? (
                            <Center position="absolute" inset={0} bg="gray.700">
                                <Icon as={FiImage} boxSize={6} color="gray.400"/>
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

                        {tags?.length ? (
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                w="full"
                                h="full"
                                pointerEvents="none"
                            >
                                {tags.map((tag, idx) => (
                                    <Box
                                        key={idx}
                                        position="absolute"
                                        top={`${12 + idx * 36}px`}
                                        right={{base: "-6px", md: "auto"}}
                                        left={{base: "auto", md: "-8px"}}
                                        zIndex={10}
                                    >
                                        <Flex
                                            align="center"
                                            px={4.5}
                                            py={1.5}
                                            bg={solidGradient(tag.color)}
                                            borderRadius="md"
                                            boxShadow="0 8px 20px rgba(0,0,0,0.4)"
                                            position="relative"
                                            overflow="hidden"
                                            transform={{
                                                base: "skew(12deg)",
                                                md: "skew(-12deg)"
                                            }}
                                            border="1px solid rgba(255,255,255,0.3)"
                                        >
                                            <Box
                                                position="absolute"
                                                top="0"
                                                left={{base: "auto", md: "-14px"}}
                                                right={{base: "-14px", md: "auto"}}
                                                w="18px"
                                                h="full"
                                                bg={tag.color}
                                                transform={{
                                                    base: "skew(-25deg)",
                                                    md: "skew(25deg)"
                                                }}
                                                zIndex={-1}
                                            />

                                            <Text
                                                fontSize="10px"
                                                fontWeight="700"
                                                letterSpacing="0.1em"
                                                textTransform="uppercase"
                                                color="white"
                                                textShadow="0 1px 3px rgba(0,0,0,0.6)"
                                                zIndex={2}
                                                transform={{
                                                    base: "skew(-12deg)",
                                                    md: "skew(12deg)"
                                                }}
                                            >
                                                {tag.text}
                                            </Text>
                                        </Flex>
                                    </Box>
                                ))}
                            </Box>
                        ) : null}
                    </Box>
                )}

                <Flex direction="column" flex="1" p={{base: 3, md: 6}}>
                    <Stack>
                        <Heading
                            fontSize={{base: "md", md: "xl"}}
                            color="whiteAlpha.900"
                        >
                            {title}
                        </Heading>

                        {description && (
                            <Text
                                fontSize={{base: "xs", md: "sm"}}
                                color="gray.400"
                                lineClamp={{base: 2, md: 4}}
                            >
                                {description}
                            </Text>
                        )}
                    </Stack>

                    <Flex direction="column" mt="auto" gap={3}>
                        {!selecting &&
                            prices?.map(p => (
                                <Flex key={p.size} justify="space-between">
                                    <Text fontSize="sm" color="gray.400">
                                        {p.size}
                                    </Text>
                                    <Text fontSize="sm" color="gray.300">
                                        {p.price.toFixed(2).replace(".", ",")} руб.
                                    </Text>
                                </Flex>
                            ))}

                        {selecting && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                >
                                    <Flex direction="column" gap={2}>
                                        {prices?.map(p => (
                                            <PriceButton
                                                key={p.size}
                                                price={p}
                                                selected={selectedPrice?.size === p.size}
                                                onClick={() => setSelectedPrice(p)}
                                            />
                                        ))}
                                    </Flex>

                                    <Flex justify="space-between" mt={3}>
                                        <Button size="sm" onClick={handleCancel} bg="red.500">
                                            Отмена
                                        </Button>
                                        <Button size="sm" onClick={handleConfirm} bg="gray.500">
                                            OK
                                        </Button>
                                    </Flex>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {!selecting && (
                            <Button
                                size="sm"
                                borderRadius="full"
                                borderWidth="1px"
                                borderColor="gray.500"
                                onClick={handleAddClick}
                                bg={added ? "gray.500" : "gray.800"}
                            >
                                {added ? (
                                    <Flex align="center" gap={1}>
                                        <FiCheck/> Добавлено
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