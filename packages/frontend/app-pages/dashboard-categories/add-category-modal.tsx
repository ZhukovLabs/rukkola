'use client'

import {
    Dialog,
    Button,
    Box,
    Input,
    Text,
    HStack,
    Heading,
    Checkbox,
    Select,
    Flex,
    VStack,
    IconButton,
} from '@chakra-ui/react'
import {useState, useTransition} from 'react'
import {useSearchParams, useRouter, usePathname} from 'next/navigation'
import {useQueryClient} from '@tanstack/react-query'
import {createCategory} from './actions'
import {FiPlus, FiFolder, FiCheck, FiX, FiLayers, FiType} from 'react-icons/fi'

type CategoryType = {
    id: string;
    _id?: { toString(): string };
    name: string;
    order: number;
    isMenuItem: boolean;
    showGroupTitle: boolean;
    parent?: string | null;
    hidden?: boolean;
}
import {createListCollection} from '@chakra-ui/react'
import {useToast} from '@/components/toast-container'
import {revalidateMenu} from '@/lib/api/revalidate'

type Props = { categories: CategoryType[]; onRefresh?: () => Promise<void> }

export const AddCategoryDialog = ({categories, onRefresh}: Props) => {
    const searchParams = useSearchParams()
    const isOpen = searchParams.has('addCategory')
    const router = useRouter()
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const toast = useToast()
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState('')
    const [parent, setParent] = useState<string | undefined>(undefined)
    const [isMenuItem, setIsMenuItem] = useState(true)
    const [showGroupTitle, setShowGroupTitle] = useState(true)

    const resetForm = () => {
        setName('')
        setParent(undefined)
        setIsMenuItem(true)
        setShowGroupTitle(true)
    }

    const close = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('addCategory')
        const target = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.push(target, {scroll: false})
    }

    const onSubmit = () => {
        if (!name.trim()) return
        startTransition(async () => {
            try {
                const result = await createCategory({
                    name: name.trim(),
                    parentId: parent || undefined,
                    isMenuItem,
                    showGroupTitle,
                })
                if (result.success) {
                    if (onRefresh) await onRefresh()
                    revalidateMenu()
                    toast.showSuccess('Категория успешно создана')
                    resetForm()
                    close()
                } else {
                    toast.showError(result.message || 'Ошибка при создании категории')
                }
            } catch (err) {
                console.error('createCategory error', err)
                toast.showError('Ошибка при создании категории')
            }
        })
    }

    const buildCollectionItems = (cats: CategoryType[]) => {
        const items: Array<{ label: string; value: string }> = []

        cats.filter(({parent}) => !parent)
            .forEach((cat) => {
                const id = cat._id?.toString() ?? cat.id
                items.push({label: cat.name, value: id})
            })

        return items
    }

    const collection = createListCollection({
        items: [{label: 'Нет родителя', value: ''}, ...buildCollectionItems(categories)],
    })

    return (
        <Dialog.Root open={isOpen} onOpenChange={(details) => {
            if (!details.open) {
                resetForm();
                close();
            }
        }}>
            <Dialog.Backdrop bg="blackAlpha.900/80" backdropFilter="blur(12px)"/>
            <Dialog.Positioner>
                <Dialog.Content
                    bg="gray.950"
                    borderRadius="3xl"
                    shadow="dark-lg"
                    border="1px solid"
                    borderColor="gray.800"
                    color="white"
                    maxW="md"
                    w="full"
                    overflow="hidden"
                >
                    <Dialog.Header bg="gray.900/50" py={5} px={6} borderBottom="1px solid" borderColor="gray.800">
                        <Flex align="center" justify="space-between">
                            <Flex align="center" gap={3}>
                                <Box bg="purple.900/30" p={2} borderRadius="xl" border="1px solid" borderColor="purple.800/50">
                                    <FiPlus size={20} color="#A855F7"/>
                                </Box>
                                <Heading size="md" color="gray.100" fontWeight="bold" letterSpacing="tight">
                                    Новая категория
                                </Heading>
                            </Flex>
                            <Dialog.CloseTrigger asChild>
                                <IconButton
                                    onClick={close}
                                    variant="ghost"
                                    colorPalette="gray"
                                    size="sm"
                                    borderRadius="full"
                                    color="gray.500"
                                    _hover={{bg: 'gray.800', color: 'gray.200'}}
                                >
                                    <FiX size={18}/>
                                </IconButton>
                            </Dialog.CloseTrigger>
                        </Flex>
                    </Dialog.Header>

                    <Dialog.Body p={8}>
                        <VStack gap={6} align="stretch">
                            <Box>
                                <Heading mb={2} size="xs" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                    Название
                                </Heading>
                                <Flex position="relative" align="center">
                                    <Box position="absolute" left={3} color="gray.500" zIndex={1}>
                                        <FiType size={18}/>
                                    </Box>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        pl={10}
                                        placeholder="Напр., Пицца, Суши..."
                                        bg="gray.900"
                                        color="gray.100"
                                        border="1px solid"
                                        borderColor="gray.800"
                                        borderRadius="xl"
                                        _focus={{borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500', bg: 'gray.850'}}
                                        h="44px"
                                        fontSize="sm"
                                        _hover={{borderColor: 'gray.700'}}
                                        transition="all 0.2s ease"
                                        autoFocus
                                    />
                                </Flex>
                            </Box>

                            <Box>
                                <Heading mb={2} size="xs" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                                    Родительская категория
                                </Heading>

                                <Select.Root
                                    collection={collection}
                                    value={parent ? [parent] : ['']}
                                    onValueChange={({value}) => {
                                        const v = value?.[0] ?? ''
                                        setParent(v || undefined)
                                    }}
                                >
                                    <Select.HiddenSelect/>
                                    <Select.Control>
                                        <Select.Trigger 
                                            bg="gray.900" 
                                            borderColor="gray.800" 
                                            border="1px solid"
                                            borderRadius="xl"
                                            h="44px"
                                            _hover={{borderColor: 'gray.700'}}
                                            px={4}
                                        >
                                            <Flex align="center" gap={3} w="full">
                                                <Box color="gray.500">
                                                    <FiLayers size={18}/>
                                                </Box>
                                                <Select.ValueText placeholder="Нет родителя" color="gray.200" fontSize="sm">
                                                    {parent
                                                        ? categories.find((c) => (c._id?.toString() ?? c.id) === parent)?.name
                                                        : 'Нет родителя'}
                                                </Select.ValueText>
                                            </Flex>
                                        </Select.Trigger>
                                    </Select.Control>

                                    <Select.Positioner>
                                        <Select.Content
                                            bg="gray.900"
                                            color="gray.200"
                                            borderWidth="1px"
                                            borderColor="gray.800"
                                            borderRadius="xl"
                                            shadow="dark-lg"
                                            maxH="220px"
                                            overflowY="auto"
                                            p={1}
                                        >
                                            {collection.items.map((item) => (
                                                <Select.Item 
                                                    key={item.value} 
                                                    item={item}
                                                    borderRadius="lg"
                                                    _hover={{bg: 'gray.800'}}
                                                    cursor="pointer"
                                                    px={3}
                                                    py={2}
                                                >
                                                    <Text fontSize="sm">{item.label}</Text>
                                                    <Select.ItemIndicator color="purple.500"/>
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                                <Text mt={1.5} fontSize="10px" color="gray.600">
                                    Выберите основную категорию, если создаете подкатегорию
                                </Text>
                            </Box>

                            <HStack gap={8} py={2}>
                                <Checkbox.Root
                                    checked={isMenuItem}
                                    onCheckedChange={(e) => setIsMenuItem(!!e.checked)}
                                    colorPalette="purple"
                                    size="lg"
                                >
                                    <Checkbox.HiddenInput/>
                                    <Checkbox.Control
                                        borderRadius="lg"
                                        bg="gray.900"
                                        borderColor="gray.800"
                                        _hover={{borderColor: 'gray.700'}}
                                    />
                                    <Checkbox.Label>
                                        <Text color="gray.300" fontSize="sm" fontWeight="medium">
                                            Видна в меню
                                        </Text>
                                    </Checkbox.Label>
                                </Checkbox.Root>

                                <Checkbox.Root
                                    checked={showGroupTitle}
                                    onCheckedChange={(e) => setShowGroupTitle(!!e.checked)}
                                    colorPalette="blue"
                                    size="lg"
                                >
                                    <Checkbox.HiddenInput/>
                                    <Checkbox.Control
                                        borderRadius="lg"
                                        bg="gray.900"
                                        borderColor="gray.800"
                                        _hover={{borderColor: 'gray.700'}}
                                    />
                                    <Checkbox.Label>
                                        <Text color="gray.300" fontSize="sm" fontWeight="medium">
                                            Показывать заголовок
                                        </Text>
                                    </Checkbox.Label>
                                </Checkbox.Root>
                            </HStack>
                        </VStack>
                    </Dialog.Body>

                    <Dialog.Footer bg="gray.900/30" p={6} borderTop="1px solid" borderColor="gray.800" gap={3}>
                        <Button
                            variant="ghost"
                            size="md"
                            color="gray.400"
                            borderRadius="xl"
                            _hover={{bg: 'gray.800', color: 'gray.200'}}
                            onClick={close}
                            flex={1}
                        >
                            Отмена
                        </Button>
                        <Button
                            size="md"
                            colorPalette="purple"
                            bg="purple.600"
                            color="white"
                            borderRadius="xl"
                            _hover={{
                                bg: 'purple.500',
                                shadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                            }}
                            _active={{bg: 'purple.700'}}
                            onClick={onSubmit}
                            loading={isPending}
                            flex={2}
                            gap={2}
                        >
                            <FiCheck/>
                            Создать категорию
                        </Button>
                    </Dialog.Footer>

                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}

