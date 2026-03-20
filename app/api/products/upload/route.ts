import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/product';
import { sanitizeFileName } from "@/lib/sanitize";
import { optimizeImage } from '@/lib/image-optimize';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { uploadFile, deleteFile } from '@/lib/minio';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const POST = async (req: NextRequest) => {
    try {
        console.log('[Upload] Starting product upload...');
        const session = await auth();
        if (!session?.user?.id) {
            console.log('[Upload] Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('[Upload] User authenticated:', session.user.id);

        console.log('[Upload] Connecting to database...');
        await connectToDatabase();
        console.log('[Upload] Database connected');

        const formData = await req.formData();
        const id = formData.get('id') as string;
        const file = formData.get('file') as File;
        console.log('[Upload] Form data received, id:', id, 'file size:', file?.size);

        if (!id) {
            return NextResponse.json({ error: 'ID продукта обязателен' }, { status: 400 });
        }
        
        if (!file) {
            return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Размер файла превышает 10MB' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.has(`.${ext}`)) {
            return NextResponse.json({ error: 'Неподдерживаемый формат файла' }, { status: 400 });
        }

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
        }
        console.log('[Upload] Product found:', product._id);

        if (product.image) {
            const oldFileName = product.image.split('/').pop();
            if (oldFileName) {
                console.log('[Upload] Deleting old file:', oldFileName);
                try {
                    await deleteFile(`products/${decodeURIComponent(oldFileName)}`);
                } catch (e) {
                    console.log('[Upload] Old file delete error:', e);
                }
            }
        }

        const fileName = sanitizeFileName(product.name, '.webp');
        const objectName = `products/${fileName}`;

        console.log('[Upload] Processing image...');
        const originalBuffer = Buffer.from(await file.arrayBuffer());
        const optimizedBuffer = await optimizeImage(originalBuffer, { quality: 80 });
        console.log('[Upload] Image optimized, buffer size:', optimizedBuffer.length);
        
        console.log('[Upload] Uploading to MinIO:', objectName);
        await uploadFile(objectName, optimizedBuffer, 'image/webp');
        console.log('[Upload] Upload complete');

        product.image = `/api/products/image/${encodeURIComponent(fileName)}`;
        await product.save();
        console.log('[Upload] Product saved');

        return NextResponse.json({ image: product.image });
    } catch (err) {
        console.error('[Upload] Error:', err);
        return NextResponse.json({ error: 'Ошибка сервера', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
};