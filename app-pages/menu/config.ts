import {connectToDatabase} from "@/lib/mongoose";
import {Lunch} from "@/models/lunch";
import {Category} from "@/models/category";
import {Product, type ProductType} from "@/models/product";
import type {GroupWithProducts} from "@/app-pages/menu/products/types";

export const CART_QUERY_KEY = 'cart';

const getLunch = () => (
    Lunch.findOne({active: true}).lean()
);

const getCategories = async (withAlcohol: boolean = false) => {
    try {
        const productQuery: any = {
            hidden: false,
            categories: {$exists: true, $ne: []}
        };

        if (!withAlcohol) {
            productQuery.$or = [
                {isAlcohol: false},
                {isAlcohol: {$exists: false}}
            ];
        }

        const categoryIdsWithProducts = await Product.distinct('categories', productQuery);

        return Category.aggregate([
            {
                $match: {
                    isMenuItem: true,
                    $or: [
                        {_id: {$in: categoryIdsWithProducts}},
                        {
                            _id: {
                                $in: await Category.distinct('parent', {
                                    _id: {$in: categoryIdsWithProducts},
                                    parent: {$ne: null}
                                })
                            }
                        }
                    ]
                }
            },
            {$sort: {order: 1}}
        ]);

    } catch (error) {
        console.error('Error in getCategories:', error);
        return [];
    }
};

const getGroupedProducts = (withAlcohol: boolean = false) => {
    return Product.aggregate<GroupWithProducts>([
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $or: [
                                {$eq: [{$ifNull: ["$hidden", false]}, false]},
                                {$eq: [{$type: "$hidden"}, "missing"]}
                            ]
                        },
                        {
                            $and: [
                                {$ne: [{$type: "$categories"}, "missing"]},
                                {$gt: [{$size: {$ifNull: ["$categories", []]}}, 0]}
                            ]
                        },
                        ...(withAlcohol ? [] : [
                            {
                                $or: [
                                    {$eq: ["$isAlcohol", false]},
                                    {$eq: [{$type: "$isAlcohol"}, "missing"]}
                                ]
                            }
                        ])
                    ]
                }
            }
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
    ]);
};

const getUncategorizedProducts = () => (
    Product.find({
        $and: [
            {$or: [{hidden: {$exists: false}}, {hidden: false}]},
            {$or: [{categories: {$exists: false}}, {categories: {$size: 0}}]},
        ],
    })
        .lean<ProductType[]>()
        .exec()
);

export const getMenuData = async ({getAlcohol}: { getAlcohol: boolean }) => {
    await connectToDatabase();

    const [activeLunch, categories] = await Promise.all([
        getLunch(),
        getCategories(getAlcohol)
    ]);

    return {activeLunch, categories}
}

export const getProducts = async ({getAlcohol}: { getAlcohol: boolean }) => {
    await connectToDatabase();

    const [groupedProducts, uncategorizedProduct] = await Promise.all([
        getGroupedProducts(getAlcohol),
        getUncategorizedProducts()
    ]);

    return {groupedProducts, uncategorizedProduct}
}