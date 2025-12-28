'use server'

import {Lunch, LunchType} from '@/models/lunch'
import {revalidatePath} from 'next/cache'
import {connectToDatabase} from '@/lib/mongoose'
import fs from 'fs'
import path from 'path'
import {checkAuth} from '@/lib/auth/actions'

export const getAllLunches = async () => {
    await checkAuth()
    await connectToDatabase()

    const lunches = await Lunch.find().sort({createdAt: -1}).lean()
    return JSON.parse(JSON.stringify(lunches))
}

export async function activeLunch(id: string) {
    await checkAuth()
    await connectToDatabase()

    const lunch: LunchType | null = await Lunch.findById(id)
    if (!lunch) {
        return {success: false, message: 'Обед не найден'}
    }

    await Lunch.updateMany({}, {$set: {active: false}})
    lunch.active = true
    await lunch.save()

    revalidatePath('/')
    revalidatePath('/dashboard/lunches')

    return {
        success: true,
        message: 'Обед активирован',
        data: {
            _id: lunch._id.toString(),
            image: lunch.image,
            active: lunch.active
        },
    }
}

export async function deactivateLunch() {
    await checkAuth()
    await connectToDatabase()

    await Lunch.updateMany({}, {$set: {active: false}})

    revalidatePath('/')
    revalidatePath('/dashboard/lunches')

    return {success: true, message: 'Все обеды деактивированы'}
}

export async function deleteLunch(id: string) {
    await checkAuth()
    await connectToDatabase()

    const lunch = await Lunch.findById(id)
    if (!lunch) {
        return {success: false, message: 'Обед не найден'}
    }

    const uploadsDir = path.resolve('uploads')
    const relativeImagePath = lunch.image
        ?.replace(/^\/?api\//, '')
        .replace(/^\/?image\//, '')
        .trim()

    if (relativeImagePath) {
        const fullPath = path.join(uploadsDir, relativeImagePath)

        try {
            await fs.promises.unlink(fullPath)
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                console.error('Ошибка при удалении файла:', err)
            }
        }
    }

    await Lunch.deleteOne({_id: id})

    revalidatePath('/')
    revalidatePath('/dashboard/lunches')

    return {success: true, message: 'Обед удалён', data: lunch}
}
