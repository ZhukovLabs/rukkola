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
} from '@chakra-ui/react'
import {useState, useTransition} from 'react'
import {useSearchParams, useRouter, usePathname} from 'next/navigation'
import {useQueryClient} from '@tanstack/react-query'
import {createCategory} from './actions'
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
import {createListCollection} from '@chakra-ui/react'
import {useToast} from '@/components/toast-container'
import {revalidateMenu} from '@/lib/api/revalidate'

type Props = { categories: CategoryType[] }

export const AddCategoryDialog = ({categories}: Props) => {
    const searchParams = useSearchParams()
    const isOpen = searchParams.has('addCategory')
    const router = useRouter()
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const toast = useToast()
    const [isPending, startTransition] = useTransition()

    const [name, setName] = useState('')
    const [parent, setParent] = useState<string | undefined>(undefined)
    const [isMenuItem, setIsMenuItem] = useState(false)
    const [showGroupTitle, setShowGroupTitle] = useState(false)

    const resetForm = () => {
        setName('')
        setParent(undefined)
        setIsMenuItem(false)
        setShowGroupTitle(false)
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
                    queryClient.invalidateQueries({queryKey: ['categories']})
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
            .forEach(({_id, name}) => {
                items.push({label: name, value: _id.toString()})
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
            <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(8px)"/>
            <Dialog.Positioner>
                <Dialog.Content
                    bg="rgba(24,26,28,0.95)"
                    borderRadius="2xl"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="gray.700"
                    color="white"
                    maxW="md"
                    w="full"
                    backdropFilter="blur(18px)"
                    transition="all 0.25s ease"
                    p={0}
                >
                    <Dialog.Header borderBottom="1px solid" borderColor="gray.700">
                        <Box display="flex" alignItems="center" justifyContent="space-between" p={4}>
                            <Heading size="md" color="gray.200" fontWeight="semibold" letterSpacing="0.3px">
                                Добавить категорию
                            </Heading>
                            <Dialog.CloseTrigger asChild>
                                <Button
                                    onClick={close}
                                    variant="ghost"
                                    colorScheme="gray"
                                    size="xs"
                                    color="gray.400"
                                    _hover={{bg: 'gray.700', color: 'gray.200'}}
                                >
                                    X
                                </Button>
                            </Dialog.CloseTrigger>
                        </Box>
                    </Dialog.Header>

                    <Dialog.Body p={6}>
                        <Box as="form" onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }}>

                            {/* Название */}
                            <Box mb={4}>
                                <Heading mb={1} size="sm" color="gray.200">
                                    Название
                                </Heading>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    p={2}
                                    placeholder="Введите название категории"
                                    bg="gray.800"
                                    border="1px solid"
                                    borderColor="gray.700"
                                    borderRadius="md"
                                    _focus={{borderColor: 'gray.500', boxShadow: '0 0 6px gray'}}
                                    h="36px"
                                    fontSize="sm"
                                    _hover={{borderColor: 'gray.500'}}
                                    transition="border-color 0.15s ease"
                                    autoFocus
                                />
                            </Box>

                            {/* Родитель */}
                            <Box mb={4}>
                                <Heading mb={1} size="sm" color="gray.200">
                                    Родитель
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
                                    <Select.Label>Выберите родителя</Select.Label>

                                    <Select.Control bg="gray.800" borderColor="gray.500" border="1px solid"
                                                    borderRadius="md">
                                        <Select.Trigger>
                                            <Select.ValueText placeholder="Нет родителя">
                                                {parent
                                                    ? categories.find((c) => c._id.toString() === parent)?.name
                                                    : 'Нет родителя'}
                                            </Select.ValueText>
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                            <Select.Indicator/>
                                            <Select.ClearTrigger onClick={() => setParent(undefined)}/>
                                        </Select.IndicatorGroup>
                                    </Select.Control>

                                    <Select.Positioner>
                                        <Select.Content
                                            bg="gray.800"
                                            color="gray.200"
                                            borderWidth="1px"
                                            borderColor="gray.600"
                                            rounded="md"
                                            boxShadow="lg"
                                            maxH="220px"
                                            overflowY="auto"
                                        >
                                            {collection.items.map((item) => (
                                                <Select.Item key={item.value} item={item}>
                                                    {item.label}
                                                    <Select.ItemIndicator/>
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                            </Box>

                            {/* Чекбоксы (новый стиль Chakra v3) */}
                            <HStack gap={6} mb={1}>
                                {/* isMenuItem */}
                                <Checkbox.Root
                                    checked={isMenuItem}
                                    onCheckedChange={(e) => setIsMenuItem(!!e.checked)}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox.HiddenInput/>

                                    <Checkbox.Control
                                        className="
                                            size-4 rounded-md border border-gray-600 bg-gray-800
                                            data-[checked]:bg-gray-500 data-[checked]:border-gray-400
                                            transition-all duration-150
                                        "
                                    />

                                    <Checkbox.Label>
                                        <Text color={isMenuItem ? 'gray.200' : 'gray.300'} fontSize="sm">
                                            В меню
                                        </Text>
                                    </Checkbox.Label>
                                </Checkbox.Root>

                                {/* showGroupTitle */}
                                <Checkbox.Root
                                    checked={showGroupTitle}
                                    onCheckedChange={(e) => setShowGroupTitle(!!e.checked)}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox.HiddenInput/>

                                    <Checkbox.Control
                                        className="
                                            size-4 rounded-md border border-gray-600 bg-gray-800
                                            data-[checked]:bg-gray-500 data-[checked]:border-gray-400
                                            transition-all duration-150
                                        "
                                    />

                                    <Checkbox.Label>
                                        <Text color={showGroupTitle ? 'gray.200' : 'gray.300'} fontSize="sm">
                                            Показывать заголовок
                                        </Text>
                                    </Checkbox.Label>
                                </Checkbox.Root>
                            </HStack>

                        </Box>
                    </Dialog.Body>

                    <Dialog.Footer borderTop="1px solid" borderColor="gray.700" mt={0} p={4} gap={3} display="flex"
                                   justifyContent="flex-end">
                        <Button
                            p={2}
                            variant="outline"
                            size="sm"
                            color="gray.300"
                            borderColor="gray.700"
                            _hover={{
                                bg: 'gray.800',
                                borderColor: 'gray.400',
                                color: 'gray.200',
                            }}
                            _active={{bg: 'gray.700'}}
                            onClick={close}
                        >
                            Отмена
                        </Button>
                        <Button
                            p={2}
                            colorScheme="gray"
                            size="sm"
                            bg="gray.500"
                            color="white"
                            borderRadius="md"
                            _hover={{
                                bg: 'gray.400',
                                boxShadow: '0 0 12px rgba(128,128,128,0.45)',
                            }}
                            _active={{bg: 'gray.600'}}
                            onClick={onSubmit}
                            loading={isPending}
                        >
                            Создать
                        </Button>
                    </Dialog.Footer>

                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}
