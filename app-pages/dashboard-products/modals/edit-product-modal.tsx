'use client'

import {useSearchParams, useRouter} from 'next/navigation'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {getProductById, updateProductData} from '../actions'
import {ProductFormValues} from '@/app-pages/dashboard-products/validation'
import {BaseProductModal} from './base-product-modal'
import {uploadImageToApi} from "@/app-pages/dashboard-products/modals/api";
import {useToast} from '@/components/toast-container';

export const EditProductModal = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const toast = useToast()
    const productId = searchParams.get('edit') ?? ''
    const isOpen = Boolean(productId)

    const {
        data: productData,
        isLoading: isProductLoading
    } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getProductById(productId),
        enabled: isOpen,
    })

    const product = productData?.data;

    const close = () => {
        const params = new URLSearchParams(window.location.search)
        params.delete('edit')
        router.push(`?${params.toString()}`, {scroll: false})
    }

    const handleSubmit = async (values: Omit<ProductFormValues, 'imageFile'>, file?: File) => {
        try {
            const result = await updateProductData(productId, {
                name: values.name,
                description: values.description ?? '',
                prices: values.prices,
                categories: values.categories ?? [],
                hidden: values.hidden,
                isAlcohol: values.isAlcohol,
            })

            if (!result.success) {
                toast.showError(result.message || 'Ошибка при обновлении товара')
                throw new Error(result.message || 'Ошибка при обновлении товара')
            }

            if (file) await uploadImageToApi(productId, file);

            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['product', productId]});
            toast.showSuccess('Товар успешно обновлён')
        } catch (err) {
            if (!err || typeof err === 'object' && 'message' in err) {
                // Error already shown via toast above
            } else {
                toast.showError('Ошибка при обновлении товара')
            }
            throw err
        }
    }

    return (
        <BaseProductModal
            isOpen={isOpen}
            onClose={close}
            title="Редактировать товар"
            submitText="Сохранить"
            submitLoadingText="Сохранение..."
            onSubmit={handleSubmit}
            initialValues={
                product
                    ? {
                        name: product.name ?? '',
                        description: product.description ?? '',
                        prices: product.prices?.length ? product.prices : [{size: '', price: 0}],
                        categories: product.categories?.map((c) => String(c.id)) ?? [],
                        hidden: Boolean(product.hidden),
                        image: product.image,
                        isAlcohol: product.isAlcohol ?? false,
                    }
                    : undefined
            }
            isLoadingInitial={isProductLoading}
            productIdForImageUpload={productId}
        />
    )
}