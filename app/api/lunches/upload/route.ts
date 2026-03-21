import { NextRequest, NextResponse } from 'next/server'
import { Lunch } from '@/models/lunch'
import { optimizeImage } from '@/lib/image-optimize'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { uploadFile } from '@/lib/minio'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/app-pages/menu/config'

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MAX_FILE_SIZE = 10 * 1024 * 1024

export const POST = async (req: NextRequest) => {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Размер файла превышает 10MB' }, { status: 400 })
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        if (!ALLOWED_EXTENSIONS.has(`.${ext}`)) {
            return NextResponse.json({ error: 'Неподдерживаемый формат файла' }, { status: 400 })
        }

        await connectToDatabase()

        const fileName = `lunch-${Date.now()}.webp`

        const buffer = Buffer.from(await file.arrayBuffer())
        const optimizedBuffer = await optimizeImage(buffer, { quality: 80 })
        
        await uploadFile(`lunches/${fileName}`, optimizedBuffer, 'image/webp')

        const imageUrl = `/api/lunches/image/${encodeURIComponent(fileName)}`

        const lunch = new Lunch({ image: imageUrl })
        await lunch.save()

        revalidatePath('/', 'layout')
        for (const tag of Object.values(CACHE_TAGS)) {
            revalidateTag(tag, '')
        }

        return NextResponse.json({ image: imageUrl, id: lunch._id.toString() })
    } catch (error) {
        console.error('Error uploading lunch image:', error)
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
    }
}