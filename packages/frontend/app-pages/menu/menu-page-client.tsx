'use client';

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { CartButton } from "./cart-button";
import { Box } from "@chakra-ui/react";
import { AdminFloatButton } from "@/components/admin-float-button";
import { CartModalProvider } from "./cart-modal/use-cart-modal";
import {Navbar} from "@/app-pages/menu/navbar";
import type {NavbarItem} from "@/app-pages/menu/navbar/types";

import { ProductModalProvider } from "./product-modal/use-product-modal";

const ScrollToFooterButton = dynamic(() => import("./scroll-footer-button").then(m => m.ScrollToFooterButton));
const ScrollToTopButton = dynamic(() => import("./scroll-top-button").then(m => m.ScrollToTopButton));
const ProductModal = dynamic(() => import("./product-modal").then(m => m.ProductModal), { ssr: false });
const CartModal = dynamic(() => import("./cart-modal").then(m => m.CartModal), { ssr: false });
const ActiveLunch = dynamic(() => import("./active-lunch").then(m => m.ActiveLunch));

type MenuPageClientProps = {
    activeLunch: { image?: string }
    navbar: { items: NavbarItem[] }
    children?: React.ReactNode
}

function CartComponents() {
    return (
        <CartModalProvider>
            <CartButton />
            <CartModal />
        </CartModalProvider>
    );
}

export const MenuPageClient = ({ activeLunch, navbar, children }: MenuPageClientProps) => {
    return (
        <ProductModalProvider>
            <Box display="flex" flexDirection="column">
                {activeLunch?.image && <ActiveLunch image={activeLunch.image} />}
                <ScrollToFooterButton />

                <Navbar items={navbar.items} />

                <AdminFloatButton />
                <ScrollToTopButton />

                {children}

                <Suspense fallback={null}>
                    <CartComponents />
                </Suspense>

                <Suspense fallback={null}>
                    <ProductModal />
                </Suspense>
            </Box>
        </ProductModalProvider>
    );
}