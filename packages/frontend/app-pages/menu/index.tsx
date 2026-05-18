import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {MenuPageClient} from "./menu-page-client";
import {Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";
import {ProductsServer} from "./products-server";
import dynamic from "next/dynamic";
import {CookieNotice} from "@/components/cookie-notice";

const Footer = dynamic(() => import("./footer").then(m => m.Footer));

const INTERNAL_API = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

type MenuPageProps = {
    searchParams: Promise<{ token?: unknown }>
}

type NavItem = {
    id: string;
    name: string;
    children?: { id: string; name: string }[];
};

type MenuCategory = {
    _id: string;
    name: string;
    order: number;
    parent?: string | null;
    showGroupTitle?: boolean;
};

type MenuLunch = {
    _id: string;
    image: string;
    active: boolean;
};

type MenuDataResponse = {
    success: boolean;
    data: {
        activeLunch: MenuLunch | null;
        categories: MenuCategory[];
    };
};

type ActiveLunchData = {
    image: string | undefined;
};

export const MenuPage = async ({searchParams}: MenuPageProps) => {
    const {token} = await searchParams;
    const alcoholIsVisible = token === 'x7fa5ca6';

    let activeLunch: ActiveLunchData | null = null;
    let categories: MenuCategory[] = [];
    let fetchError = false;

    try {
        const res = await fetch(`${INTERNAL_API}/menu?showAlcohol=${alcoholIsVisible}`, {
            next: {revalidate: 60},
            signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
            const json: MenuDataResponse = await res.json();
            if (json.success && json.data) {
                activeLunch = json.data.activeLunch
                    ? { image: json.data.activeLunch.image ?? undefined }
                    : null;

                categories = json.data.categories;
            }
        } else {
            fetchError = true;
        }
    } catch (error) {
        console.error('Failed to fetch menu data:', error);
        fetchError = true;
    }

    const navItems: NavItem[] = categories
        .filter(c => !c.parent)
        .map(parent => ({
            id: parent._id,
            name: parent.name,
            children: categories
                .filter(c => c.parent === parent._id)
                .map(sub => ({ id: sub._id, name: sub.name }))
        }));

    return (
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

            <h1 id="page-title" style={{margin: 0}}>
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
                activeLunch={{image: activeLunch?.image ?? undefined}}
                navbar={{items: navItems}}
            >
                <Suspense fallback={<MenuLoader/>}>
                    <ProductsServer alcoholIsVisible={alcoholIsVisible} hasError={fetchError || categories.length === 0}/>
                </Suspense>

                <Footer/>
            </MenuPageClient>
        </Box>
    );
};
