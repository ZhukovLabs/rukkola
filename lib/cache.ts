import { revalidateTag, revalidatePath } from 'next/cache'
import { CACHE_TAGS } from '@/app-pages/menu/config'

export function revalidateMenuCache(): void {
    revalidatePath('/', 'layout')
    
    const tags = [
        CACHE_TAGS.CATEGORIES,
        CACHE_TAGS.LUNCHES,
        CACHE_TAGS.MENU_WITH_ALCOHOL,
        CACHE_TAGS.MENU_NO_ALCOHOL,
        CACHE_TAGS.PRODUCTS_WITH_ALCOHOL,
        CACHE_TAGS.PRODUCTS_NO_ALCOHOL,
    ] as string[]
    
    for (const tag of tags) {
        revalidateTag(tag, 'max')
    }
}