import {Box} from "@chakra-ui/react";
import Image from "next/image";
import {connectToDatabase} from "@/lib/mongoose";
import {Category} from "@/models/category";
import {Lunch} from "@/models/lunch";
import {MenuPageClient} from "./menu-page-client";
import {Product as ProductDb, type ProductType} from "@/models/product";
import type {GroupWithProducts} from "@/app-pages/menu/products/types";
import {Products} from './products';
import {ComponentProps, Suspense} from "react";
import {MenuLoader} from "@/app-pages/menu/menu-loader";

export const MenuPage = async () => {
    await connectToDatabase();

    const [activeLunchDoc, categoriesDoc] = await Promise.all([
        Lunch.findOne({active: true}).lean(),
        Category.find({isMenuItem: true}).sort({order: 1}).lean()
    ]);

    const activeLunch = activeLunchDoc
        ? {
            id: activeLunchDoc._id.toString(),
            image: activeLunchDoc.image ?? null,
            active: activeLunchDoc.active ?? false,
        }
        : null;

    const categories = categoriesDoc.map(cat => ({
        id: cat._id.toString(),
        name: cat.name,
        parent: cat.parent?.toString() ?? null,
        order: cat.order ?? 0,
        showGroupTitle: cat.showGroupTitle ?? true,
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

    const [groupedDocs, uncategorizedDocs] = await Promise.all([
        ProductDb.aggregate<GroupWithProducts>([
            {
                $match: {
                    $and: [
                        {$or: [{hidden: {$exists: false}}, {hidden: false}]},
                        {categories: {$exists: true, $ne: []}},
                    ],
                },
            },
            {$unwind: "$categories"},
            {
                $lookup: {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categoryInfo",
                },
            },
            {$unwind: "$categoryInfo"},
            {$match: {"categoryInfo.hidden": {$ne: true}}},
            {
                $group: {
                    _id: "$categoryInfo._id",
                    categoryName: {$first: "$categoryInfo.name"},
                    categoryOrder: {$first: "$categoryInfo.order"},
                    showGroupTitle: {$first: "$categoryInfo.showGroupTitle"},
                    products: {$push: "$$ROOT"},
                },
            },
            {$sort: {categoryOrder: 1}},
        ]),
        ProductDb.find({
            $and: [
                {$or: [{hidden: {$exists: false}}, {hidden: false}]},
                {$or: [{categories: {$exists: false}}, {categories: {$size: 0}}]},
            ],
        })
            .lean<ProductType[]>()
            .exec(),
    ]);

    const grouped = groupedDocs.map(group => ({
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

    const uncategorized = uncategorizedDocs.map(p => ({
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

            <Suspense fallback={<MenuLoader />}>
                <MenuPageClient
                    activeLunch={{ image: activeLunch?.image }}
                    navbar={{ items: navItems }}
                    products={{
                        grouped,
                        uncategorized,
                    }}
                />
            </Suspense>
        </Box>
    );
};
