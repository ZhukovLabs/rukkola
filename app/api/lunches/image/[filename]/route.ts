import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, { buffer: Buffer; contentType: string; width?: number }>({ max: 200 });
const uploadDir = path.join(process.cwd(), 'uploads', 'lunches')

function sendFile(buffer: Buffer, contentType: string) {
    return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
        },
    });
}

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) => {
    const { filename } = await params;
    const { searchParams } = new URL(req.url);
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const cacheKey = `${filename}-${width || 'original'}`;

    const cached = cache.get(cacheKey);
    if (cached) return sendFile(cached.buffer, cached.contentType);

    const filePath = path.join(uploadDir, filename)

    if (!fs.existsSync(filePath))
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    const originalBuffer = fs.readFileSync(filePath);
    let fileBuffer = originalBuffer;

    if (width) {
        fileBuffer = Buffer.from(await sharp(originalBuffer)
            .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer());
    }

    cache.set(cacheKey, { buffer: fileBuffer, contentType: 'image/webp', width });

    return sendFile(fileBuffer, 'image/webp');
}
