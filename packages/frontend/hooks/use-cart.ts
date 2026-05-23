import {useSyncExternalStore} from "react";
import {cartStore, type CartItem, addToCart, removeFromCart, clearCart} from "@/lib/local-storage";

const emptyCart: CartItem[] = [];

function subscribe(callback: () => void) {
    return cartStore.subscribe("cart-updated", callback as EventListener);
}

function getSnapshot(): CartItem[] {
    return cartStore.getSnapshot();
}

export function useCart(): CartItem[] {
    return useSyncExternalStore(subscribe, getSnapshot, () => emptyCart);
}

export function useCartCount(): number {
    return useCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function useCartTotal(): number {
    return useCart().reduce((sum, {price, quantity}) => sum + price * quantity, 0);
}

export const useCartActions = () => ({add: addToCart, remove: removeFromCart, clear: clearCart});

export function useCartItem(id: string, size: string) {
    return useCart().find(item => item.id === id && item.size === size);
}
