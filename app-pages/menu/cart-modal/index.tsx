'use client';

import {useCallback, useEffect, useState, useMemo} from "react";
import {
    Box,
    Button,
    Flex,
    Text,
    Icon,
    Dialog,
    Portal,
    useBreakpointValue,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {useSearchParams, usePathname, useRouter} from "next/navigation";
import {FiShoppingCart, FiX} from "react-icons/fi";
import {CartItemType, getCart, setCart, addToCart, removeFromCart, clearCart} from "@/lib/local-storage";
import {CART_QUERY_KEY} from "../config";
import {CartItem} from "@/app-pages/menu/cart-modal/cart-item";

const emptyCart = (
    <Flex direction="column" align="center" justify="center" py={8} color="gray.400" gap={3}>
        <Icon as={FiShoppingCart} boxSize={{base: 8, md: 10}} color="teal.500"/>
        <Text fontSize={{base: "sm", md: "md"}}>Корзина пуста</Text>
    </Flex>
);

export const CartModal = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const isMobile = useBreakpointValue({base: true, md: false});
    const dialogMaxWidth = useBreakpointValue({base: "100%", md: "600px", lg: "700px"});
    const dialogHeight = useBreakpointValue({base: "calc(90vh - 40px)", md: "calc(100vh - 20px)"});

    const [items, setItems] = useState<CartItemType[]>(() => getCart());
    const isOpen = searchParams.has(CART_QUERY_KEY);

    useEffect(() => {
        const onUpdate = () => setItems(getCart());
        window.addEventListener("cart-updated", onUpdate);
        return () => window.removeEventListener("cart-updated", onUpdate);
    }, []);

    const closeCart = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(CART_QUERY_KEY);
        router.replace(`${pathname}?${params.toString()}`, {scroll: false});
    }, [pathname, router, searchParams]);

    const handleRemove = useCallback(
        (id: string, size: string) => () => {
            removeFromCart(id, size);
            setItems(getCart());
        },
        []
    );

    const handleClear = useCallback(() => {
        clearCart();
        setItems([]);
    }, []);

    const increaseQuantity = useCallback(
        (id: string, size: string) => () => {
            const item = items.find(i => i.id === id && i.size === size);
            if (item) {
                addToCart({id: item.id, name: item.name, price: item.price, size: item.size, image: item.image});
                setItems(getCart());
            }
        },
        [items]
    );

    const decreaseQuantity = useCallback(
        (id: string, size: string) => () => {
            const item = items.find(i => i.id === id && i.size === size);
            if (item) {
                removeFromCart(id, size, 1);
                setItems(getCart());
            }
        },
        [items]
    );

    const total = items.reduce((sum, {price, quantity}) => sum + (price || 0) * (quantity || 1), 0);

    const itemList = (
        <Flex direction="column" gap={{base: 2, md: 3}}>
            {items.map(({id, name, image, size, price, quantity}, i) => (
                <CartItem
                    key={`${id}-${size}`}
                    name={name}
                    image={image}
                    size={size}
                    price={price}
                    quantity={quantity}
                    handleRemove={handleRemove(id, size)}
                    onIncrease={increaseQuantity(id, size)}
                    onDecrease={decreaseQuantity(id, size)}
                    indexDelay={i}
                />
            ))}
        </Flex>
    );

    return (
        <Dialog.Root open={isOpen} onOpenChange={closeCart}>
            <Portal>
                <Dialog.Backdrop
                    as={motion.div}
                    style={{
                        backdropFilter: "blur(8px)",
                        background: "rgba(0,0,0,0.75)"
                    }}
                />

                <Dialog.Positioner
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        paddingTop: isMobile ? "10px" : "20px",
                        paddingBottom: isMobile ? "10px" : "20px",
                    }}
                >
                    <Dialog.Content
                        as={motion.div}
                        bg="linear-gradient(145deg, #0a0a0a, #111)"
                        border="1px solid rgba(56,178,172,0.25)"
                        borderTopRadius={{base: "xl", md: "2xl"}}
                        borderBottomRadius={{base: "xl", md: "none"}}
                        boxShadow="0 0 25px rgba(56,178,172,0.15)"
                        maxH={dialogHeight}
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                        width="100%"
                        maxWidth={dialogMaxWidth}
                        margin={0}
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        mx={{base: 0, md: "auto"}}
                        style={{
                            touchAction: "none",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <Dialog.Header
                            color="teal.300"
                            fontWeight="bold"
                            fontSize={{base: "md", md: "lg"}}
                            letterSpacing="wide"
                            py={{base: 3, md: 4}}
                            px={{base: 4, md: 6}}
                            borderBottom="1px solid rgba(56,178,172,0.15)"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Text>Ваша корзина</Text>
                            {isMobile && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    p={1}
                                    minW="auto"
                                    onClick={closeCart}
                                    _hover={{bg: "rgba(255,255,255,0.05)"}}
                                >
                                    <Icon as={FiX} boxSize={5}/>
                                </Button>
                            )}
                        </Dialog.Header>

                        <Dialog.Body
                            px={{base: 4, md: 6}}
                            py={{base: 3, md: 3}}
                            overflowY="auto"
                            flex="1"
                        >
                            {items.length === 0 ? emptyCart : itemList}
                        </Dialog.Body>

                        {items.length > 0 && (
                            <Box
                                px={{base: 4, md: 6}}
                                py={{base: 3, md: 4}}
                                borderTop="1px solid rgba(56,178,172,0.2)"
                                bg="rgba(0,0,0,0.5)"
                                backdropFilter="blur(4px)"
                            >
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    direction="row"
                                    gap={{base: 3, md: 0}}
                                >
                                    <Text color="gray.400" fontSize={{base: "xs", md: "sm"}}>
                                        Итого:
                                    </Text>
                                    <Flex
                                        align="center"
                                        gap={3}
                                        width={{base: "100%", md: "auto"}}
                                        justify="space-between"
                                    >
                                        <Text
                                            color="teal.300"
                                            fontWeight="bold"
                                            fontSize={{base: "lg", md: "xl"}}
                                        >
                                            {total.toFixed(2).replace(".", ",")} руб.
                                        </Text>
                                        <Flex gap={2}>
                                            <Button
                                                size={{base: "sm", md: "sm"}}
                                                variant="outline"
                                                color="red.400"
                                                borderColor="rgba(255,0,0,0.4)"
                                                p={{base: 2, md: 2}}
                                                _hover={{
                                                    bg: "rgba(255,0,0,0.08)",
                                                    borderColor: "rgba(255,0,0,0.5)",
                                                }}
                                                onClick={handleClear}
                                                fontSize={{base: "xs", md: "sm"}}
                                            >
                                                Очистить
                                            </Button>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </Box>
                        )}
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};