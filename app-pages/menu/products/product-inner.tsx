"use client";

import {
    Flex,
    Text,
    Heading,
    Button,
    Stack,
    Box,
} from "@chakra-ui/react";
import Image from "next/image";
import {motion, AnimatePresence} from "framer-motion";
import React, {useState, useEffect} from "react";
import {FiCheck} from "react-icons/fi";
import {useRouter} from "next/navigation";
import {addToCart} from "@/lib/local-storage";

type Price = {
    size: string;
    price: number;
};

export type ProductInnerProps = {
    id: string;
    img: string | null;
    alt: string | null;
    title: string;
    description: string | null;
    prices: Price[] | null;
};

const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

const ProductInner = ({id, img, alt, title, description, prices}: ProductInnerProps) => {
    const router = useRouter();
    const [added, setAdded] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);

    useEffect(() => {
        if (selecting && prices && prices.length > 0) {
            setSelectedPrice(prices[0]);
        }
    }, [selecting, prices]);

    const handleConfirm = () => {
        if (!selectedPrice) return;

        addToCart({
            id,
            name: title,
            image: img ?? "",
            price: selectedPrice.price,
            size: selectedPrice.size ?? "—",
        });

        setAdded(true);
        setSelecting(false);
        setSelectedPrice(null);
        setTimeout(() => setAdded(false), 1200);
    };

    const handleAddClick = () => {
        if (!prices || prices.length === 0) return;

        if (prices.length > 1) {
            setSelecting(true);
        } else {
            addToCart({
                id,
                name: title,
                image: img ?? "",
                price: prices[0].price,
                size: prices[0].size ?? "—",
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
        }
    };

    const handleCancel = () => {
        setSelecting(false);
        setSelectedPrice(null);
    };

    const openModal = () => {
        router.push(`?product=${id}`, {scroll: false});
    };

    return (
        <MotionFlex
            position="relative"
            direction={{base: "column", md: "row"}}
            align="stretch"
            overflow="hidden"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.700"
            bg="gray.800"
            _hover={{
                borderColor: "teal.500",
                boxShadow: "0 8px 20px rgba(56,178,172,0.15)",
            }}
            initial={{opacity: 0, y: 40}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.2}}
            transition={{duration: 0.6, ease: [0.25, 0.1, 0.25, 1]}}
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
                    _hover={{opacity: 0.9}}
                    transition="opacity 0.2s"
                >
                    <Image
                        src={img}
                        alt={alt ?? ""}
                        fill
                        unoptimized
                        style={{
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                    />
                </Box>
            )}

            <Flex direction="column" flex="1" p={{base: 5, md: 6}}>
                <Stack>
                    <Heading fontSize="xl" color="whiteAlpha.900" fontWeight="semibold" letterSpacing="wide">
                        {title}
                    </Heading>
                    {description && (
                        <Text fontSize="sm" color="gray.400" lineHeight="taller">
                            {description}
                        </Text>
                    )}
                </Stack>

                <Flex direction="column" mt="auto" gap={3} minH="100px">
                    <AnimatePresence mode="popLayout">
                        {selecting ? (
                            <motion.div key="selecting" layout initial={{opacity: 0}} animate={{opacity: 1}}
                                        exit={{opacity: 0}}>
                                <Flex direction="column" gap={2}>
                                    {prices?.map((p) => (
                                        <Button
                                            key={p.size}
                                            size="sm"
                                            borderRadius="full"
                                            px={5}
                                            py={2}
                                            bg={selectedPrice?.size === p.size ? "teal.500" : "gray.800"}
                                            color={selectedPrice?.size === p.size ? "white" : "teal.300"}
                                            borderWidth="1px"
                                            borderColor="teal.500"
                                            _hover={{
                                                bg: selectedPrice?.size === p.size ? "teal.600" : "gray.700",
                                                color: "white"
                                            }}
                                            onClick={() => setSelectedPrice(p)}
                                        >
                                            {p.size} — {p.price.toFixed(2).replace(".", ",")} руб.
                                        </Button>
                                    ))}
                                    <Flex justify="space-between" mt={2}>
                                        <Button size="sm" borderRadius="full" bg="red.500" color="white"
                                                _hover={{bg: "red.600"}} onClick={handleCancel} p={2}>
                                            Отменить
                                        </Button>
                                        <Button size="sm" borderRadius="full" bg="teal.500" color="white"
                                                _hover={{bg: "teal.600"}} onClick={handleConfirm} p={2}>
                                            Подтвердить
                                        </Button>
                                    </Flex>
                                </Flex>
                            </motion.div>
                        ) : prices ? (
                            <motion.div key="prices" layout initial={{opacity: 0}} animate={{opacity: 1}}
                                        exit={{opacity: 0}}>
                                <Flex direction="column" gap={2}>
                                    {prices.map(({price, size}) => (
                                        <Flex key={size} justifyContent="space-between" align="center">
                                            <Text fontSize="sm" color="gray.400">{size}</Text>
                                            <Text fontSize="md" fontWeight="semibold" color="teal.300">
                                                {price.toFixed(2).replace(".", ",")} руб.
                                            </Text>
                                        </Flex>
                                    ))}
                                </Flex>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {!selecting && (
                        <MotionButton
                            key={`add-btn-${added}`}
                            layout
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
                            whileTap={{scale: 0.95}}
                            animate={added ? {
                                scale: [1, 1.05, 1],
                                boxShadow: ["0 0 0 rgba(56,178,172,0)", "0 0 20px rgba(56,178,172,0.6)", "0 0 0 rgba(56,178,172,0)"]
                            } : {}}
                            _hover={{
                                bg: added ? "teal.600" : "teal.500",
                                color: "white",
                                boxShadow: "0 4px 12px rgba(56,178,172,0.35)"
                            }}
                            onClick={handleAddClick}
                        >
                            <AnimatePresence mode="wait">
                                {added ? (
                                    <motion.div
                                        key="added"
                                        initial={{opacity: 0, y: 10, scale: 0.8}}
                                        animate={{opacity: 1, y: 0, scale: 1}}
                                        exit={{opacity: 0, y: -10, scale: 0.9}}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <FiCheck size={16}/> Добавлено!
                                    </motion.div>

                                ) : (
                                    <motion.div key="add" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: -10}}>
                                        Добавить
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </MotionButton>
                    )}
                </Flex>
            </Flex>
        </MotionFlex>
    );
};

export default ProductInner;