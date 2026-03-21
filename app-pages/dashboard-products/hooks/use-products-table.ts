import {useState} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {useSearchParams} from 'next/navigation'
import {getProducts, toggleProductVisibility, deleteProduct, toggleProductAlcohol} from '../actions'
import {useToast} from '@/components/toast-container'

export const useProductsTable = () => {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [deletePending, setDeletePending] = useState<string | null>(null)
    const [togglingAlcoholId, setTogglingAlcoholId] = useState<string | null>(null)

    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';

    const query = useQuery({
        queryKey: ['products', page, urlSearch, urlCategory],
        queryFn: () => getProducts(page, 10, urlSearch, urlCategory),
        placeholderData: (prev) => prev,
    })

    const toggleVisibility = useMutation({
        mutationFn: toggleProductVisibility,
        onMutate: (id: string) => setLoadingId(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (result.success && result.data) {
                toast.showSuccess(result.data.hidden ? 'Товар скрыт' : 'Товар отображается')
            }
        },
        onError: () => toast.showError('Не удалось изменить видимость товара'),
        onSettled: () => setLoadingId(null),
    })

    const toggleAlcohol = useMutation({
        mutationFn: toggleProductAlcohol,
        onMutate: (id: string) => setTogglingAlcoholId(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (result.success && result.data) {
                toast.showSuccess(result.data.isAlcohol ? 'Товар помечен как алкогольный' : 'Товар помечен как безалкогольный')
            }
        },
        onError: () => toast.showError('Не удалось изменить статус алкоголя'),
        onSettled: () => setTogglingAlcoholId(null),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onMutate: (id: string) => setDeletePending(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['products']}),
        onSettled: () => setDeletePending(null),
    })

    return {
        page,
        data: query.data?.data ?? {products: [], totalPages: 1},
        isFetching: query.isFetching,
        isPending: query.isPending,
        loadingId,
        deletePending,
        togglingAlcoholId,
        toggleVisibility,
        toggleAlcohol,
        deleteMutation
    }
}