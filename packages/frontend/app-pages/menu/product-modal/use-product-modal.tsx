'use client';

import {createContext, useContext, useState, useEffect, type ReactNode} from "react";
import {useSearchParams} from "next/navigation";

type ProductModalContextType = {
    productId: string | null;
    open: (id: string) => void;
    close: () => void;
};

const ProductModalContext = createContext<ProductModalContextType | null>(null);

export function ProductModalProvider({children}: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const [productId, setProductId] = useState<string | null>(null);

    useEffect(() => {
        setProductId(searchParams.get("product"));
    }, [searchParams]);

    const open = (id: string) => {
        setProductId(id);
        const params = new URLSearchParams(window.location.search);
        params.set("product", id);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({...window.history.state, as: newUrl, url: newUrl}, '', newUrl);
    };

    const close = () => {
        setProductId(null);
        const params = new URLSearchParams(window.location.search);
        params.delete("product");
        const qs = params.toString();
        const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
        window.history.pushState({...window.history.state, as: newUrl, url: newUrl}, '', newUrl);
    };

    return (
        <ProductModalContext.Provider value={{productId, open, close}}>
            {children}
        </ProductModalContext.Provider>
    );
}

export function useProductModal() {
    const ctx = useContext(ProductModalContext);
    if (!ctx) throw new Error("useProductModal must be used within ProductModalProvider");
    return ctx;
}
