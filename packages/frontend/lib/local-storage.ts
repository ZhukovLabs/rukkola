export const CART_KEY = "localCart";
export const CART_TTL = 12 * 60 * 60 * 1000;

export interface CartItem {
    id: string;
    name: string;
    price: number;
    size: string;
    image?: string;
    quantity: number;
    timestamp: number;
}

type CartEventMap = {
    'cart-updated': CustomEvent<void>;
};

type CartEventListener<K extends keyof CartEventMap> = (event: CartEventMap[K]) => void;

class CartStore {
    private listeners = new Map<keyof CartEventMap, Set<CartEventListener<keyof CartEventMap>>>();
    private cachedCart: CartItem[] | null = null;

    subscribe<K extends keyof CartEventMap>(event: K, listener: CartEventListener<K>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener as CartEventListener<keyof CartEventMap>);

        return () => {
            this.listeners.get(event)?.delete(listener as CartEventListener<keyof CartEventMap>);
        };
    }

    private emit<K extends keyof CartEventMap>(event: K): void {
        this.listeners.get(event)?.forEach(listener => {
            listener(new CustomEvent(event) as CartEventMap[K]);
        });
    }

    private readFromStorage(): CartItem[] {
        try {
            const raw = localStorage.getItem(CART_KEY);
            if (!raw) return [];

            const data: CartItem[] = JSON.parse(raw);
            const now = Date.now();
            const filtered = data.filter(item => now - item.timestamp < CART_TTL);

            if (filtered.length !== data.length) {
                localStorage.setItem(CART_KEY, JSON.stringify(filtered));
            }

            return filtered;
        } catch {
            return [];
        }
    }

    getCart(): CartItem[] {
        if (typeof window === 'undefined') return [];

        if (this.cachedCart === null) {
            this.cachedCart = this.readFromStorage();
        }

        return this.cachedCart;
    }

    getSnapshot(): CartItem[] {
        return this.getCart();
    }

    invalidateCache(): void {
        this.cachedCart = null;
    }

    private persist(items: CartItem[]): void {
        this.cachedCart = items;
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        this.emit('cart-updated');
    }

    add(item: Omit<CartItem, 'timestamp' | 'quantity'>, quantity = 1): void {
        const cart = this.getCart();
        const existingIndex = cart.findIndex(i => i.id === item.id && i.size === item.size);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
            cart[existingIndex].timestamp = Date.now();
        } else {
            cart.push({ ...item, quantity, timestamp: Date.now() });
        }

        this.persist([...cart]);
    }

    remove(id: string, size: string, quantity?: number): void {
        const cart = this.getCart().map(item => {
            if (item.id === id && item.size === size) {
                if (quantity === undefined || item.quantity <= quantity) {
                    return null;
                }
                return { ...item, quantity: item.quantity - quantity };
            }
            return item;
        }).filter((item): item is CartItem => item !== null);

        this.persist(cart);
    }

    clear(): void {
        this.persist([]);
    }
}

export const cartStore = new CartStore();

export const getCart = () => cartStore.getCart();

export const addToCart = (item: Omit<CartItem, 'timestamp' | 'quantity'>, quantity = 1) => {
    cartStore.add(item, quantity);
};

export const removeFromCart = (id: string, size: string, quantity?: number) => {
    cartStore.remove(id, size, quantity);
};

export const clearCart = () => {
    cartStore.clear();
};
