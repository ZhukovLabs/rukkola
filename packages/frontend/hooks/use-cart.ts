import { useMemo, useSyncExternalStore } from "react";
import { cartStore, type CartItem, addToCart, removeFromCart, clearCart } from "@/lib/local-storage";

const emptyCart: CartItem[] = [];

function subscribe(callback: () => void) {
    return cartStore.subscribe("cart-updated", callback as EventListener);
}

function getSnapshot(): CartItem[] {
    return cartStore.getSnapshot();
}

function getServerSnapshot(): CartItem[] {
    return emptyCart;
}

export function useCart(): CartItem[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
    const items = useCart();
    return useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
}

export function useCartTotal(): number {
    const items = useCart();
    return useMemo(() => items.reduce((sum, {price, quantity}) => sum + price * quantity, 0), [items]);
}

export const useCartActions = () => ({
    add: addToCart,
    remove: removeFromCart,
    clear: clearCart,
});

export function useCartItem(id: string, size: string) {
    const items = useCart();
    return useMemo(() => items.find(item => item.id === id && item.size === size), [items, id, size]);
}
