'use client'

import React, {useState} from 'react'
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
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {
    FiArrowUp,
    FiArrowDown,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
} from 'react-icons/fi'
import {CategoryType} from '@/models/category'
import {
    toggleCategoryField,
    moveCategory,
    updateCategoryName,
    deleteCategory,
} from './actions'
import {Tooltip} from '@/components/tooltip'
import {useConfirmationDialog} from "@/hooks/use-confirmation-dialog";

type Props = { categories: CategoryType[] }

export default function CategoriesTable({categories: initialCategories}: Props) {
    const queryClient = useQueryClient()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempName, setTempName] = useState('')

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


    const toggleMutation = useMutation({
        mutationFn: ({id, field}: { id: string; field: 'isMenuItem' | 'showGroupTitle' }) =>
            toggleCategoryField(id, field),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['categories']}),
    })

    const moveMutation = useMutation({
        mutationFn: ({id, dir}: { id: string; dir: 'up' | 'down' }) => moveCategory(id, dir),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['categories']}),
    })

    const updateNameMutation = useMutation({
        mutationFn: ({id, name}: { id: string; name: string }) => updateCategoryName(id, name),
        onSuccess: () => {
            setEditingId(null)
            queryClient.invalidateQueries({queryKey: ['categories']})
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ['categories']}),
    })

    const handleEditStart = (category: CategoryType) => {
        setEditingId(category._id.toString())
        setTempName(category.name)
    }

    const handleNameSave = (id: string) => {
        if (!tempName.trim()) return
        updateNameMutation.mutate({id, name: tempName.trim()})
    }

    const handleNameCancel = () => {
        setEditingId(null)
        setTempName('')
    }

    const groupedCategories = initialCategories.reduce<Record<string, CategoryType[]>>(
        (acc, cat) => {
            const key = cat.parent ? cat.parent.toString() : 'root'
            if (!acc[key]) acc[key] = []
            acc[key].push(cat)
            return acc
        },
        {}
    )

    const renderRow = (category: CategoryType, depth = 0): React.ReactNode => {
        const parentKey = category.parent ? category.parent.toString() : 'root'
        const group = groupedCategories[parentKey].sort((a, b) => a.order - b.order)
        const indexInGroup = group.findIndex((c) => c._id === category._id)
        const isFirst = indexInGroup === 0
        const isLast = indexInGroup === group.length - 1

        const isEditing = editingId === category._id.toString()
        const isMoving = moveMutation.isPending && moveMutation.variables?.id === category._id.toString()
        const isToggling = toggleMutation.isPending && toggleMutation.variables?.id === category._id.toString()
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === category._id.toString()

        return (
            <React.Fragment key={category._id.toString()}>
                <Table.Row
                    bg={depth % 2 === 0 ? 'gray.900' : 'gray.850'}
                    borderBottom="1px solid"
                    borderColor="gray.700"
                    _hover={{bg: 'gray.800', transition: '0.2s ease'}}
                >
                    <Table.Cell p={4}>
                        <Flex align="center" gap={3} pl={depth * 6}>
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
                                        if (e.key === 'Enter') handleNameSave(category._id.toString())
                                        if (e.key === 'Escape') handleNameCancel()
                                    }}
                                    autoFocus
                                    bg="gray.700"
                                    color="teal.300"
                                    borderColor="teal.500"
                                    _focus={{borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400'}}
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
                                        toggleMutation.mutate({id: category._id.toString(), field: 'isMenuItem'})
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
                                        _hover={{borderColor: 'teal.400'}}
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
                                        toggleMutation.mutate({id: category._id.toString(), field: 'showGroupTitle'})
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
                                        _hover={{borderColor: 'teal.400'}}
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
                                            onClick={() => handleNameSave(category._id.toString())}
                                            loading={updateNameMutation.isPending}
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
                                            onClick={handleNameCancel}
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
                                        onClick={() => handleEditStart(category)}
                                    >
                                        <FiEdit/>
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip content="Вверх" openDelay={400}>
                                <IconButton
                                    aria-label="Вверх"
                                    size="sm"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, teal.400, teal.500)"
                                    color="white"
                                    _hover={{
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, teal.500, teal.600)',
                                    }}
                                    onClick={() => moveMutation.mutate({id: category._id.toString(), dir: 'up'})}
                                    disabled={isFirst || isMoving}
                                    loading={isMoving}
                                >
                                    <FiArrowUp/>
                                </IconButton>
                            </Tooltip>

                            <Tooltip content="Вниз" openDelay={400}>
                                <IconButton
                                    aria-label="Вниз"
                                    size="sm"
                                    borderRadius="xl"
                                    bgGradient="linear(to-r, teal.400, teal.500)"
                                    color="white"
                                    _hover={{
                                        transform: 'scale(1.1)',
                                        bgGradient: 'linear(to-r, teal.500, teal.600)',
                                    }}
                                    onClick={() => moveMutation.mutate({id: category._id.toString(), dir: 'down'})}
                                    disabled={isLast || isMoving}
                                    loading={isMoving}
                                >
                                    <FiArrowDown/>
                                </IconButton>
                            </Tooltip>

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
                                    onClick={() => openDeleteDialog(category._id.toString())}
                                    loading={isDeleting}
                                >
                                    <FiTrash2/>
                                </IconButton>
                            </Tooltip>
                        </Flex>
                    </Table.Cell>
                </Table.Row>

                {initialCategories
                    .filter((c) => c.parent?.toString() === category._id.toString())
                    .map((child) => renderRow(child, depth + 1))}
            </React.Fragment>
        )
    }

    const rootCategories = initialCategories.filter((c) => !c.parent)

    return (
        <Box minH="100vh">
            <Card.Root
                w="100%"
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.700"
                bg="gray.900"
            >
                <Card.Header
                    bg="teal.500"
                    borderTopRadius="2xl"
                    py={3}
                    textAlign="center"
                    color="white"
                >
                    <Text fontSize="lg" fontWeight="semibold">
                        Изменение категорий
                    </Text>
                </Card.Header>

                <Card.Body px={0} py={0}>
                    <Box overflowX="auto" position="relative">
                        {(toggleMutation.isPending ||
                            moveMutation.isPending ||
                            updateNameMutation.isPending ||
                            deleteMutation.isPending) && (
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
                                {rootCategories.length > 0 ? (
                                    rootCategories.map((cat) => renderRow(cat))
                                ) : (
                                    <Table.Row>
                                        <Table.Cell colSpan={4} textAlign="center" color="gray.500" py={8}>
                                            Нет категорий
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Card.Body>
            </Card.Root>

            <DeleteConfirmationDialog />
        </Box>
    )
}