'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CartModalContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const CartModalContext = createContext<CartModalContextType | null>(null);

export function CartModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return (
        <CartModalContext.Provider value={{ isOpen, open, close, toggle }}>
            {children}
        </CartModalContext.Provider>
    );
}

export function useCartModal() {
    const context = useContext(CartModalContext);
    if (!context) {
        throw new Error("useCartModal must be used within CartModalProvider");
    }
    return context;
}