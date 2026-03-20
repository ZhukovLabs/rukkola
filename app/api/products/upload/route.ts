import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/product';
import { sanitizeFileName } from "@/lib/sanitize";
import { optimizeImage } from '@/lib/image-optimize';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const POST = async (req: NextRequest) => {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const formData = await req.formData();
        const id = formData.get('id') as string;
        const file = formData.get('file') as File;

        if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

        const product = await Product.findById(id);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const fileName = sanitizeFileName(product.name, '.webp');
        const filePath = path.join(UPLOAD_DIR, fileName);

        const originalBuffer = Buffer.from(await file.arrayBuffer());
        const optimizedBuffer = await optimizeImage(originalBuffer, { quality: 80 });
        await fs.writeFile(filePath, optimizedBuffer);

        product.image = `/api/products/image/${fileName}`;
        await product.save();

        return NextResponse.json({ image: product.image });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
