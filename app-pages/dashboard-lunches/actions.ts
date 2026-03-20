'use server'

import {Lunch, LunchType} from '@/models/lunch'
import {revalidatePath} from 'next/cache'
import {connectToDatabase} from '@/lib/mongoose'
import fs from 'fs'
import path from 'path'
import {checkAuth} from '@/lib/auth/check-auth'
import {clearMenuCache} from '@/app-pages/menu/config'
import {ActionResponse} from '@/types'

type LunchData = {
    _id: { toString: () => string }
    image: string
    active: boolean
}

export const getAllLunches = async (): Promise<ActionResponse<LunchData[]>> => {
    const user = await checkAuth()
    if (!user) {
        return {success: false, message: 'Необходима авторизация'}
    }
    
    await connectToDatabase()

    const lunches = await Lunch.find().sort({createdAt: -1}).lean<LunchType[]>()
    return {
        success: true,
        message: 'Список обедов получен',
        data: JSON.parse(JSON.stringify(lunches))
    }
}

export async function activeLunch(id: string): Promise<ActionResponse<{ _id: string; image: string; active: boolean }>> {
    const user = await checkAuth()
    if (!user) {
        return {success: false, message: 'Необходима авторизация'}
    }
    
    await connectToDatabase()

    const lunch: LunchType | null = await Lunch.findById(id)
    if (!lunch) {
        return {success: false, message: 'Обед не найден'}
    }

    await Lunch.updateMany({}, {$set: {active: false}})
    lunch.active = true
    await lunch.save()

    clearMenuCache();
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

export async function deactivateLunch(): Promise<ActionResponse> {
    const user = await checkAuth()
    if (!user) {
        return {success: false, message: 'Необходима авторизация'}
    }
    
    await connectToDatabase()

    await Lunch.updateMany({}, {$set: {active: false}})

    clearMenuCache();
    revalidatePath('/')
    revalidatePath('/dashboard/lunches')

    return {success: true, message: 'Все обеды деактивированы'}
}

export async function deleteLunch(id: string): Promise<ActionResponse> {
    const user = await checkAuth()
    if (!user) {
        return {success: false, message: 'Необходима авторизация'}
    }
    
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
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.error('Ошибка при удалении файла:', err)
            }
        }
    }

    await Lunch.deleteOne({_id: id})

    clearMenuCache();
    revalidatePath('/')
    revalidatePath('/dashboard/lunches')

    return {success: true, message: 'Обед удалён'}
}
