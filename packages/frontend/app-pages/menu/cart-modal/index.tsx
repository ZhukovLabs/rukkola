'use client';

import {useCallback, useMemo, useEffect} from "react";
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
import {FiShoppingCart, FiX, FiInfo, FiTrash2} from "react-icons/fi";
import {addToCart, clearCart, type CartItem} from "@/lib/local-storage";
import {useCart, useCartActions, useCartTotal} from "@/hooks/use-cart";
import {CART_QUERY_KEY} from "../constants";
import {CartItem as CartItemComponent} from "@/app-pages/menu/cart-modal/cart-item";

const MotionBox = motion.create(Box);

const emptyCartContent = (
    <Flex direction="column" align="center" justify="center" py={12} px={6} gap={4}>
        <MotionBox
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{duration: 0.5, ease: "easeOut"}}
            bg="rgba(255, 255, 255, 0.05)"
            p={6}
            borderRadius="full"
            border="1px solid rgba(255, 255, 255, 0.1)"
        >
            <Icon as={FiShoppingCart} boxSize={12} color="whiteAlpha.400"/>
        </MotionBox>
        <Flex direction="column" align="center" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="white">Корзина пуста</Text>
            <Text fontSize="sm" color="whiteAlpha.500" textAlign="center">
                Добавьте что-нибудь вкусное, чтобы начать заказ
            </Text>
        </Flex>
    </Flex>
);

export const CartModal = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const isMobile = useBreakpointValue({base: true, md: false});
    const dialogMaxWidth = useBreakpointValue({base: "100%", md: "550px"});

    const items = useCart();
    const total = useCartTotal();
    const {remove} = useCartActions();
    const isOpen = searchParams.has(CART_QUERY_KEY);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;

            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";

            return () => {
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.body.style.overflow = originalBodyOverflow;
            };
        }
    }, [isOpen]);

    const closeCart = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(CART_QUERY_KEY);
        router.replace(`${pathname}?${params.toString()}`, {scroll: false});
    }, [pathname, router, searchParams]);

    const handleRemove = useCallback((id: string, size: string) => () => {
        remove(id, size);
    }, [remove]);

    const handleClear = useCallback(() => {
        clearCart();
    }, []);

    const increaseQuantity = useCallback((item: CartItem) => () => {
        addToCart({id: item.id, name: item.name, price: item.price, size: item.size, image: item.image});
    }, []);

    const decreaseQuantity = useCallback((id: string, size: string) => () => {
        remove(id, size, 1);
    }, [remove]);

    const itemList = useMemo(() => (
        <Flex direction="column" gap={3}>
            {items.map((item, i) => (
                <CartItemComponent
                    key={`${item.id}-${item.size}`}
                    name={item.name}
                    image={item.image}
                    size={item.size}
                    price={item.price}
                    quantity={item.quantity}
                    handleRemove={handleRemove(item.id, item.size)}
                    onIncrease={increaseQuantity(item)}
                    onDecrease={decreaseQuantity(item.id, item.size)}
                    indexDelay={i}
                />
            ))}
        </Flex>
    ), [items, handleRemove, increaseQuantity, decreaseQuantity]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={closeCart}>
            <Portal>
                <Dialog.Backdrop asChild>
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        style={{
                            backdropFilter: "blur(12px)",
                            background: "rgba(0,0,0,0.8)",
                            position: "fixed",
                            inset: 0,
                            zIndex: 9998,
                        }}
                    />
                </Dialog.Backdrop>

                <Dialog.Positioner
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: isMobile ? "12px" : "24px",
                        zIndex: 9998,
                        overflow: "hidden", // Prevent Positioner from scrolling
                    }}
                >
                    <Dialog.Content asChild>
                        <motion.div
                            initial={{scale: 0.95, opacity: 0, y: 20}}
                            animate={{scale: 1, opacity: 1, y: 0}}
                            exit={{scale: 0.95, opacity: 0, y: 20}}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                            style={{
                                background: "#0a0a0a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "24px", // 3xl equivalent
                                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                                maxHeight: "calc(100% - 24px)",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                width: "100%",
                                maxWidth: dialogMaxWidth,
                                position: "relative",
                            }}
                        >
                            <Dialog.Header
                                py={{base: 4, md: 5}}
                                px={{base: 5, md: 6}}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Flex align="center" gap={3}>
                                    <Text
                                        color="white"
                                        fontWeight="bold"
                                        fontSize={{base: "xl", md: "2xl"}}
                                        letterSpacing="tight"
                                    >
                                        Корзина
                                    </Text>
                                    {items.length > 0 && (
                                        <Flex
                                            bg="whiteAlpha.200"
                                            px={2}
                                            py={0.5}
                                            borderRadius="full"
                                            align="center"
                                            justify="center"
                                        >
                                            <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800">
                                                {items.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                                            </Text>
                                        </Flex>
                                    )}
                                </Flex>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={closeCart}
                                    color="whiteAlpha.600"
                                    borderRadius="full"
                                    minW="auto"
                                    p={2}
                                    _hover={{bg: "whiteAlpha.100", color: "white"}}
                                >
                                    <Icon as={FiX} boxSize={5}/>
                                </Button>
                            </Dialog.Header>

                            <Dialog.Body
                                px={{base: 4, md: 6}}
                                py={2}
                                overflowY="auto"
                                flex="1"
                                css={{
                                    "&::-webkit-scrollbar": {width: "4px"},
                                    "&::-webkit-scrollbar-track": {bg: "transparent"},
                                    "&::-webkit-scrollbar-thumb": {bg: "rgba(255,255,255,0.1)", borderRadius: "2px"},
                                }}
                            >
                                {items.length === 0 ? emptyCartContent : itemList}
                            </Dialog.Body>

                            {items.length > 0 && (
                                <Box
                                    px={{base: 5, md: 6}}
                                    py={{base: 5, md: 6}}
                                    borderTop="1px solid rgba(255,255,255,0.08)"
                                    bg="rgba(255,255,255,0.02)"
                                    backdropFilter="blur(10px)"
                                >
                                    <Flex direction="column" gap={4}>
                                        <Flex justify="space-between" align="center">
                                            <Text color="whiteAlpha.600" fontSize="sm" fontWeight="medium">
                                                Итого к оплате
                                            </Text>
                                            <Text
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="2xl"
                                                letterSpacing="tight"
                                            >
                                                {total.toFixed(2).replace(".", ",")} руб.
                                            </Text>
                                        </Flex>

                                        <Flex gap={3} align="stretch" direction={{ base: "column", sm: "row" }}>
                                            <Flex
                                                flex="1"
                                                bg="rgba(212, 163, 115, 0.08)"
                                                border="1px solid rgba(212, 163, 115, 0.15)"
                                                borderRadius="2xl"
                                                p={{ base: 4, md: 4 }}
                                                align="center"
                                                justify={{ base: "center", sm: "flex-start" }}
                                                direction={{ base: "column", sm: "row" }}
                                                gap={{ base: 2, md: 3 }}
                                                textAlign={{ base: "center", sm: "left" }}
                                            >
                                                <Icon as={FiInfo} color="orange.200" boxSize={{ base: 6, sm: 5 }} flexShrink={0} />
                                                <Text fontSize={{ base: "xs", md: "xs" }} color="whiteAlpha.900" lineHeight="1.5">
                                                    Почти готово! <Text as="span" display={{ base: "none", sm: "inline" }}>✨</Text> Выберите понравившееся и скажите <Text as="span" color="orange.200" fontWeight="bold">официанту</Text>. Мы приготовим ваш заказ.
                                                </Text>
                                            </Flex>
                                            <Button
                                                size="lg"
                                                variant="ghost"
                                                color="red.400"
                                                borderRadius="2xl"
                                                p={3}
                                                minW={{ base: "100%", sm: "auto" }}
                                                h={{ base: "44px", sm: "auto" }}
                                                _hover={{ bg: "rgba(255,0,0,0.1)" }}
                                                onClick={handleClear}
                                                title="Очистить корзину"
                                            >
                                                <Flex align="center" gap={2} display={{ base: "flex", sm: "none" }}>
                                                    <Icon as={FiTrash2} boxSize={4} />
                                                    <Text fontSize="xs" fontWeight="bold">Очистить корзину</Text>
                                                </Flex>
                                                <Icon as={FiTrash2} boxSize={5} display={{ base: "none", sm: "block" }} />
                                            </Button>
                                        </Flex>                                    </Flex>
                                </Box>
                            )}
                        </motion.div>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
