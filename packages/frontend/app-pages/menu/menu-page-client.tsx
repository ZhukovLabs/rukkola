'use client';

import {Box} from "@chakra-ui/react";
import {Suspense} from "react";
import dynamic from "next/dynamic";
import {CartModalProvider} from "./cart-modal/use-cart-modal";
import {Navbar} from "@/app-pages/menu/navbar";
import type {NavbarItem} from "@/app-pages/menu/navbar/types";
import {ProductModalProvider} from "./product-modal/use-product-modal";
import {ScrollToFooterButton, ScrollToTopButton} from "./scroll-buttons";
import {ActiveLunch} from "./active-lunch";

const AdminFloatButton = dynamic(() => import("@/components/admin-float-button").then(m => ({default: m.AdminFloatButton})), {ssr: false});
const ProductModal = dynamic(() => import("./product-modal").then(m => ({default: m.ProductModal})), {ssr: false});
const CartModal = dynamic(() => import("./cart-modal").then(m => ({default: m.CartModal})), {ssr: false});
const CartButton = dynamic(() => import("./cart-button").then(m => ({default: m.CartButton})), {ssr: false});

type MenuPageClientProps = {
    activeLunch: { image?: string }
    navbar: { items: NavbarItem[] }
    children?: React.ReactNode
}

export const MenuPageClient = ({activeLunch, navbar, children}: MenuPageClientProps) => {
    return (
        <Suspense fallback={null}>
        <ProductModalProvider>
            <Box display="flex" flexDirection="column">
                {activeLunch?.image && <ActiveLunch image={activeLunch.image}/>}
                <ScrollToFooterButton/>
                <Suspense fallback={null}>
                    <Navbar items={navbar.items}/>
                </Suspense>
                <AdminFloatButton/>
                <ScrollToTopButton/>
                {children}
                <CartModalProvider>
                    <CartButton/>
                    <CartModal/>
                </CartModalProvider>
                <ProductModal/>
            </Box>
        </ProductModalProvider>
        </Suspense>
    );
};
