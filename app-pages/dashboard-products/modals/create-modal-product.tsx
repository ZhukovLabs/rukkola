'use client'

import {useSearchParams, useRouter} from 'next/navigation'
import {useQueryClient} from '@tanstack/react-query'
import {createProduct} from '../actions'
import {ProductFormValues} from '@/app-pages/dashboard-products/validation'
import {BaseProductModal} from './base-product-modal'
import {uploadImageToApi} from "@/app-pages/dashboard-products/modals/api";

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
    const isOpen = searchParams.has('create');

    const close = () => {
        const params = new URLSearchParams(window.location.search);
        params.delete('create');
        router.push(`?${params.toString()}`, {scroll: false});
    }

    const handleSubmit = async (values: Omit<ProductFormValues, 'imageFile'>, file?: File) => {
        const {data: {id} = {}} = await createProduct({
            name: values.name,
            description: values.description!,
            prices: values.prices,
            categories: values.categories ?? [],
            hidden: values.hidden,
            isAlcohol: values.isAlcohol
        })

        if (id && file) await uploadImageToApi(id, file);

        queryClient.invalidateQueries({queryKey: ['products']});
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