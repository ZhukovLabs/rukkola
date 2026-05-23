'use client';

import {Box} from "@chakra-ui/react";
import {AdminFloatButton} from "@/components/admin-float-button";
import {CartModalProvider} from "./cart-modal/use-cart-modal";
import {Navbar} from "@/app-pages/menu/navbar";
import type {NavbarItem} from "@/app-pages/menu/navbar/types";
import {ProductModalProvider} from "./product-modal/use-product-modal";
import {ScrollToFooterButton, ScrollToTopButton} from "./scroll-buttons";
import {ProductModal} from "./product-modal";
import {CartModal} from "./cart-modal";
import {ActiveLunch} from "./active-lunch";
import {CartButton} from "./cart-button";

type MenuPageClientProps = {
    activeLunch: { image?: string }
    navbar: { items: NavbarItem[] }
    children?: React.ReactNode
}

export const MenuPageClient = ({activeLunch, navbar, children}: MenuPageClientProps) => {
    return (
        <ProductModalProvider>
            <Box display="flex" flexDirection="column">
                {activeLunch?.image && <ActiveLunch image={activeLunch.image}/>}
                <ScrollToFooterButton/>
                <Navbar items={navbar.items}/>
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
    );
};
