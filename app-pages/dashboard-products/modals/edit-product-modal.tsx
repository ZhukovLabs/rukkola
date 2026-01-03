'use client'

import {useSearchParams, useRouter} from 'next/navigation'
import {useQuery} from '@tanstack/react-query'
import {getProductById, updateProductData} from '../actions'
import {ProductFormValues} from '@/app-pages/dashboard-products/validation'
import {BaseProductModal} from './base-product-modal'
import {uploadImageToApi} from "@/app-pages/dashboard-products/modals/api";

type Props = {
    refetch?: VoidFunction
}

export const EditProductModal = ({refetch}: Props) => {
    const searchParams = useSearchParams()
    const router = useRouter()
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
        await updateProductData(productId, {
            name: values.name,
            description: values.description ?? '',
            prices: values.prices,
            categories: values.categories ?? [],
            hidden: values.hidden,
        })

        if (file) await uploadImageToApi(productId, file);

        refetch?.();
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
                    }
                    : undefined
            }
            isLoadingInitial={isProductLoading}
            productIdForImageUpload={productId}
            refetch={refetch}
        />
    )
}