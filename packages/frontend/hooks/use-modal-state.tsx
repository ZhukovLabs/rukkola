'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export function createModalState(displayName: string) {
    const Ctx = createContext<ModalState | null>(null);
    Ctx.displayName = displayName;

    function Provider({ children }: { children: ReactNode }) {
        const [isOpen, setIsOpen] = useState(false);
        const open = useCallback(() => setIsOpen(true), []);
        const close = useCallback(() => setIsOpen(false), []);
        const toggle = useCallback(() => setIsOpen(prev => !prev), []);

        return (
            <Ctx.Provider value={{ isOpen, open, close, toggle }}>
                {children}
            </Ctx.Provider>
        );
    }

    function useModal(): ModalState {
        const ctx = useContext(Ctx);
        if (!ctx) {
            throw new Error(`useModal must be used within ${displayName}`);
        }
        return ctx;
    }

    return [Provider, useModal] as const;
}
