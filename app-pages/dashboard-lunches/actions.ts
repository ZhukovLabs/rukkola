'use server'

import {Lunch, LunchType} from '@/models/lunch'
import {revalidatePath} from 'next/cache'
import {connectToDatabase} from '@/lib/mongoose'
import {deleteFile} from '@/lib/minio'
import {checkAuth} from '@/lib/auth/check-auth'
import {revalidateMenuCache} from '@/lib/cache'
import {ActionResponse} from '@/types'

type LunchData = {
    _id: { toString: () => string }
    image: string
    active: boolean
}

export const getAllLunches = async (): Promise<ActionResponse<LunchData[]>> => {
    try {
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
    } catch (error) {
        console.error('getAllLunches error:', error)
        return {success: false, message: 'Ошибка при получении списка обедов'}
    }
}

export async function activeLunch(id: string): Promise<ActionResponse<{ _id: string; image: string; active: boolean }>> {
    try {
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
    } catch (error) {
        console.error('activeLunch error:', error)
        return {success: false, message: 'Ошибка при активации обеда'}
    }
}

export async function deactivateLunch(): Promise<ActionResponse> {
    try {
        const user = await checkAuth()
        if (!user) {
            return {success: false, message: 'Необходима авторизация'}
        }
        
        await connectToDatabase()

        await Lunch.updateMany({}, {$set: {active: false}})

        revalidateMenuCache();
        revalidatePath('/dashboard/lunches')

        return {success: true, message: 'Все обеды деактивированы'}
    } catch (error) {
        console.error('deactivateLunch error:', error)
        return {success: false, message: 'Ошибка при деактивации обедов'}
    }
}

export async function deleteLunch(id: string): Promise<ActionResponse> {
    try {
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
    } catch (error) {
        console.error('deleteLunch error:', error)
        return {success: false, message: 'Ошибка при удалении обеда'}
    }
}