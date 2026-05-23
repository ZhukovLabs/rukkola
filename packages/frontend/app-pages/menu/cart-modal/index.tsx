'use client';

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
import {FiX} from "react-icons/fi";
import {addToCart, clearCart, getCart, type CartItem} from "@/lib/local-storage";
import {useCart, useCartActions, useCartTotal} from "@/hooks/use-cart";
import {trackAddToCart, trackRemoveFromCart, trackPurchase} from "@/lib/ecommerce-tracking";
import {CartItem as CartItemComponent} from "@/app-pages/menu/cart-modal/cart-item";
import {useCartModal} from "./use-cart-modal";
import {CartEmptyState} from "./cart-empty-state";
import {CartFooter} from "./cart-footer";

export const CartModal = () => {
    const isMobile = useBreakpointValue({base: true, md: false});
    const dialogMaxWidth = useBreakpointValue({base: "100%", md: "550px"});
    const items = useCart();
    const total = useCartTotal();
    const {remove} = useCartActions();
    const {isOpen, close} = useCartModal();

    const handleRemove = (id: string, size: string, item?: CartItem) => () => {
        remove(id, size);
        if (item) trackRemoveFromCart({id, name: item.name, price: item.price, quantity: item.quantity});
    };

    const handleClear = () => clearCart();

    const handleCompleteOrder = () => {
        const items = getCart();
        if (!items.length) return;
        trackPurchase({items: items.map(item => ({id: item.id, name: item.name, price: item.price, quantity: item.quantity}))});
    };

    const increaseQuantity = (item: CartItem) => () => {
        addToCart({id: item.id, name: item.name, price: item.price, size: item.size, image: item.image, blurDataURL: item.blurDataURL});
        trackAddToCart({id: item.id, name: item.name, price: item.price, quantity: 1});
    };

    const decreaseQuantity = (id: string, size: string, item?: CartItem) => () => {
        remove(id, size, 1);
        if (item) trackRemoveFromCart({id, name: item.name, price: item.price, quantity: 1});
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && close()}>
            <Portal>
                <Dialog.Backdrop asChild>
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        style={{backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.8)", position: "fixed", inset: 0, zIndex: 9998}}
                    />
                </Dialog.Backdrop>

                <Dialog.Positioner style={{position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "12px" : "24px", zIndex: 9998, overflow: "hidden"}}>
                    <Dialog.Content asChild>
                        <motion.div
                            initial={{scale: 0.95, opacity: 0, y: 20}}
                            animate={{scale: 1, opacity: 1, y: 0}}
                            exit={{scale: 0.95, opacity: 0, y: 20}}
                            transition={{type: "spring", damping: 25, stiffness: 300}}
                            style={{
                                background: "#0a0a0a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "24px",
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
                            <Dialog.Header py={{base: 4, md: 5}} px={{base: 5, md: 6}} display="flex" alignItems="center" justifyContent="space-between">
                                <Flex align="center" gap={3}>
                                    <Text color="white" fontWeight="bold" fontSize={{base: "xl", md: "2xl"}} letterSpacing="tight">
                                        Корзина
                                    </Text>
                                    {items.length > 0 && (
                                        <Flex bg="whiteAlpha.200" px={2} py={0.5} borderRadius="full" align="center" justify="center">
                                            <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800">
                                                {items.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                                            </Text>
                                        </Flex>
                                    )}
                                </Flex>
                                <Button size="sm" variant="ghost" onClick={close} color="whiteAlpha.600" borderRadius="full" minW="auto" p={2} _hover={{bg: "whiteAlpha.100", color: "white"}}>
                                    <Icon as={FiX} boxSize={5}/>
                                </Button>
                            </Dialog.Header>

                            <Dialog.Body px={{base: 4, md: 6}} py={2} overflowY="auto" flex="1" css={{
                                "&::-webkit-scrollbar": {width: "4px"},
                                "&::-webkit-scrollbar-track": {bg: "transparent"},
                                "&::-webkit-scrollbar-thumb": {bg: "rgba(255,255,255,0.1)", borderRadius: "2px"},
                            }}>
                                {items.length === 0 ? <CartEmptyState/> : (
                                    <Flex direction="column" gap={3}>
                                        {items.map((item, i) => (
                                            <CartItemComponent
                                                key={`${item.id}-${item.size}`}
                                                name={item.name}
                                                image={item.image}
                                                blurDataURL={item.blurDataURL}
                                                size={item.size}
                                                price={item.price}
                                                quantity={item.quantity}
                                                handleRemove={handleRemove(item.id, item.size, item)}
                                                onIncrease={increaseQuantity(item)}
                                                onDecrease={decreaseQuantity(item.id, item.size, item)}
                                                indexDelay={i}
                                            />
                                        ))}
                                    </Flex>
                                )}
                            </Dialog.Body>

                            {items.length > 0 && <CartFooter total={total} onClear={handleClear}/>}
                        </motion.div>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
