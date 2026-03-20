import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import sharp from "sharp";
import { getFile } from '@/lib/minio';

const cache = new LRUCache<string, { buffer: Buffer; contentType: string }>({ max: 500 });

function sendFile(buffer: Buffer, contentType: string) {
    return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, immutable",
        },
    });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        
        if (!filename || typeof filename !== 'string') {
            return NextResponse.json({ error: "Имя файла не указано" }, { status: 400 });
        }

        const decodedFilename = decodeURIComponent(filename);
        
        if (decodedFilename.includes('..') || decodedFilename.includes('/')) {
            return NextResponse.json({ error: "Некорректное имя файла" }, { status: 400 });
        }

        const objectName = `products/${decodedFilename}`;

        const { searchParams } = new URL(req.url);
        const width = searchParams.get("w") ? parseInt(searchParams.get("w")!, 10) : undefined;
        
        if (searchParams.get("w") && isNaN(width as number)) {
            return NextResponse.json({ error: "Некорректная ширина" }, { status: 400 });
        }

        const cacheKey = `${objectName}-${width || "original"}`;

        const cached = cache.get(cacheKey);
        if (cached) return sendFile(cached.buffer, cached.contentType);

        const originalBuffer = await getFile(objectName);
        if (!originalBuffer) {
            return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
        }
        let fileBuffer = originalBuffer;
        
        if (width && width > 0) {
            fileBuffer = Buffer.from(await sharp(originalBuffer)
                .resize(width, undefined, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer());
        }

        cache.set(cacheKey, { buffer: fileBuffer, contentType: "image/webp" });

        return sendFile(fileBuffer, "image/webp");
    } catch (err) {
        console.error('Error serving product image:', err);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}