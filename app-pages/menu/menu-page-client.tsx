'use client';

import dynamic from "next/dynamic";
import {CartButton} from "./cart-button";
import {Box} from "@chakra-ui/react";
import {ComponentProps} from "react";

const Navbar = dynamic(() => import("./navbar").then(m => m.Navbar));
const Products = dynamic(() => import("./products").then(m => m.Products));
const Footer = dynamic(() => import("./footer").then(m => m.Footer));
const ScrollToFooterButton = dynamic(() => import("./scroll-footer-button").then(m => m.ScrollToFooterButton));
const ProductModal = dynamic(() => import("./product-modal").then(m => m.ProductModal));
const CartModal = dynamic(() => import("./cart-modal").then(m => m.CartModal));
const ActiveLunch = dynamic(() => import("./active-lunch").then(m => m.ActiveLunch));

type MenuPageClientProps = {
    activeLunch: Partial<ComponentProps<typeof ActiveLunch>>
    navbar: ComponentProps<typeof Navbar>
    products: ComponentProps<typeof Products>
}

export const MenuPageClient = ({activeLunch, navbar, products}: MenuPageClientProps) => {
    return (
        <Box display="flex" flexDirection="column">
            {activeLunch?.image && <ActiveLunch image={activeLunch.image}/>}
            <ScrollToFooterButton/>
            <Navbar items={navbar.items}/>
            <Products grouped={products.grouped} uncategorized={products.uncategorized}/>
            <CartButton/>
            <CartModal/>
            <Footer/>
            <ProductModal/>
        </Box>
    );
}
