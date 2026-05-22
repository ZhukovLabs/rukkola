'use client'

import React, {useState, useMemo} from 'react'
import {
    Box,
    Flex,
    IconButton,
    Input,
    Text,
    Spinner,
    HStack,
    VStack,
} from '@chakra-ui/react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiMove,
    FiSearch,
    FiEye,
    FiEyeOff,
    FiType,
} from 'react-icons/fi'
import {FaWineBottle, FaWineGlassAlt} from 'react-icons/fa'
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
import {motion, AnimatePresence} from 'framer-motion'
import {
    toggleCategoryField,
    reorderCategories,
    updateCategoryName,
    deleteCategory,
    markCategoryProductsAlcohol,
    markCategoryProductsNonAlcohol,
    moveCategoryToPosition,
} from './actions'
import {Tooltip} from '@/components/tooltip'
import {useConfirmationDialog} from "@/hooks/use-confirmation-dialog"
import {useToast} from "@/components/toast-container"
import {CategoryPositionDialog} from './category-position-dialog'
import {revalidateMenu} from '@/lib/api/revalidate'

type CategoryType = {
    id: string;
    _id?: { toString(): string };
    name: string;
    order: number;
    isMenuItem: boolean;
    showGroupTitle: boolean;
    parent?: { toString(): string } | null;
    hidden?: boolean;
}


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
    children: CategoryWithChildren[]
}

type Props = {
    categories: CategoryType[];
    onRefresh?: () => Promise<void>;
    isSearching?: boolean;
}

function toCategoryData(cat: CategoryType): CategoryData {
    const id = cat.id || (cat._id ? cat._id.toString() : '')
    return {
        id,
        _id: id,
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
        map.set(data.id, {...data, children: []})
    }

    for (const cat of categories) {
        const data = toCategoryData(cat)
        const node = map.get(data.id)!
        if (data.parent) {
            const parent = map.get(data.parent)
            if (parent) {
                parent.children.push(node)
            } else {
                roots.push(node)
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

type SortableRowProps = {
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
    isDraggable: boolean
    renderChildren: () => React.ReactNode
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
                         isDraggable,
                         renderChildren,
                     }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: category._id, disabled: !isDraggable})

    const style = {
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 1,
    }

    return (
        <Box ref={setNodeRef} style={style} w="full">
            <Flex
                bg={depth > 0 ? 'gray.900/40' : 'gray.900/20'}
                borderBottom="1px solid"
                borderColor="gray.800/60"
                _hover={{bg: 'gray.800/40'}}
                transition="all 0.2s"
                py={3}
                px={4}
                align="center"
                gap={4}
                position="relative"
            >
                {/* Indentation Markers */}
                {depth > 0 && (
                    <Box
                        position="absolute"
                        left={`${depth * 24 - 12}px`}
                        top={0}
                        bottom={0}
                        w="1.5px"
                        bg="purple.800/40"
                        _after={{
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            w: '12px',
                            h: '1.5px',
                            bg: 'purple.800/40',
                        }}
                    />
                )}

                <Flex align="center" gap={3} pl={depth * 6} flex={1}>
                    {isDraggable && (
                        <Flex align="center" gap={1}>
                            <CategoryPositionDialog
                                currentPosition={position}
                                totalItems={totalSiblings}
                                depth={depth}
                                onMove={(pos) => onMoveToPosition(category._id, pos)}
                                isLoading={isMoving}
                            />
                            <Box
                                {...attributes}
                                {...listeners}
                                cursor="grab"
                                color="gray.600"
                                p={1.5}
                                borderRadius="lg"
                                _hover={{color: 'purple.400', bg: 'purple.900/20'}}
                                transition="all 0.2s"
                            >
                                <FiMove size={14}/>
                            </Box>
                        </Flex>
                    )}

                    {isEditing ? (
                        <Input
                            size="sm"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onNameSave(category._id)
                                if (e.key === 'Escape') onNameCancel()
                            }}
                            autoFocus
                            bg="gray.850"
                            borderColor="purple.500"
                            borderRadius="xl"
                            h="36px"
                            fontSize="sm"
                            w="300px"
                        />
                    ) : (
                        <VStack align="start" gap={0} flex={1}>
                            <Text
                                fontWeight={depth === 0 ? "700" : "600"}
                                color={depth === 0 ? "white" : "gray.200"}
                                fontSize={depth === 0 ? "md" : "sm"}
                            >
                                {category.name}
                            </Text>
                            {depth === 0 && (
                                <Text fontSize="10px" color="purple.500" fontWeight="bold" textTransform="uppercase"
                                      letterSpacing="widest">
                                    Основная
                                </Text>
                            )}
                        </VStack>
                    )}
                </Flex>

                {/* Toggles */}
                <Flex w="280px" justify="center" align="center" flexShrink={0}>
                    <Box flex={1} display="flex" justifyContent="center">
                        <Tooltip content={category.isMenuItem ? 'Видна в меню' : 'Скрыта из меню'}>
                            <IconButton
                                aria-label="Toggle Menu Visibility"
                                size="sm"
                                variant="ghost"
                                onClick={() => onToggleField(category._id, 'isMenuItem')}
                                color={category.isMenuItem ? 'purple.400' : 'gray.600'}
                                borderRadius="lg"
                                bg={category.isMenuItem ? 'purple.900/20' : 'transparent'}
                                _hover={{bg: 'gray.800'}}
                                transition="all 0.2s"
                                loading={isToggling}
                            >
                                {category.isMenuItem ? <FiEye size={18}/> : <FiEyeOff size={18}/>}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box flex={1} display="flex" justifyContent="center">
                        <Tooltip content={category.showGroupTitle ? 'Заголовок виден' : 'Заголовок скрыт'}>
                            <IconButton
                                aria-label="Toggle Title Visibility"
                                size="sm"
                                variant="ghost"
                                onClick={() => onToggleField(category._id, 'showGroupTitle')}
                                color={category.showGroupTitle ? 'blue.400' : 'gray.600'}
                                borderRadius="lg"
                                bg={category.showGroupTitle ? 'blue.900/20' : 'transparent'}
                                _hover={{bg: 'gray.800'}}
                                transition="all 0.2s"
                                loading={isToggling}
                            >
                                <FiType size={18}/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Flex>

                {/* Actions */}
                <HStack gap={1} w="220px" justify="center">
                    {isEditing ? (
                        <>
                            <IconButton
                                aria-label="Save"
                                size="sm"
                                variant="solid"
                                colorPalette="green"
                                borderRadius="xl"
                                onClick={() => onNameSave(category._id)}
                                loading={isUpdatingName}
                            >
                                <FiCheck/>
                            </IconButton>
                            <IconButton
                                aria-label="Cancel"
                                size="sm"
                                variant="ghost"
                                borderRadius="xl"
                                onClick={onNameCancel}
                            >
                                <FiX/>
                            </IconButton>
                        </>
                    ) : (
                        <IconButton
                            aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            color="gray.500"
                            _hover={{color: 'purple.400', bg: 'purple.900/10'}}
                            borderRadius="xl"
                            onClick={() => onEditStart(category)}
                        >
                            <FiEdit size={16}/>
                        </IconButton>
                    )}

                    <IconButton
                        aria-label="Delete"
                        size="sm"
                        variant="ghost"
                        color="gray.500"
                        _hover={{color: 'red.400', bg: 'red.900/10'}}
                        borderRadius="xl"
                        onClick={() => onDelete(category._id)}
                        loading={isDeleting}
                    >
                        <FiTrash2 size={16}/>
                    </IconButton>

                    <HStack gap={0} ml={2}>
                        <Tooltip content="Алкоголь">
                            <IconButton
                                aria-label="Alcohol"
                                size="sm"
                                variant="ghost"
                                color="gray.500"
                                _hover={{color: 'purple.300', bg: 'purple.900/10'}}
                                borderRadius="xl"
                                onClick={() => onMarkAlcohol(category._id)}
                                loading={isMarkingAlcohol}
                            >
                                <FaWineBottle size={14}/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Безалкоголь">
                            <IconButton
                                aria-label="Non-alcohol"
                                size="sm"
                                variant="ghost"
                                color="gray.500"
                                _hover={{color: 'green.300', bg: 'green.900/10'}}
                                borderRadius="xl"
                                onClick={() => onMarkNonAlcohol(category._id)}
                                loading={isMarkingNonAlcohol}
                            >
                                <FaWineGlassAlt size={14}/>
                            </IconButton>
                        </Tooltip>
                    </HStack>
                </HStack>
            </Flex>

            {/* Children Rendering */}
            <AnimatePresence>
                {category.children.length > 0 && (
                    <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                    >
                        {renderChildren()}
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    )
}

function SortableLevel({
                           nodes,
                           depth,
                           editingId,
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
                           togglingId,
                           deleteMutation,
                           updateNameMutation,
                           markAlcoholMutation,
                           markNonAlcoholMutation,
                           moveMutation,
                           isSearching,
                       }: {
    nodes: CategoryWithChildren[]
    depth: number
    editingId: string | null
    tempName: string
    setTempName: (s: string) => void
    onEditStart: (c: CategoryData) => void
    onNameSave: (id: string) => void
    onNameCancel: () => void
    onDelete: (id: string) => void
    onMarkAlcohol: (id: string) => void
    onMarkNonAlcohol: (id: string) => void
    onToggleField: (id: string, field: 'isMenuItem' | 'showGroupTitle') => void
    onMoveToPosition: (id: string, pos: number) => void
    togglingId: string | null
    deleteMutation: any
    updateNameMutation: any
    markAlcoholMutation: any
    markNonAlcoholMutation: any
    moveMutation: any
    isSearching?: boolean
}) {
    const items = useMemo(() => nodes.map(n => n._id), [nodes])

    return (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {nodes.map((node, index) => {
                const isEditing = editingId === node._id
                const isToggling = togglingId === node._id
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === node._id
                const isUpdatingName = updateNameMutation.isPending && updateNameMutation.variables?.id === node._id
                const isMarkingAlcohol = markAlcoholMutation.isPending && markAlcoholMutation.variables === node._id
                const isMarkingNonAlcohol = markNonAlcoholMutation.isPending && markNonAlcoholMutation.variables === node._id
                const isMoving = moveMutation.isPending && moveMutation.variables?.categoryId === node._id

                return (
                    <SortableRow
                        key={node._id}
                        category={node}
                        depth={depth}
                        position={index}
                        totalSiblings={nodes.length}
                        isEditing={isEditing}
                        tempName={tempName}
                        setTempName={setTempName}
                        onEditStart={onEditStart}
                        onNameSave={onNameSave}
                        onNameCancel={onNameCancel}
                        onDelete={onDelete}
                        onMarkAlcohol={onMarkAlcohol}
                        onMarkNonAlcohol={onMarkNonAlcohol}
                        onToggleField={onToggleField}
                        onMoveToPosition={onMoveToPosition}
                        isToggling={isToggling}
                        isDeleting={isDeleting}
                        isUpdatingName={isUpdatingName}
                        isMarkingAlcohol={isMarkingAlcohol}
                        isMarkingNonAlcohol={isMarkingNonAlcohol}
                        isMoving={isMoving}
                        isDraggable={!isSearching}
                        renderChildren={() => (
                            <SortableLevel
                                nodes={node.children}
                                depth={depth + 1}
                                editingId={editingId}
                                tempName={tempName}
                                setTempName={setTempName}
                                onEditStart={onEditStart}
                                onNameSave={onNameSave}
                                onNameCancel={onNameCancel}
                                onDelete={onDelete}
                                onMarkAlcohol={onMarkAlcohol}
                                onMarkNonAlcohol={onMarkNonAlcohol}
                                onToggleField={onToggleField}
                                onMoveToPosition={onMoveToPosition}
                                togglingId={togglingId}
                                deleteMutation={deleteMutation}
                                updateNameMutation={updateNameMutation}
                                markAlcoholMutation={markAlcoholMutation}
                                markNonAlcoholMutation={markNonAlcoholMutation}
                                moveMutation={moveMutation}
                                isSearching={isSearching}
                            />
                        )}
                    />
                )
            })}
        </SortableContext>
    )
}

export default function CategoriesTable({categories: initialCategories, onRefresh, isSearching}: Props) {
    const queryClient = useQueryClient()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempName, setTempName] = useState('')
    const toast = useToast()
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const tree = useMemo(() => buildCategoryTree(initialCategories), [initialCategories])

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 8}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    )

    const {openDialog: openDeleteDialog, confirmationDialog: deleteConfirmationDialog} = useConfirmationDialog<string>({
        title: 'Удалить категорию?',
        description: 'Все подкатегории также будут удалены. Это действие необратимо.',
        confirmText: 'Удалить',
        cancelText: 'Отмена',
        colorScheme: 'red',
        onConfirm: (id) => deleteMutation.mutate(id),
    })

    const {
        openDialog: openMarkAlcoholDialog,
        confirmationDialog: markAlcoholConfirmationDialog
    } = useConfirmationDialog<string>({
        title: 'Пометка как алкоголь',
        description: 'Все продукты в этой категории и её подкатегориях будут помечены как алкогольные.',
        confirmText: 'Да, пометить',
        cancelText: 'Отмена',
        colorScheme: 'purple',
        onConfirm: (id) => markAlcoholMutation.mutate(id),
    })

    const {
        openDialog: openMarkNonAlcoholDialog,
        confirmationDialog: markNonAlcoholConfirmationDialog
    } = useConfirmationDialog<string>({
        title: 'Пометка как безалкоголь',
        description: 'Все продукты в этой категории и её подкатегориях будут помечены как безалкогольные.',
        confirmText: 'Да, пометить',
        cancelText: 'Отмена',
        colorScheme: 'green',
        onConfirm: (id) => markNonAlcoholMutation.mutate(id),
    })

    const toggleMutation = useMutation({
        mutationFn: ({id, field}: {
            id: string;
            field: 'isMenuItem' | 'showGroupTitle'
        }) => toggleCategoryField(id, field),
        onMutate: async ({id}) => {
            setTogglingId(id)
        },
        onSuccess: (result) => {
            if (onRefresh) onRefresh()
            revalidateMenu()
            setTogglingId(null)
            if (result.success) toast.showSuccess('Обновлено')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => {
            setTogglingId(null)
            toast.showError('Ошибка сети')
        },
    })

    const reorderMutation = useMutation({
        mutationFn: (updates: { id: string; order: number }[]) => reorderCategories(updates),
        onSuccess: (result) => {
            if (onRefresh) onRefresh()
            revalidateMenu()
            if (result.success) toast.showSuccess('Порядок обновлен')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => toast.showError('Ошибка сети'),
    })

    const updateNameMutation = useMutation({
        mutationFn: ({id, name}: { id: string; name: string }) => updateCategoryName(id, name),
        onSuccess: (result) => {
            setEditingId(null)
            if (onRefresh) onRefresh()
            revalidateMenu()
            if (result.success) toast.showSuccess('Название обновлено')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => {
            setEditingId(null)
            toast.showError('Ошибка сети')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: (result) => {
            if (onRefresh) onRefresh()
            revalidateMenu()
            if (result.success) toast.showSuccess('Удалено')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => toast.showError('Ошибка сети'),
    })

    const markAlcoholMutation = useMutation({
        mutationFn: (id: string) => markCategoryProductsAlcohol(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            revalidateMenu()
            if (result.success) toast.showSuccess('Обновлено')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => toast.showError('Ошибка сети'),
    })

    const markNonAlcoholMutation = useMutation({
        mutationFn: (id: string) => markCategoryProductsNonAlcohol(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            revalidateMenu()
            if (result.success) toast.showSuccess('Обновлено')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => toast.showError('Ошибка сети'),
    })

    const moveMutation = useMutation({
        mutationFn: ({categoryId, newPosition}: {
            categoryId: string;
            newPosition: number
        }) => moveCategoryToPosition(categoryId, newPosition),
        onSuccess: async (result) => {
            if (onRefresh) await onRefresh()
            revalidateMenu()
            if (result.success) toast.showSuccess('Позиция обновлена')
            else toast.showError(result.message || 'Ошибка')
        },
        onError: () => toast.showError('Ошибка сети'),
    })

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event
        if (!over || active.id === over.id) return

        // Find the level where the active item exists
        const findSiblings = (nodes: CategoryWithChildren[]): CategoryWithChildren[] | null => {
            if (nodes.some(n => n._id === active.id)) return nodes
            for (const node of nodes) {
                const found = findSiblings(node.children)
                if (found) return found
            }
            return null
        }

        const siblings = findSiblings(tree)
        if (!siblings) return

        // Ensure the "over" item is a sibling
        if (!siblings.some(n => n._id === over.id)) return

        const oldIndex = siblings.findIndex(n => n._id === active.id)
        const newIndex = siblings.findIndex(n => n._id === over.id)

        const newSiblings = arrayMove(siblings, oldIndex, newIndex)
        const updates = newSiblings.map((item, index) => ({
            id: item._id,
            order: index,
        }))

        reorderMutation.mutate(updates)
    }

    return (
        <Box position="relative" minH="400px">
            <AnimatePresence>
                {(toggleMutation.isPending ||
                    updateNameMutation.isPending ||
                    deleteMutation.isPending ||
                    markAlcoholMutation.isPending ||
                    markNonAlcoholMutation.isPending ||
                    moveMutation.isPending) && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgba(10,10,10,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 100
                        }}
                    >
                        <Spinner size="xl" color="purple.500"/>
                    </motion.div>
                )}
            </AnimatePresence>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <VStack gap={0} align="stretch" w="full">
                    {/* Header */}
                    <Flex bg="gray.950" borderBottom="2px solid" borderColor="gray.800" py={4} px={6} align="center"
                          gap={4}>
                        <Text flex={1} color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase"
                              letterSpacing="widest">
                            Название и структура
                        </Text>
                        <Flex w="280px" justify="center" align="center" flexShrink={0}>
                            <Box flex={1} display="flex" justifyContent="center">
                                <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase"
                                      letterSpacing="widest" whiteSpace="nowrap">В навигации</Text>
                            </Box>
                            <Box flex={1} display="flex" justifyContent="center">
                                <Text color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase"
                                      letterSpacing="widest" whiteSpace="nowrap">Заголовок</Text>
                            </Box>
                        </Flex>
                        <Text w="220px" textAlign="center" color="gray.500" fontSize="xs" fontWeight="bold"
                              textTransform="uppercase" letterSpacing="widest">
                            Действия
                        </Text>
                    </Flex>

                    {tree.length > 0 ? (
                        <SortableLevel
                            nodes={tree}
                            depth={0}
                            editingId={editingId}
                            tempName={tempName}
                            setTempName={setTempName}
                            onEditStart={(c) => {
                                setEditingId(c._id);
                                setTempName(c.name);
                            }}
                            onNameSave={(id) => {
                                if (tempName.trim()) updateNameMutation.mutate({id, name: tempName.trim()});
                            }}
                            onNameCancel={() => setEditingId(null)}
                            onDelete={(id) => openDeleteDialog(id)}
                            onMarkAlcohol={(id) => openMarkAlcoholDialog(id)}
                            onMarkNonAlcohol={(id) => openMarkNonAlcoholDialog(id)}
                            onToggleField={(id, field) => toggleMutation.mutate({id, field})}
                            onMoveToPosition={(id, pos) => moveMutation.mutate({categoryId: id, newPosition: pos})}
                            togglingId={togglingId}
                            deleteMutation={deleteMutation}
                            updateNameMutation={updateNameMutation}
                            markAlcoholMutation={markAlcoholMutation}
                            markNonAlcoholMutation={markNonAlcoholMutation}
                            moveMutation={moveMutation}
                            isSearching={isSearching}
                        />
                    ) : (
                        <Flex direction="column" align="center" py={20} gap={4}>
                            <Box bg="gray.800" p={6} borderRadius="full" color="gray.600">
                                <FiSearch size={40}/>
                            </Box>
                            <Text color="gray.400" fontWeight="medium">
                                {isSearching ? 'Ничего не найдено' : 'Список категорий пуст'}
                            </Text>
                        </Flex>
                    )}
                </VStack>
            </DndContext>

            {deleteConfirmationDialog}
            {markAlcoholConfirmationDialog}
            {markNonAlcoholConfirmationDialog}
        </Box>
    )
}