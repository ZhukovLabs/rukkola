'use client'

import {useSearchParams, useRouter} from 'next/navigation'
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

type Props = { refetch?: VoidFunction }

export const CreateProductModal = ({refetch}: Props) => {
    const searchParams = useSearchParams();
    const router = useRouter();
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

        refetch?.()
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
            refetch={refetch}
        />
    )
}