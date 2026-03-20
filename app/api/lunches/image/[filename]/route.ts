import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, { buffer: Buffer; contentType: string }>({ max: 200 })
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'lunches')

function sendFile(buffer: Buffer, contentType: string) {
    return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
        },
    })
}

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) => {
    try {
        const { filename } = await params
        
        if (!filename || typeof filename !== 'string') {
            return NextResponse.json({ error: 'Имя файла не указано' }, { status: 400 })
        }

        const sanitizedFilename = path.basename(filename)
        if (sanitizedFilename !== filename || filename.includes('..')) {
            return NextResponse.json({ error: 'Некорректное имя файла' }, { status: 400 })
        }

        const { searchParams } = new URL(req.url)
        const width = searchParams.get('w') ? parseInt(searchParams.get('w')!, 10) : undefined
        
        if (searchParams.get('w') && isNaN(width as number)) {
            return NextResponse.json({ error: 'Некорректная ширина' }, { status: 400 })
        }

        const cacheKey = `${filename}-${width || 'original'}`

        const cached = cache.get(cacheKey)
        if (cached) return sendFile(cached.buffer, cached.contentType)

        const filePath = path.join(UPLOAD_DIR, sanitizedFilename)
        const normalizedPath = path.normalize(filePath)
        
        if (!normalizedPath.startsWith(UPLOAD_DIR)) {
            return NextResponse.json({ error: 'Некорректный путь' }, { status: 400 })
        }

        const originalBuffer = await fs.readFile(filePath)
        let fileBuffer = originalBuffer

        if (width && width > 0) {
            fileBuffer = Buffer.from(await sharp(originalBuffer)
                .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer())
        }

        cache.set(cacheKey, { buffer: fileBuffer, contentType: 'image/webp' })

        return sendFile(fileBuffer, 'image/webp')
    } catch (error) {
        const err = error as NodeJS.ErrnoException
        if (err.code === 'ENOENT') {
            return NextResponse.json({ error: 'Файл не найден' }, { status: 404 })
        }
        console.error('Error serving lunch image:', error)
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
    }
}
