import {Box} from "@chakra-ui/react";
import {connectToDatabase} from "@/lib/mongoose";
import {Product as ProductDb} from "@/models/product";
import {ProductGroup} from "./product-group";
import type {ProductType} from "@/models/product";
import type {GroupWithProducts} from "./types";


export const Products = async () => {
    await connectToDatabase();

    const [grouped, uncategorized] = await Promise.all([
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
            {
                $match: {
                    "categoryInfo.hidden": {$ne: true},
                },
            },
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

    return (
        <Box color="white" minH="100vh" p={2}>
            {grouped.map((cat) => (
                <ProductGroup
                    key={cat._id.toString()}
                    id={cat._id.toString()}
                    title={cat.showGroupTitle ? cat.categoryName : undefined}
                    products={cat.products}
                />
            ))}

            {uncategorized.length > 0 && (
                <ProductGroup title="Без категории" products={uncategorized}/>
            )}
        </Box>
    );
};
