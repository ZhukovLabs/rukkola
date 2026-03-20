import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { LRUCache } from "lru-cache";
import sharp from "sharp";

const cache = new LRUCache<string, { buffer: Buffer; contentType: string; width?: number }>({ max: 500 });
const uploadDir = path.join(process.cwd(), "uploads", "products");

interface CacheEntry {
    buffer: Buffer;
    contentType: string;
    width?: number;
}

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
    const { filename } = await params;
    if (!filename) return NextResponse.json({ error: "Filename is required" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const width = searchParams.get("w") ? parseInt(searchParams.get("w")!) : undefined;
    const cacheKey = `${filename}-${width || "original"}`;

    const cached = cache.get(cacheKey);
    if (cached) return sendFile(cached.buffer, cached.contentType);

    const filePath = path.join(uploadDir, filename);
    if (!filePath.startsWith(uploadDir)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    try {
        const originalBuffer = await fs.readFile(filePath);
        let fileBuffer = originalBuffer;
        
        if (width) {
            fileBuffer = Buffer.from(await sharp(originalBuffer)
                .resize(width, undefined, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer());
        }

        cache.set(cacheKey, { buffer: fileBuffer, contentType: "image/webp", width });

        return sendFile(fileBuffer, "image/webp");
    } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "ENOENT") return NextResponse.json({ error: "File not found" }, { status: 404 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
