import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cartStore, type CartItem, addToCart as addItem, removeFromCart as removeItem, clearCart as clearItems } from "@/lib/local-storage";

const emptyCart: CartItem[] = [];

function subscribe(callback: () => void) {
    return cartStore.subscribe("cart-updated", callback as EventListener);
}

function getSnapshot(): CartItem[] {
    return cartStore.getCart();
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

export function useCartActions() {
    const add = useCallback((item: Omit<CartItem, "timestamp" | "quantity">, quantity = 1) => {
        addItem(item, quantity);
    }, []);

    const remove = useCallback((id: string, size: string, quantity?: number) => {
        removeItem(id, size, quantity);
    }, []);

    const clear = useCallback(() => {
        clearItems();
    }, []);

    return { add, remove, clear };
}

export function useCartItem(id: string, size: string) {
    const items = useCart();
    return useMemo(() => items.find(item => item.id === id && item.size === size), [items, id, size]);
}
