'use server'

import {Lunch, LunchType} from '@/models/lunch'
import {revalidatePath, revalidateTag} from 'next/cache'
import {connectToDatabase} from '@/lib/mongoose'
import {deleteFile} from '@/lib/minio'
import {checkAuth} from '@/lib/auth/check-auth'
import {ActionResponse} from '@/types'
import {CACHE_TAGS} from '@/app-pages/menu/config';

function revalidateMenuCache() {
    revalidatePath('/', 'layout');
    const tags = [
        CACHE_TAGS.CATEGORIES,
        CACHE_TAGS.LUNCHES,
        CACHE_TAGS.MENU_WITH_ALCOHOL,
        CACHE_TAGS.MENU_NO_ALCOHOL,
        CACHE_TAGS.PRODUCTS_WITH_ALCOHOL,
        CACHE_TAGS.PRODUCTS_NO_ALCOHOL,
    ];
    for (const tag of tags) {
        revalidateTag(tag, '');
    }
}

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

    revalidateMenuCache();
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

    revalidateMenuCache();
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

    if (lunch.image) {
        const fileName = lunch.image.split('/').pop()
        if (fileName) {
            try {
                await deleteFile(`lunches/${decodeURIComponent(fileName)}`)
            } catch {
                // File may not exist in storage
            }
        }
    }

    await Lunch.deleteOne({_id: id})

    revalidateMenuCache();
    revalidatePath('/dashboard/lunches')

    return {success: true, message: 'Обед удалён'}
}