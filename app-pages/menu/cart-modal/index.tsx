"use client";

import {useCallback, useEffect, useState, useMemo} from "react";
import {
    Box,
    Button,
    Flex,
    Text,
    Icon,
    Dialog,
    Portal,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {useSearchParams, usePathname, useRouter} from "next/navigation";
import {FiShoppingCart} from "react-icons/fi";
import {CartItemType, getCart, setCart} from "@/lib/local-storage";
import {CART_QUERY_KEY} from "../config";
import {CartItem} from "@/app-pages/menu/cart-modal/cart-item";

const emptyCart = (
    <Flex direction="column" align="center" justify="center" py={12} color="gray.400" gap={3}>
        <Icon as={FiShoppingCart} boxSize={10} color="teal.500"/>
        <Text>Корзина пуста</Text>
    </Flex>
);

export const CartModal = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

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
        (clickId: string) => () => {
            const updated = items.filter(({id}) => clickId !== id);
            setCart(updated);
            setItems(updated);
        },
        [items]
    );

    const handleClear = useCallback(() => {
        setCart([]);
        setItems([]);
    }, []);

    const total = items.reduce((sum, {price}) => sum + (price || 0), 0);

    const itemList = useMemo(() => (
        <Flex direction="column" gap={3}>
            {items.map(({id, name, image, size, price}, i) => (
                <CartItem
                    key={`${id}-${i}`}
                    name={name}
                    image={image}
                    size={size}
                    price={price}
                    handleRemove={handleRemove(id)}
                    indexDelay={i}
                />
            ))}
        </Flex>
    ), [items, handleRemove]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={closeCart} size="cover">
            <Portal>
                <Dialog.Backdrop
                    as={motion.div}
                    style={{
                        backdropFilter: "blur(8px)",
                        background: "rgba(0,0,0,0.75)",
                    }}
                />

                <Dialog.Positioner>
                    <Dialog.Content
                        as={motion.div}
                        bg="linear-gradient(145deg, #0a0a0a, #111)"
                        border="1px solid rgba(56,178,172,0.25)"
                        borderRadius="2xl"
                        boxShadow="0 0 25px rgba(56,178,172,0.15)"
                        maxH="85vh"
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                    >
                        <Dialog.Header
                            color="teal.300"
                            fontWeight="bold"
                            fontSize="lg"
                            letterSpacing="wide"
                            py={4}
                            px={6}
                            borderBottom="1px solid rgba(56,178,172,0.15)"
                        >
                            Ваша корзина
                        </Dialog.Header>

                        <Dialog.Body px={6} py={3} overflowY="auto" flex="1">
                            {items.length === 0 ? emptyCart : itemList}
                        </Dialog.Body>

                        {items.length > 0 && (
                            <Box
                                px={6}
                                py={4}
                                borderTop="1px solid rgba(56,178,172,0.2)"
                                bg="rgba(0,0,0,0.5)"
                                backdropFilter="blur(4px)"
                            >
                                <Flex justify="space-between" align="center">
                                    <Text color="gray.400" fontSize="sm">Итого:</Text>
                                    <Flex align="center" gap={3}>
                                        <Text color="teal.300" fontWeight="bold">
                                            {total.toFixed(2).replace(".", ",")} руб.
                                        </Text>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            color="red.400"
                                            borderColor="rgba(255,0,0,0.4)"
                                            p={2}
                                            _hover={{
                                                bg: "rgba(255,0,0,0.08)",
                                                borderColor: "rgba(255,0,0,0.5)",
                                            }}
                                            onClick={handleClear}
                                        >
                                            Очистить
                                        </Button>
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
