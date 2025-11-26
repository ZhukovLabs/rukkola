export const CART_KEY = "localCart";
export const CART_TTL = 12 * 60 * 60 * 1000; // 12 часов

export type CartItemType = {
    id: string;
    name: string;
    price: number;
    size: string;
    image?: string;
    quantity: number;
    timestamp: number;
};

export const getCart = (): CartItemType[] => {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];

        const data: CartItemType[] = JSON.parse(raw) ?? [];
        const now = Date.now();

        const filtered = data.filter(item => now - item.timestamp < CART_TTL);

        if (filtered.length !== data.length) {
            localStorage.setItem(CART_KEY, JSON.stringify(filtered));
            window.dispatchEvent(new CustomEvent("cart-updated", {detail: filtered.length}));
        }

        return filtered;
    } catch (err) {
        console.error("Error reading cart:", err);
        return [];
    }
};

export const setCart = (items: CartItemType[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent("cart-updated", {detail: totalCount}));
};

export const addToCart = (item: Omit<CartItemType, "timestamp" | "quantity">, quantity = 1) => {
    const cart = getCart();

    const existingIndex = cart.findIndex(i => i.id === item.id && i.size === item.size);
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
        cart[existingIndex].timestamp = Date.now();
    } else {
        cart.push({...item, quantity, timestamp: Date.now()});
    }

    setCart(cart);
};

export const removeFromCart = (id: string, size: string, quantity?: number) => {
    const cart = getCart().map(item => {
        if (item.id === id && item.size === size) {
            if (quantity === undefined || item.quantity <= quantity) {
                return null; // удаляем полностью
            } else {
                return {...item, quantity: item.quantity - quantity}; // уменьшаем количество
            }
        }
        return item;
    }).filter(Boolean) as CartItemType[];

    setCart(cart);
};

export const clearCart = () => {
    setCart([]);
};
