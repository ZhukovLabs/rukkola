import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {MenuPageClient} from "./menu-page-client";
import {Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";
import {ProductsServer} from "./products-server";
import {CookieNotice} from "@/components/cookie-notice";
import {serverFetch} from "@/lib/api/server-fetch";
import type {MenuCategory, MenuLunch} from "@/lib/api/menu";
import {Footer} from "./footer";
import type {NavbarItem} from "./navbar/types";

type MenuPageProps = {
    token?: unknown;
}

type MenuDataResponse = {
    success: boolean;
    data: {
        activeLunch: MenuLunch | null;
        categories: MenuCategory[];
    };
};

export const MenuPage = async ({token}: MenuPageProps) => {
    const alcoholIsVisible = token === 'x7fa5ca6';
    const json = await serverFetch<MenuDataResponse>(`/menu?showAlcohol=${alcoholIsVisible}`);

    const activeLunchImage = json?.success ? json?.data?.activeLunch?.image ?? undefined : undefined;
    const categories = json?.success ? json?.data?.categories ?? [] : [];
    const fetchError = !json?.success;

    const navItems: NavbarItem[] = categories
        .filter(c => !c.parent)
        .map(parent => ({
            id: parent._id,
            name: parent.name,
            children: categories
                .filter(c => c.parent === parent._id)
                .map(sub => ({ id: sub._id, name: sub.name }))
        }));

    return (
        <main>
        <Box 
            display="flex" 
            flexDirection="column" 
            maxW="1440px" 
            w="100%" 
            mx="auto" 
            p="20px"
            pb="env(safe-area-inset-bottom, 20px)"
            css={{
                minHeight: '100vh',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <CookieNotice/>

            <h1 id="page-title" aria-label="Меню кафе Руккола в Гомеле — Пицца, суши и роллы" style={{margin: 0}}>
                <Box mx="auto" w={{base: "80%", sm: "60%", md: "400px"}} maxW="90vw" mb={{base: 4, md: 6}}>
                    <Image
                        src="/logo.svg"
                        alt="Руккола - кафе"
                        width={400}
                        height={200}
                        style={{width: "100%", height: "auto", objectFit: "contain"}}
                        priority
                        fetchPriority="high"
                        suppressHydrationWarning
                    />
                </Box>
            </h1>

            <MenuPageClient
                activeLunch={{image: activeLunchImage}}
                navbar={{items: navItems}}
            >
                <Suspense fallback={<MenuLoader/>}>
                    <ProductsServer alcoholIsVisible={alcoholIsVisible} hasError={fetchError || categories.length === 0}/>
                </Suspense>

                <Footer/>
            </MenuPageClient>
        </Box>
        </main>
    );
};
