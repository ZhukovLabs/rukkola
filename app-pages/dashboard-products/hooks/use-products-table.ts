import {useState} from 'react'
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {useSearchParams} from 'next/navigation'
import {getProducts, toggleProductVisibility, deleteProduct, toggleProductAlcohol, reorderProducts, moveProductToPosition} from '../actions'
import {useToast} from '@/components/toast-container'

export const useProductsTable = () => {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [deletePending, setDeletePending] = useState<string | null>(null)
    const [togglingAlcoholId, setTogglingAlcoholId] = useState<string | null>(null)
    const [movingId, setMovingId] = useState<string | null>(null)

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
            } else {
                toast.showError(result.message || 'Не удалось изменить видимость товара')
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
            } else {
                toast.showError(result.message || 'Не удалось изменить статус алкоголя')
            }
        },
        onError: () => toast.showError('Не удалось изменить статус алкоголя'),
        onSettled: () => setTogglingAlcoholId(null),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onMutate: (id: string) => setDeletePending(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (result.success) {
                toast.showSuccess('Товар удалён')
            } else {
                toast.showError(result.message || 'Не удалось удалить товар')
            }
        },
        onError: () => toast.showError('Не удалось удалить товар'),
        onSettled: () => setDeletePending(null),
    })

    const reorderMutation = useMutation({
        mutationFn: reorderProducts,
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (!result.success) {
                toast.showError(result.message || 'Не удалось обновить порядок')
            }
        },
        onError: () => toast.showError('Не удалось обновить порядок'),
    })

    const moveMutation = useMutation({
        mutationFn: ({productId, newPosition}: {productId: string; newPosition: number}) =>
            moveProductToPosition(productId, newPosition, urlSearch || undefined, urlCategory || undefined),
        onMutate: ({productId}) => setMovingId(productId),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (result.success) {
                toast.showSuccess('Позиция товара обновлена')
            } else {
                toast.showError(result.message || 'Не удалось обновить позицию')
            }
        },
        onError: () => toast.showError('Не удалось обновить позицию'),
        onSettled: () => setMovingId(null),
    })

    return {
        page,
        search: urlSearch,
        category: urlCategory,
        data: query.data?.data ?? {products: [], totalPages: 1, total: 0},
        isFetching: query.isFetching,
        isPending: query.isPending,
        loadingId,
        deletePending,
        togglingAlcoholId,
        movingId,
        toggleVisibility,
        toggleAlcohol,
        deleteMutation,
        reorderMutation,
        moveMutation,
    }
}