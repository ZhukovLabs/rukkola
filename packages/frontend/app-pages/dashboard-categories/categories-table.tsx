'use client'

import React, { useState } from 'react'
import {
    Box,
    Card,
    Flex,
    IconButton,
    Input,
    Table,
    Text,
    Spinner,
    Checkbox,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiFolder,
    FiMove,
} from 'react-icons/fi'
import { FaWineBottle, FaWineGlassAlt } from 'react-icons/fa'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
type CategoryType = {
    id: string;
    _id: { toString(): string };
    name: string;
    order: number;
    isMenuItem: boolean;
    showGroupTitle: boolean;
    parent?: { toString(): string } | null;
    hidden?: boolean;
}
import {
    toggleCategoryField,
    reorderCategories,
    updateCategoryName,
    deleteCategory,
    markCategoryProductsAlcohol,
    markCategoryProductsNonAlcohol,
    moveCategoryToPosition,
} from './actions'
import { Tooltip } from '@/components/tooltip'
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog"
import { useToast } from "@/components/toast-container"
import { CategoryPositionDialog } from './category-position-dialog'
import { revalidateMenu } from '@/lib/api/revalidate'

type CategoryData = {
    id: string;
    _id: string;
    name: string;
    order: number;
    isMenuItem: boolean;
    showGroupTitle: boolean;
    parent?: string | null;
}

type CategoryWithChildren = CategoryData & {
    children?: CategoryWithChildren[]
}

type Props = { categories: CategoryType[] }

function toCategoryData(cat: CategoryType): CategoryData {
    return {
        id: cat.id || cat._id.toString(),
        _id: cat._id.toString(),
        name: cat.name,
        order: cat.order,
        isMenuItem: cat.isMenuItem,
        showGroupTitle: cat.showGroupTitle,
        parent: cat.parent?.toString() || null,
    }
}

function buildCategoryTree(categories: CategoryType[]): CategoryWithChildren[] {
    const map = new Map<string, CategoryWithChildren>()
    const roots: CategoryWithChildren[] = []

    for (const cat of categories) {
        const data = toCategoryData(cat)
        map.set(data._id, { ...data, children: []})
    }

    for (const cat of categories) {
        const data = toCategoryData(cat)
        const node = map.get(data._id)!
        if (data.parent) {
            const parent = map.get(data.parent)
            if (parent) {
                parent.children = parent.children || []
                parent.children.push(node)
            }
        } else {
            roots.push(node)
        }
    }

    const sortChildren = (nodes: CategoryWithChildren[]) => {
        nodes.sort((a, b) => a.order - b.order)
        for (const node of nodes) {
            if (node.children) sortChildren(node.children)
        }
    }
    sortChildren(roots)

    return roots
}

function flattenCategoryTree(
    nodes: CategoryWithChildren[],
    depth = 0
): { category: CategoryWithChildren; depth: number }[] {
    const result: { category: CategoryWithChildren; depth: number }[] = []
    for (const node of nodes) {
        result.push({ category: node, depth })
        if (node.children?.length) {
            result.push(...flattenCategoryTree(node.children, depth + 1))
        }
    }
    return result
}

interface SortableRowProps {
    category: CategoryWithChildren
    depth: number
    position: number
    totalSiblings: number
    isEditing: boolean
    tempName: string
    setTempName: (name: string) => void
    onEditStart: (cat: CategoryData) => void
    onNameSave: (id: string) => void
    onNameCancel: () => void
    onDelete: (id: string) => void
    onMarkAlcohol: (id: string) => void
    onMarkNonAlcohol: (id: string) => void
    onToggleField: (id: string, field: 'isMenuItem' | 'showGroupTitle') => void
    onMoveToPosition: (id: string, position: number) => void
    isToggling: boolean
    isDeleting: boolean
    isUpdatingName: boolean
    isMarkingAlcohol: boolean
    isMarkingNonAlcohol: boolean
    isMoving: boolean
    siblingsCount: number
    indexInSiblings: number
}

function SortableRow({
    category,
    depth,
    position,
    totalSiblings,
    isEditing,
    tempName,
    setTempName,
    onEditStart,
    onNameSave,
    onNameCancel,
    onDelete,
    onMarkAlcohol,
    onMarkNonAlcohol,
    onToggleField,
    onMoveToPosition,
    isToggling,
    isDeleting,
    isUpdatingName,
    isMarkingAlcohol,
    isMarkingNonAlcohol,
    isMoving,
}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category._id.toString() })

    const style = {
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <Table.Row
            ref={setNodeRef}
            style={style}
            bg={depth % 2 === 0 ? 'gray.900' : 'gray.850'}
            borderBottom="1px solid"
            borderColor="gray.700"
            _hover={{ bg: 'gray.800', transition: '0.2s ease' }}
        >
            <Table.Cell p={4}>
                <Flex align="center" gap={3} pl={depth * 6}>
                    <CategoryPositionDialog
                        currentPosition={position}
                        totalItems={totalSiblings}
                        depth={depth}
                        onMove={(pos) => onMoveToPosition(category._id.toString(), pos)}
                        isLoading={isMoving}
                    />

                    <Box
                        {...attributes}
                        {...listeners}
                        cursor="grab"
                        color="gray.500"
                        _hover={{ color: 'teal.400' }}
                        transition="color 0.2s"
                        display="flex"
                        alignItems="center"
                    >
                        <FiMove size={16}/>
                    </Box>

                    {depth > 0 && (
                        <Box
                            borderLeft="2px dashed"
                            borderColor="teal.600"
                            height="20px"
                            opacity={0.5}
                        />
                    )}

                    {isEditing ? (
                        <Input
                            size="sm"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onNameSave(category._id.toString())
                                if (e.key === 'Escape') onNameCancel()
                            }}
                            autoFocus
                            bg="gray.700"
                            color="teal.300"
                            borderColor="teal.500"
                            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
                            width="250px"
                        />
                    ) : (
                        <Text fontWeight="semibold" color="teal.400" flex={1}>
                            {category.name}
                        </Text>
                    )}
                </Flex>
            </Table.Cell>

            <Table.Cell p={4} textAlign="center">
                <Tooltip content={category.isMenuItem ? 'Отображается в меню' : 'Скрыто из меню'}
                         openDelay={400}>
                    <Box display="inline-flex">
                        <Checkbox.Root
                            checked={category.isMenuItem}
                            onCheckedChange={() =>
                                onToggleField(category._id.toString(), 'isMenuItem')
                            }
                            disabled={isToggling}
                        >
                            <Checkbox.HiddenInput/>
                            <Checkbox.Control
                                bg="gray.700"
                                borderColor="teal.500"
                                _checked={{
                                    bg: 'teal.500',
                                    borderColor: 'teal.400',
                                    boxShadow: '0 0 6px 1px rgba(56,178,172,0.5)',
                                }}
                                _hover={{ borderColor: 'teal.400' }}
                                transition="all 0.2s"
                            >
                                <Checkbox.Indicator color="black"/>
                            </Checkbox.Control>
                        </Checkbox.Root>
                    </Box>
                </Tooltip>
            </Table.Cell>

            <Table.Cell p={4} textAlign="center">
                <Tooltip content={category.showGroupTitle ? 'Заголовок виден' : 'Заголовок скрыт'}
                         openDelay={400}>
                    <Box display="inline-flex">
                        <Checkbox.Root
                            checked={category.showGroupTitle}
                            onCheckedChange={() =>
                                onToggleField(category._id.toString(), 'showGroupTitle')
                            }
                            disabled={isToggling}
                        >
                            <Checkbox.HiddenInput/>
                            <Checkbox.Control
                                bg="gray.700"
                                borderColor="teal.500"
                                _checked={{
                                    bg: 'teal.500',
                                    borderColor: 'teal.400',
                                    boxShadow: '0 0 6px 1px rgba(56,178,172,0.5)',
                                }}
                                _hover={{ borderColor: 'teal.400' }}
                                transition="all 0.2s"
                            >
                                <Checkbox.Indicator color="black"/>
                            </Checkbox.Control>
                        </Checkbox.Root>
                    </Box>
                </Tooltip>
            </Table.Cell>

            <Table.Cell p={4}>
                <Flex gap={2} align="center" justify="center" alignSelf="center">
                    {isEditing ? (
                        <>
                            <Tooltip content="Сохранить" openDelay={400}>
                                <IconButton
                                    aria-label="Сохранить"
                                    size="sm"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, green.400, green.500)"
                                    color="white"
                                    _hover={{
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, green.500, green.600)',
                                    }}
                                    onClick={() => onNameSave(category._id.toString())}
                                    loading={isUpdatingName}
                                >
                                    <FiCheck/>
                                </IconButton>
                            </Tooltip>

                            <Tooltip content="Отмена" openDelay={400}>
                                <IconButton
                                    aria-label="Отмена"
                                    size="sm"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, gray.500, gray.600)"
                                    color="white"
                                    _hover={{
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, gray.600, gray.700)',
                                    }}
                                    onClick={onNameCancel}
                                >
                                    <FiX/>
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip content="Редактировать" openDelay={400}>
                            <IconButton
                                aria-label="Редактировать"
                                size="sm"
                                borderRadius="xl"
                                bgGradient="linear(to-r, blue.400, blue.500)"
                                color="white"
                                _hover={{
                                    transform: 'scale(1.1)',
                                    bgGradient: 'linear(to-r, blue.500, blue.600)',
                                }}
                                onClick={() => onEditStart(category)}
                            >
                                <FiEdit/>
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip content="Удалить" openDelay={400}>
                        <IconButton
                            aria-label="Удалить"
                            size="sm"
                            borderRadius="xl"
                            bgGradient="linear(to-r, red.500, red.600)"
                            color="white"
                            _hover={{
                                transform: 'scale(1.1)',
                                bgGradient: 'linear(to-r, red.600, red.700)',
                            }}
                            onClick={() => onDelete(category._id.toString())}
                            loading={isDeleting}
                        >
                            <FiTrash2/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Пометить все продукты как алкогольные" openDelay={400}>
                        <IconButton
                            aria-label="Пометить как алкогольные"
                            size="sm"
                            borderRadius="xl"
                            bgGradient="linear(to-r, purple.500, purple.600)"
                            color="white"
                            _hover={{
                                transform: 'scale(1.1)',
                                bgGradient: 'linear(to-r, purple.600, purple.700)',
                            }}
                            onClick={() => onMarkAlcohol(category._id.toString())}
                            loading={isMarkingAlcohol}
                        >
                            <FaWineBottle/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Пометить все продукты как безалкогольные" openDelay={400}>
                        <IconButton
                            aria-label="Пометить как безалкогольные"
                            size="sm"
                            borderRadius="xl"
                            bgGradient="linear(to-r, green.500, green.600)"
                            color="white"
                            _hover={{
                                transform: 'scale(1.1)',
                                bgGradient: 'linear(to-r, green.600, green.700)',
                            }}
                            onClick={() => onMarkNonAlcohol(category._id.toString())}
                            loading={isMarkingNonAlcohol}
                        >
                            <FaWineGlassAlt/>
                        </IconButton>
                    </Tooltip>
                </Flex>
            </Table.Cell>
        </Table.Row>
    )
}

export default function CategoriesTable({ categories: initialCategories }: Props) {
    const queryClient = useQueryClient()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempName, setTempName] = useState('')
    const toast = useToast()

    const [localItems, setLocalItems] = useState<{ category: CategoryWithChildren; depth: number }[]>(() =>
        flattenCategoryTree(buildCategoryTree(initialCategories))
    )

    React.useEffect(() => {
        setLocalItems(flattenCategoryTree(buildCategoryTree(initialCategories)))
    }, [initialCategories])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const {
        openDialog: openDeleteDialog,
        ConfirmationDialog: DeleteConfirmationDialog,
    } = useConfirmationDialog<string>({
        title: 'Удаление категории',
        description: 'Категория будет удалена без возможности восстановления.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
        onConfirm: (categoryId) => {
            deleteMutation.mutate(categoryId)
        },
    })

    const {
        openDialog: openMarkAlcoholDialog,
        ConfirmationDialog: MarkAlcoholConfirmationDialog,
    } = useConfirmationDialog<string>({
        title: 'Пометка продуктов как алкогольных',
        description: 'Все продукты в этой категории (включая подкатегории) будут помечены как алкогольные. Продолжить?',
        confirmText: 'Да, пометить',
        cancelText: 'Отмена',
        colorScheme: 'purple',
        onConfirm: (categoryId) => {
            markAlcoholMutation.mutate(categoryId)
        },
    })

    const {
        openDialog: openMarkNonAlcoholDialog,
        ConfirmationDialog: MarkNonAlcoholConfirmationDialog,
    } = useConfirmationDialog<string>({
        title: 'Пометка продуктов как безалкогольных',
        description: 'Все продукты в этой категории (включая подкатегории) будут помечены как безалкогольные. Продолжить?',
        confirmText: 'Да, пометить',
        cancelText: 'Отмена',
        colorScheme: 'green',
        onConfirm: (categoryId) => {
            markNonAlcoholMutation.mutate(categoryId)
        },
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, field }: { id: string; field: 'isMenuItem' | 'showGroupTitle' }) =>
            toggleCategoryField(id, field),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess('Настройки категории обновлены')
            } else {
                toast.showError(result.message || 'Не удалось обновить настройки категории')
            }
        },
        onError: () => toast.showError('Не удалось обновить настройки категории'),
    })

    const reorderMutation = useMutation({
        mutationFn: (updates: { id: string; order: number }[]) => reorderCategories(updates),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess('Порядок категорий обновлен')
            } else {
                toast.showError(result.message || 'Не удалось обновить порядок')
            }
        },
        onError: () => toast.showError('Не удалось обновить порядок'),
    })

    const updateNameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => updateCategoryName(id, name),
        onSuccess: (result) => {
            setEditingId(null)
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess('Название категории обновлено')
            } else {
                toast.showError(result.message || 'Не удалось обновить название')
            }
        },
        onError: () => {
            setEditingId(null)
            toast.showError('Не удалось обновить название')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess('Категория удалена')
            } else {
                toast.showError(result.message || 'Не удалось удалить категорию')
            }
        },
        onError: () => toast.showError('Не удалось удалить категорию'),
    })

    const markAlcoholMutation = useMutation({
        mutationFn: (categoryId: string) => markCategoryProductsAlcohol(categoryId),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess(result.message || 'Продукты помечены как алкогольные')
            } else {
                toast.showError(result.message || 'Не удалось пометить продукты')
            }
        },
        onError: () => toast.showError('Не удалось пометить продукты'),
    })

    const markNonAlcoholMutation = useMutation({
        mutationFn: (categoryId: string) => markCategoryProductsNonAlcohol(categoryId),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess(result.message || 'Продукты помечены как безалкогольные')
            } else {
                toast.showError(result.message || 'Не удалось пометить продукты')
            }
        },
        onError: () => toast.showError('Не удалось пометить продукты'),
    })

    const moveMutation = useMutation({
        mutationFn: ({ categoryId, newPosition }: { categoryId: string; newPosition: number }) =>
            moveCategoryToPosition(categoryId, newPosition),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            revalidateMenu()
            if (result.success) {
                toast.showSuccess('Позиция категории обновлена')
            } else {
                toast.showError(result.message || 'Не удалось обновить позицию')
            }
        },
        onError: () => toast.showError('Не удалось обновить позицию'),
    })

    const handleMoveToPosition = (categoryId: string, newPosition: number) => {
        moveMutation.mutate({ categoryId, newPosition })
    }

    const handleEditStart = (category: CategoryData) => {
        setEditingId(category._id)
        setTempName(category.name)
    }

    const handleNameSave = (id: string) => {
        if (!tempName.trim()) return
        updateNameMutation.mutate({ id, name: tempName.trim() })
    }

    const handleNameCancel = () => {
        setEditingId(null)
        setTempName('')
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = localItems.findIndex(
            (item) => item.category._id.toString() === active.id
        )
        const newIndex = localItems.findIndex(
            (item) => item.category._id.toString() === over.id
        )

        if (oldIndex === -1 || newIndex === -1) return

        const activeDepth = localItems[oldIndex].depth
        const overDepth = localItems[newIndex].depth

        if (activeDepth !== overDepth) return

        const activeParent = localItems[oldIndex].category.parent?.toString() || null
        const overParent = localItems[newIndex].category.parent?.toString() || null

        if (activeParent !== overParent) return

        const newItems = arrayMove(localItems, oldIndex, newIndex)
        setLocalItems(newItems)

        const parentId = activeParent
        const siblings = newItems.filter(
            (item) => (item.category.parent?.toString() || null) === parentId
        )

        const updates: { id: string; order: number }[] = []
        siblings.forEach((item, index) => {
            updates.push({
                id: item.category._id.toString(),
                order: index,
            })
        })

        reorderMutation.mutate(updates)
    }

    return (
        <Box>
            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.900"
                overflow="hidden"
            >
                <Card.Header
                    bgGradient="linear(to-r, teal.600, cyan.600)"
                    borderTopRadius="2xl"
                    py={4}
                    textAlign="center"
                    color="white"
                    backdropFilter="blur(10px)"
                >
                    <Flex justify="center" align="center" gap={2}>
                        <Box as={FiFolder} boxSize={5}/>
                        <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
                            Управление категориями
                        </Text>
                    </Flex>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    <Box overflowX="auto" position="relative">
                        {(toggleMutation.isPending ||
                            updateNameMutation.isPending ||
                            deleteMutation.isPending ||
                            markAlcoholMutation.isPending ||
                            markNonAlcoholMutation.isPending ||
                            moveMutation.isPending) && (
                            <Flex
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                justify="center"
                                align="center"
                                bg="rgba(0,0,0,0.3)"
                                zIndex={10}
                                borderRadius="xl"
                            >
                                <Spinner size="xl" color="teal.400"/>
                            </Flex>
                        )}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <Table.Root size="md" variant="outline" w="100%">
                                <Table.Header bg="gray.800">
                                    <Table.Row>
                                        {['Название', 'В меню', 'Заголовок', 'Действия'].map((col) => (
                                            <Table.ColumnHeader
                                                key={col}
                                                textAlign={col === "Название" ? "left" : "center"}
                                                color="gray.200"
                                                p={4}
                                                fontWeight="semibold">
                                                {col}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    <SortableContext
                                        items={localItems.map((item) => item.category._id.toString())}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {localItems.length > 0 ? (
                                            localItems.map(({ category, depth }) => {
                                                const isEditing = editingId === category._id.toString()
                                                const isToggling =
                                                    toggleMutation.isPending &&
                                                    toggleMutation.variables?.id === category._id.toString()
                                                const isDeleting =
                                                    deleteMutation.isPending &&
                                                    deleteMutation.variables === category._id.toString()
                                                const isUpdatingName =
                                                    updateNameMutation.isPending &&
                                                    updateNameMutation.variables?.id === category._id.toString()
                                                const isMarkingAlcohol =
                                                    markAlcoholMutation.isPending &&
                                                    markAlcoholMutation.variables === category._id.toString()
                                                const isMarkingNonAlcohol =
                                                    markNonAlcoholMutation.isPending &&
                                                    markNonAlcoholMutation.variables === category._id.toString()
                                                const isMoving =
                                                    moveMutation.isPending &&
                                                    moveMutation.variables?.categoryId === category._id.toString()

                                                const parentKey = category.parent
                                                    ? category.parent.toString()
                                                    : 'root'
                                                const siblings = localItems.filter(
                                                    (item) =>
                                                        (item.category.parent?.toString() || 'root') === parentKey
                                                )
                                                const indexInSiblings = siblings.findIndex(
                                                    (s) => s.category._id.toString() === category._id.toString()
                                                )

                                                return (
                                                    <SortableRow
                                                        key={category._id.toString()}
                                                        category={category}
                                                        depth={depth}
                                                        position={indexInSiblings}
                                                        totalSiblings={siblings.length}
                                                        isEditing={isEditing}
                                                        tempName={tempName}
                                                        setTempName={setTempName}
                                                        onEditStart={handleEditStart}
                                                        onNameSave={handleNameSave}
                                                        onNameCancel={handleNameCancel}
                                                        onDelete={(id) => openDeleteDialog(id)}
                                                        onMarkAlcohol={(id) => openMarkAlcoholDialog(id)}
                                                        onMarkNonAlcohol={(id) => openMarkNonAlcoholDialog(id)}
                                                        onToggleField={(id, field) =>
                                                            toggleMutation.mutate({ id, field })
                                                        }
                                                        onMoveToPosition={handleMoveToPosition}
                                                        isToggling={isToggling}
                                                        isDeleting={isDeleting}
                                                        isUpdatingName={isUpdatingName}
                                                        isMarkingAlcohol={isMarkingAlcohol}
                                                        isMarkingNonAlcohol={isMarkingNonAlcohol}
                                                        isMoving={isMoving}
                                                        siblingsCount={siblings.length}
                                                        indexInSiblings={indexInSiblings}
                                                    />
                                                )
                                            })
                                        ) : (
                                            <Table.Row>
                                                <Table.Cell colSpan={4} textAlign="center" color="gray.500" py={8}>
                                                    Нет категорий
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    </SortableContext>
                                </Table.Body>
                            </Table.Root>
                        </DndContext>
                    </Box>
                </Card.Body>
            </Card.Root>

            <DeleteConfirmationDialog/>
            <MarkAlcoholConfirmationDialog/>
            <MarkNonAlcoholConfirmationDialog/>
        </Box>
    )
}