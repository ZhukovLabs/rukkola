'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface ProductModalContextType {
    productId: string | null;
    open: (id: string) => void;
    close: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | null>(null);

export function ProductModalProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get("product");
        setProductId(id);
    }, [searchParams]);

    const open = useCallback((id: string) => {
        setProductId(id);
        const params = new URLSearchParams(window.location.search);
        params.set("product", id);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, []);

    const close = useCallback(() => {
        setProductId(null);
        const params = new URLSearchParams(window.location.search);
        params.delete("product");
        const queryString = params.toString();
        const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, []);

    return (
        <ProductModalContext.Provider value={{ productId, open, close }}>
            {children}
        </ProductModalContext.Provider>
    );
}

export function useProductModal() {
    const context = useContext(ProductModalContext);
    if (!context) {
        throw new Error("useProductModal must be used within ProductModalProvider");
    }
    return context;
}
