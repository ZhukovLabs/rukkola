import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { LRUCache } from "lru-cache";
import mime from "mime";

const cache = new LRUCache<string, { buffer: Buffer; contentType: string }>({ max: 200 });
const uploadDir = path.join(process.cwd(), "uploads", "products");

function sendFile(buffer: Buffer, contentType: string) {
    return new NextResponse(new Uint8Array(buffer), {
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

    const cached = cache.get(filename);
    if (cached) return sendFile(cached.buffer, cached.contentType);

    const filePath = path.join(uploadDir, filename);
    if (!filePath.startsWith(uploadDir)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    try {
        const fileBuffer = await fs.readFile(filePath);
        const contentType =
            mime.getType(filename) || (path.extname(filename).toLowerCase() === ".jpg" ? "image/jpeg" : "application/octet-stream");

        cache.set(filename, { buffer: fileBuffer, contentType });

        return sendFile(fileBuffer, contentType);
    } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "ENOENT") return NextResponse.json({ error: "File not found" }, { status: 404 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
