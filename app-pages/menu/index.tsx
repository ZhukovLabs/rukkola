import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {MenuPageClient} from "./menu-page-client";
import {Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";
import {getMenuData} from "./config";
import {ProductsServer} from "./products-server";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("./footer").then(m => m.Footer));

type MenuPageProps = {
    searchParams: Promise<{ showAlcohol?: unknown }>
}

export const MenuPage = async ({searchParams}: MenuPageProps) => {
    const {showAlcohol} = await searchParams;

    const alcoholIsVisible = showAlcohol === 'true';

    const {
        activeLunch: activeLunchRaw,
        categories: categoriesRaw
    } = await getMenuData({getAlcohol: alcoholIsVisible});

    const activeLunch = activeLunchRaw
        ? {
            id: activeLunchRaw._id.toString(),
            image: activeLunchRaw.image ?? null,
            active: activeLunchRaw.active ?? false,
        }
        : null;

    const categories = categoriesRaw.map(c => ({
        id: c._id.toString(),
        name: c.name,
        parent: c.parent?.toString() ?? null,
        order: c.order ?? 0,
        showGroupTitle: c.showGroupTitle ?? true,
    }));

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
            <Box mx="auto" w={{base: "80%", sm: "60%", md: "400px"}} maxW="90vw" mb={{base: 4, md: 6}}>
                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={400}
                    height={200}
                    style={{width: "100%", height: "auto", objectFit: "contain"}}
                    priority
                />
            </Box>

            <MenuPageClient
                activeLunch={{image: activeLunch?.image}}
                navbar={{items: navItems}}
            />

            <Suspense fallback={<MenuLoader/>}>
                <ProductsServer alcoholIsVisible={alcoholIsVisible}/>
            </Suspense>

            <Footer/>
        </Box>
    );
};