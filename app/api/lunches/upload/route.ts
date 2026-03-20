import fs from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { Lunch } from '@/models/lunch'
import { optimizeImage } from '@/lib/image-optimize'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'

export const POST = async (req: NextRequest) => {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    await connectToDatabase()

    const uploadDir = path.join(process.cwd(), 'uploads', 'lunches')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const safeName = `lunch-${Date.now()}.webp`
    const filePath = path.join(uploadDir, safeName)

    const buffer = Buffer.from(await file.arrayBuffer())
    const optimizedBuffer = await optimizeImage(buffer, { quality: 80 })
    fs.writeFileSync(filePath, optimizedBuffer)

    const imageUrl = `/api/lunches/image/${safeName}`

    const lunch = new Lunch({ image: imageUrl })
    await lunch.save()

    return NextResponse.json({ image: imageUrl, id: lunch._id })
}
