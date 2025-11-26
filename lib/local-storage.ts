import {ProductType} from "@/models/product";

export const CART_KEY = "localCart";
export const CART_TTL = 12 * 60 * 60 * 1000; // 12 hours

export type CartItemType = {
    id: string;
    name: string;
    price: number;
    size: string;
    image?: string;
    timestamp: number;
}

export const getCart = (): CartItemType[] => {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);
        const now = Date.now();

        const filtered = data.filter((item: CartItemType) => now - item.timestamp < CART_TTL);
        localStorage.setItem(CART_KEY, JSON.stringify(filtered));

        return filtered;
    } catch {
        return [];
    }
};

export const setCart = (items: CartItemType[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cart-updated"));
};

export const addToCart = (item: Omit<CartItemType, 'timestamp'>) => {
    const cart = getCart();
    cart.push({...item, timestamp: Date.now()});
    setCart(cart);
};