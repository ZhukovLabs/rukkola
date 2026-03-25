'use client';

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { CartButton } from "./cart-button";
import { Box } from "@chakra-ui/react";
import { ComponentProps } from "react";
import { AdminFloatButton } from "@/components/admin-float-button";

const Navbar = dynamic(() => import("./navbar").then(m => m.Navbar));
const ScrollToFooterButton = dynamic(() => import("./scroll-footer-button").then(m => m.ScrollToFooterButton));
const ScrollToTopButton = dynamic(() => import("./scroll-top-button").then(m => m.ScrollToTopButton));
const ProductModal = dynamic(() => import("./product-modal").then(m => m.ProductModal));
const CartModal = dynamic(() => import("./cart-modal").then(m => m.CartModal));
const ActiveLunch = dynamic(() => import("./active-lunch").then(m => m.ActiveLunch));

type MenuPageClientProps = {
    activeLunch: Partial<ComponentProps<typeof ActiveLunch>>
    navbar: ComponentProps<typeof Navbar>
}

function CartComponents() {
    return (
        <>
            <CartButton />
            <CartModal />
        </>
    );
}

function NavbarWrapper({ items }: { items: ComponentProps<typeof Navbar>["items"] }) {
    return <Navbar items={items} />;
}

export const MenuPageClient = ({ activeLunch, navbar }: MenuPageClientProps) => {
    return (
        <Box display="flex" flexDirection="column">
            {activeLunch?.image && <ActiveLunch image={activeLunch.image} />}
            <ScrollToFooterButton />
            
            <Suspense fallback={<Box h="60px" />}>
                <NavbarWrapper items={navbar.items} />
            </Suspense>

            <AdminFloatButton />
            <ScrollToTopButton />
            
            <Suspense fallback={null}>
                <CartComponents />
            </Suspense>

            <Suspense fallback={null}>
                <ProductModal />
            </Suspense>
        </Box>
    );
}