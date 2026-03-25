import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {MenuPageClient} from "./menu-page-client";
import {Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";
import {ProductsServer} from "./products-server";
import dynamic from "next/dynamic";
import {UnofficialNotice} from "@/components/unofficial-notice";

const Footer = dynamic(() => import("./footer").then(m => m.Footer));

const INTERNAL_API = process.env.INTERNAL_API_URL || 'http://localhost:4000/api';

type MenuPageProps = {
    searchParams: Promise<{ showAlcohol?: unknown }>
}

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

export const MenuPage = async ({searchParams}: MenuPageProps) => {
    const {showAlcohol} = await searchParams;

    const alcoholIsVisible = showAlcohol === 'true';

    let activeLunch: { id: string; image: string | null; active: boolean } | null = null;
    let categories: { id: string; name: string; parent: string | null; order: number; showGroupTitle: boolean }[] = [];

    try {
        const res = await fetch(`${INTERNAL_API}/menu?showAlcohol=${alcoholIsVisible}`, {
            next: {revalidate: 60},
            signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
            const json: MenuDataResponse = await res.json();
            if (json.success && json.data) {
                activeLunch = json.data.activeLunch
                    ? {
                        id: json.data.activeLunch._id,
                        image: json.data.activeLunch.image ?? null,
                        active: json.data.activeLunch.active ?? false,
                    }
                    : null;

                categories = json.data.categories.map(c => ({
                    id: c._id,
                    name: c.name,
                    parent: c.parent ?? null,
                    order: c.order ?? 0,
                    showGroupTitle: c.showGroupTitle ?? true,
                }));
            }
        }
    } catch (error) {
        console.error('Failed to fetch menu data:', error);
    }

    const navItems = categories
        .filter(({parent}) => !parent)
        .map(parent => ({
            id: parent.id,
            name: parent.name,
            children: categories
                .filter(c => c.parent === parent.id)
                .map(sub => ({id: sub.id, name: sub.name}))
        }));

    return (
        <Box display="flex" flexDirection="column" maxW="1440px" w="100%" mx="auto" p="20px">
            <UnofficialNotice/>

            <Box mx="auto" w={{base: "80%", sm: "60%", md: "400px"}} maxW="90vw" mb={{base: 4, md: 6}}>
                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={400}
                    height={200}
                    style={{width: "100%", height: "auto", objectFit: "contain"}}
                    priority
                    fetchPriority="high"
                    suppressHydrationWarning
                />
            </Box>

            <MenuPageClient
                activeLunch={{image: activeLunch?.image ?? undefined}}
                navbar={{items: navItems}}
            />

            <Suspense fallback={<MenuLoader/>}>
                <ProductsServer alcoholIsVisible={alcoholIsVisible}/>
            </Suspense>

            <Footer/>
        </Box>
    );
};
