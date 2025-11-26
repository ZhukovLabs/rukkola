'use server';


import {connectToDatabase} from "@/lib/mongoose";
import {Product} from "@/models/product";

export async function getProductById(id: string) {
    try {
        await connectToDatabase();
        const product = await Product.findById(id).lean();
        if (!product) return null;

        return {
            id: product._id.toString(),
            image: product.image,
            name: product.name,
            description: product.description
        };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null;
    }
}