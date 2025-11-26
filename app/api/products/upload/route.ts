import fs from 'fs/promises';
import path from 'path';
import {NextRequest, NextResponse} from 'next/server';
import {Product} from '@/models/product';
import {sanitizeFileName} from "@/lib/sanitize";

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');

export const POST = async (req: NextRequest) => {
    try {
        const formData = await req.formData();
        const id = formData.get('id') as string;
        const file = formData.get('file') as File;

        if (!file || !id) return NextResponse.json({error: 'Missing file or id'}, {status: 400});

        const product = await Product.findById(id);
        if (!product) return NextResponse.json({error: 'Product not found'}, {status: 404});

        await fs.mkdir(UPLOAD_DIR, {recursive: true});

        const ext = path.extname(file.name).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            return NextResponse.json({error: 'Unsupported file type'}, {status: 400});
        }

        const fileName = sanitizeFileName(product.name, ext);
        const filePath = path.join(UPLOAD_DIR, fileName);

        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));

        product.image = `/api/products/image/${fileName}`;
        await product.save();

        return NextResponse.json({image: product.image});
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: 'Internal server error'}, {status: 500});
    }
};
