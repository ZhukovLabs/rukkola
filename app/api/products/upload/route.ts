import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/product';
import { sanitizeFileName } from "@/lib/sanitize";
import { optimizeImage } from '@/lib/image-optimize';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

        if (!id) {
            return NextResponse.json({ error: 'ID продукта обязателен' }, { status: 400 });
        }
        
        if (!file) {
            return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Размер файла превышает 10MB' }, { status: 400 });
        }

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json({ error: 'Неподдерживаемый формат файла' }, { status: 400 });
        }

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
        }

        if (product.image) {
            const oldFileName = product.image.split('/').pop();
            if (oldFileName) {
                const oldFilePath = path.join(UPLOAD_DIR, oldFileName);
                const normalizedOldPath = path.normalize(oldFilePath);
                
                if (normalizedOldPath.startsWith(UPLOAD_DIR)) {
                    try {
                        await fs.unlink(normalizedOldPath);
                    } catch {
                        // Игнорируем ошибку, если файл не существует
                    }
                }
            }
        }

        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const fileName = sanitizeFileName(product.name, '.webp');
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(UPLOAD_DIR)) {
            return NextResponse.json({ error: 'Некорректный путь файла' }, { status: 400 });
        }

        const originalBuffer = Buffer.from(await file.arrayBuffer());
        const optimizedBuffer = await optimizeImage(originalBuffer, { quality: 80 });
        await fs.writeFile(filePath, optimizedBuffer);

        product.image = `/api/products/image/${fileName}`;
        await product.save();

        return NextResponse.json({ image: product.image });
    } catch (err) {
        console.error('Error uploading product image:', err);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
};
