import {connectToDatabase} from "@/lib/mongoose";
import {Lunch} from "@/models/lunch";
import {Category} from "@/models/category";
import {Product, type ProductType} from "@/models/product";
import type {GroupWithProducts} from "@/app-pages/menu/products/types";

export const CART_QUERY_KEY = 'cart';

const getLunch = () => (
    Lunch.findOne({active: true}).lean()
);

const getCategories = () => (
    Category.find({isMenuItem: true}).sort({order: 1}).lean()
);

const getGroupedProducts = () => (
    Product.aggregate<GroupWithProducts>([
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
    ])
);

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

export const getMenuData = async () => {
    await connectToDatabase();

    const [activeLunch, categories, groupedProducts, uncategorizedProduct] = await Promise.all([
        getLunch(),
        getCategories(),
        getGroupedProducts(),
        getUncategorizedProducts()
    ]);

    return {activeLunch, categories, groupedProducts, uncategorizedProduct}
}