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
import {memo, useState, useCallback, useMemo} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {FiCheck, FiImage} from "react-icons/fi";
import {useRouter} from "next/navigation";
import {addToCart} from "@/lib/local-storage";
import {useInView} from "react-intersection-observer";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";

type Price = { size: string; price: number };

export type ProductInnerProps = {
    id: string;
    img: string | null;
    alt: string | null;
    title: string;
    description: string | null;
    prices: Price[] | null;
};

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
            src={img}
            alt={alt}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 45vw"
            style={{objectFit: "cover", objectPosition: "center"}}
            onError={onError}
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
            px={5}
            py={2}
            bg={selected ? "teal.500" : "gray.800"}
            color={selected ? "white" : "teal.300"}
            borderWidth="1px"
            borderColor="teal.500"
            _hover={{bg: selected ? "teal.600" : "gray.700", color: "white"}}
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
    const [added, setAdded] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
    const [imgError, setImgError] = useState(false);

    const disableMotion = useIsLowPerformanceDevice();
    const firstPrice = prices?.[0] ?? null;

    const {ref, inView} = useInView({triggerOnce: true});

    const handleAddClick = useCallback(() => {
        if (!prices?.length) return;

        if (prices.length > 1) {
            setSelecting(true);
            setSelectedPrice(firstPrice);
        } else {
            addToCart({
                id,
                name: title,
                image: img ?? "",
                price: firstPrice!.price,
                size: firstPrice!.size
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

    const openModal = useCallback(
        () => img && router.push(`?product=${id}`, {scroll: false}),
        [router, id, img]
    );

    /* —————— PRICE LISTS —————— */
    const priceButtons = useMemo(
        () =>
            prices?.map(p => (
                <PriceButton
                    key={p.size}
                    price={p}
                    selected={selectedPrice?.size === p.size}
                    onClick={() => setSelectedPrice(p)}
                />
            )),
        [prices, selectedPrice]
    );

    const staticPriceList = useMemo(
        () =>
            prices?.map(p => (
                <Flex key={p.size} justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.400">
                        {p.size}
                    </Text>
                    <Text fontSize="md" fontWeight="semibold" color="teal.300">
                        {p.price.toFixed(2).replace(".", ",")} руб.
                    </Text>
                </Flex>
            )),
        [prices]
    );

    const containerMotion = !disableMotion
        ? {
            initial: {opacity: 0, y: 40},
            animate: inView ? {opacity: 1, y: 0} : {},
            transition: {duration: 0.45}
        }
        : {};

    return (
        <motion.div
            ref={ref}
            style={{display: "flex"}}
            {...containerMotion}
        >
            <Flex
                position="relative"
                direction={{base: "column", md: "row"}}
                align="stretch"
                overflow="hidden"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.700"
                bg="gray.800"
                w="100%"
                _hover={{
                    borderColor: "teal.500",
                    boxShadow: "0 8px 20px rgba(56,178,172,0.15)"
                }}
            >
                {img && (
                    <Box
                        position="relative"
                        w={{base: "100%", md: "45%"}}
                        h={{base: "200px", md: "100%"}}
                        flexShrink={0}
                        overflow="hidden"
                        cursor="zoom-in"
                        onClick={openModal}
                    >
                        {imgError ? (
                            <Center position="absolute" inset={0} bg="gray.700">
                                <Icon as={FiImage} boxSize={8} color="gray.400"/>
                            </Center>
                        ) : (
                            <ProductImage
                                img={img}
                                alt={alt ?? ""}
                                onError={() => setImgError(true)}
                            />
                        )}
                    </Box>
                )}

                <Flex direction="column" flex="1" p={{base: 5, md: 6}}>
                    <Stack>
                        <Heading
                            fontSize="xl"
                            color="whiteAlpha.900"
                            fontWeight="semibold"
                        >
                            {title}
                        </Heading>

                        {description && (
                            <Text fontSize="sm" color="gray.400" lineHeight="taller">
                                {description}
                            </Text>
                        )}
                    </Stack>

                    <Flex direction="column" mt="auto" gap={3} minH="100px">
                        {!disableMotion ? (
                            <AnimatePresence mode="popLayout">
                                {selecting ? (
                                    <motion.div
                                        key="select"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    >
                                        <Flex direction="column" gap={2}>
                                            {priceButtons}
                                            <Flex justify="space-between" mt={2}>
                                                <Button
                                                    size="sm"
                                                    borderRadius="full"
                                                    bg="red.500"
                                                    color="white"
                                                    onClick={handleCancel}
                                                >
                                                    Отменить
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    borderRadius="full"
                                                    bg="teal.500"
                                                    color="white"
                                                    onClick={handleConfirm}
                                                >
                                                    Подтвердить
                                                </Button>
                                            </Flex>
                                        </Flex>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="static-prices"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    >
                                        {staticPriceList}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        ) : (
                            // no-motion fallback
                            <>
                                {selecting ? (
                                    <Flex direction="column" gap={2}>
                                        {priceButtons}
                                        <Flex justify="space-between" mt={2}>
                                            <Button
                                                size="sm"
                                                borderRadius="full"
                                                bg="red.500"
                                                color="white"
                                                onClick={handleCancel}
                                            >
                                                Отменить
                                            </Button>
                                            <Button
                                                size="sm"
                                                borderRadius="full"
                                                bg="teal.500"
                                                color="white"
                                                onClick={handleConfirm}
                                            >
                                                Подтвердить
                                            </Button>
                                        </Flex>
                                    </Flex>
                                ) : (
                                    staticPriceList
                                )}
                            </>
                        )}

                        {!selecting && (
                            <Button
                                mt={3}
                                size="sm"
                                borderRadius="full"
                                px={5}
                                py={2}
                                bg={added ? "teal.500" : "gray.800"}
                                color={added ? "white" : "teal.300"}
                                borderWidth="1px"
                                borderColor="teal.500"
                                fontWeight="medium"
                                onClick={handleAddClick}
                            >
                                {added ? (
                                    <Flex align="center" gap={2}>
                                        <FiCheck size={16}/> Добавлено!
                                    </Flex>
                                ) : (
                                    "Добавить"
                                )}
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </motion.div>
    );
});
