import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {MenuPageClient} from "./menu-page-client";
import {Products} from './products';
import {ComponentProps, Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";
import {getMenuData} from "./config";

export const MenuPage = async () => {
    const {
        activeLunch: activeLunchRaw,
        categories: categoriesRaw,
        groupedProducts: groupedProductsRaw,
        uncategorizedProduct: uncategorizedProductRaw
    } = await getMenuData();

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

    const grouped = groupedProductsRaw.map(group => ({
        id: group._id.toString(),
        categoryName: group.categoryName,
        categoryOrder: group.categoryOrder ?? 0,
        showGroupTitle: group.showGroupTitle ?? true,
        products: group.products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description ?? null,
            image: p.image ?? null,
            prices: p.prices ?? [],
            hidden: p.hidden ?? false,
            categories: Array.isArray(p.categories) ? p.categories.map(String) : [],
        })),
    })) as unknown as ComponentProps<typeof Products>['grouped'];

    const uncategorized = uncategorizedProductRaw.map(p => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description ?? null,
        image: p.image ?? null,
        prices: p.prices ?? [],
        hidden: p.hidden ?? false,
        categories: p.categories?.map(c => c.toString()) ?? [],
    })) as unknown as ComponentProps<typeof Products>['uncategorized'];

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

            <Suspense fallback={<MenuLoader/>}>
                <MenuPageClient
                    activeLunch={{image: activeLunch?.image}}
                    navbar={{items: navItems}}
                    products={{
                        grouped,
                        uncategorized,
                    }}
                />
            </Suspense>
        </Box>
    );
};
