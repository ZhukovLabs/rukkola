'use client'

import {useSearchParams, useRouter} from 'next/navigation'
import {useQueryClient} from '@tanstack/react-query'
import {createProduct} from '../actions'
import {ProductFormValues} from '@/app-pages/dashboard-products/validation'
import {BaseProductModal} from './base-product-modal'
import {uploadImageToApi} from "@/app-pages/dashboard-products/modals/api";
import {useToast} from '@/components/toast-container';

const initialValues = {
    name: '',
    description: '',
    prices: [{size: '', price: 0}],
    categories: [],
    hidden: false,
};

export const CreateProductModal = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const toast = useToast();
    const isOpen = searchParams.has('create');

    const close = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('create');
        router.push(`?${params.toString()}`, {scroll: false});
    }

    const handleSubmit = async (values: Omit<ProductFormValues, 'imageFile'>, file?: File) => {
        try {
            const result = await createProduct({
                name: values.name,
                description: values.description!,
                prices: values.prices,
                categories: values.categories ?? [],
                hidden: values.hidden,
                isAlcohol: values.isAlcohol
            })

            if (!result.success) {
                toast.showError(result.message || 'Ошибка при создании товара')
                throw new Error(result.message || 'Ошибка при создании товара')
            }

            const id = result.data?.id
            if (id && file) await uploadImageToApi(id, file);

            queryClient.invalidateQueries({queryKey: ['products']});
            toast.showSuccess('Товар успешно создан')
        } catch (err) {
            if (!err || typeof err === 'object' && 'message' in err) {
                // Error already shown via toast above
            } else {
                toast.showError('Ошибка при создании товара')
            }
            throw err
        }
    }

    return (
        <BaseProductModal
            isOpen={isOpen}
            onClose={close}
            title="Создать товар"
            submitText="Создать"
            submitLoadingText="Создание..."
            onSubmit={handleSubmit}
            initialValues={initialValues}
        />
    )
}