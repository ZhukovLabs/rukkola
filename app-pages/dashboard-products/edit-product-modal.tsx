'use client'

import {
    Dialog,
    Button,
    Box,
    Input,
    Textarea,
    Text,
    HStack,
    Flex,
    Stack,
    Heading,
    IconButton,
    Image,
    Spinner,
    Alert,
    Separator,
} from '@chakra-ui/react'
import {useSearchParams, useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useForm, useFieldArray, Controller, SubmitHandler} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {getCategories, getProductById, updateProductData} from './actions'
import {productSchema, ProductFormValues} from './validation'
import {PortionPrice} from '@/models/product'
import {CategoryType} from '@/models/category'
import {FiAlertCircle} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

type Props = {
    refetch?: VoidFunction
}

type ProductFromServer = {
    _id: string
    name: string
    description?: string
    prices: PortionPrice[]
    categories: CategoryType[]
    hidden: boolean
    imageUrl?: string
}

async function uploadImageToApi(productId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('id', productId)
    formData.append('file', file)
    const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
    })
    if (!res.ok) {
        const err: { error?: string } = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to upload image')
    }
}

export const EditProductModal = ({refetch}: Props) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const isOpen = searchParams.has('edit');
    const productId = searchParams.get('edit') ?? '';

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageError, setImageError] = useState<string | null>(null)
    const [dataError, setDataError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const {data: allCategories = []} = useQuery<CategoryType[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    })

    const {
        data: product,
        isLoading: isProductLoading,
        isError: isProductError,
        error: productFetchError,
    } = useQuery<ProductFromServer>({
        queryKey: ['product', productId],
        queryFn: () => getProductById(productId),
        enabled: Boolean(productId),
    })

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: {errors},
        getValues
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            prices: [{size: '', price: 0}],
            categories: [],
            hidden: false,
        },
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'prices',
    })

    useEffect(() => {
        if (isOpen && product) {
            reset({
                name: product.name ?? '',
                description: product.description ?? '',
                prices: product.prices.length ? product.prices : [{size: '', price: 0}],
                categories: product.categories.map(({_id}) => String(_id)) ?? [],
                hidden: Boolean(product.hidden),
            })

            queueMicrotask(() => {
                setImageFile(null)
                setImageError(null)
                setDataError(null)
            })
        }
    }, [isOpen, product, reset])

    const close = () => {
        const params = new URLSearchParams(window.location.search)
        params.delete('edit')
        router.push(`?${params.toString()}`, {scroll: false})
    }

    const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
        setDataError(null)
        setImageError(null)

        const formatted: ProductFormValues = {
            ...values,
            prices: values.prices.map((p) => ({
                ...p,
                price: parseFloat(String(p.price).replace(',', '.')) || 0,
            })),
        }

        try {
            setIsSubmitting(true)
            await updateProductData(productId, {
                name: formatted.name,
                description: formatted.description ?? '',
                prices: formatted.prices,
                categories: formatted.categories ?? [],
                hidden: formatted.hidden,
            })

            if (imageFile) {
                setIsUploadingImage(true)
                try {
                    await uploadImageToApi(productId, imageFile)
                    setIsUploadingImage(false)
                    setImageError(null)
                } catch (err: unknown) {
                    setIsUploadingImage(false)
                    setImageError(err instanceof Error ? err.message : 'Не удалось загрузить изображение')
                    setIsSubmitting(false)
                    return
                }
            }

            refetch?.()
            setIsSubmitting(false)
            close()
        } catch (err: unknown) {
            setDataError(err instanceof Error ? err.message : 'Не удалось обновить продукт')
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
            <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(8px)"/>
            <Dialog.Positioner>
                <Dialog.Content
                    bg="rgba(24,26,28,0.95)"
                    borderRadius="2xl"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="gray.700"
                    color="white"
                    maxW="3xl"
                    w="full"
                    backdropFilter="blur(18px)"
                    transition="all 0.25s ease"
                >
                    <Dialog.Header borderBottom="1px solid" borderColor="gray.700">
                        <Flex justify="space-between" align="center" p={4}>
                            <Heading size="md" color="teal.200" fontWeight="semibold" letterSpacing="0.3px">
                                Редактировать товар
                            </Heading>
                            <Dialog.CloseTrigger asChild>
                                <Button
                                    onClick={close}
                                    variant="ghost"
                                    colorScheme="gray"
                                    size="xs"
                                    color="gray.400"
                                    _hover={{bg: 'gray.700', color: 'teal.200'}}
                                >
                                    X
                                </Button>
                            </Dialog.CloseTrigger>
                        </Flex>
                    </Dialog.Header>

                    <Dialog.Body p={6}>
                        {isProductLoading ? (
                            <Flex align="center" justify="center" p={8}>
                                <Spinner size="lg"/>
                            </Flex>
                        ) : isProductError ? (
                            <Alert.Root status="error" variant="subtle">
                                <Alert.Indicator asChild>
                                    <FiAlertCircle color="red.400"/>
                                </Alert.Indicator>
                                <Alert.Content>
                                    <Alert.Description fontSize="sm">
                                        {(productFetchError instanceof Error && productFetchError.message) || 'Не удалось загрузить продукт'}
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert.Root>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit, (errors, event) => {
                                console.log(errors);
                                console.log(getValues());
                            })}>

                                <Stack gap={5}>
                                    {dataError && (
                                        <Alert.Root status="error" variant="subtle">
                                            <Alert.Indicator asChild>
                                                <FiAlertCircle color="red.400"/>
                                            </Alert.Indicator>
                                            <Alert.Content>
                                                <Alert.Description fontSize="sm">{dataError}</Alert.Description>
                                            </Alert.Content>
                                        </Alert.Root>
                                    )}

                                    {/* Название */}
                                    <Box>
                                        <Heading mb={1} size="sm" color="teal.200">
                                            Название
                                        </Heading>
                                        <Input
                                            {...register('name')}
                                            p={2}
                                            placeholder="Введите название"
                                            bg="gray.800"
                                            border="1px solid"
                                            borderColor={errors.name ? 'red.400' : 'gray.700'}
                                            borderRadius="md"
                                            _focus={{borderColor: 'teal.500', boxShadow: '0 0 6px teal'}}
                                            h="36px"
                                            fontSize="sm"
                                            _hover={{borderColor: 'teal.500'}}
                                            transition="border-color 0.15s ease"
                                        />
                                        {errors.name && (
                                            <Text color="red.400" mt={1} fontSize="xs">
                                                {errors.name.message}
                                            </Text>
                                        )}
                                    </Box>

                                    {/* Описание */}
                                    <Box>
                                        <Heading mb={1} size="sm" color="teal.200">
                                            Описание
                                        </Heading>
                                        <Textarea
                                            {...register('description')}
                                            placeholder="Краткое описание товара"
                                            bg="gray.800"
                                            border="1px solid"
                                            borderColor={errors.description ? 'red.400' : 'gray.700'}
                                            borderRadius="md"
                                            minH="80px"
                                            _focus={{borderColor: 'teal.500', boxShadow: '0 0 6px teal'}}
                                            fontSize="sm"
                                            p={2}
                                            _hover={{borderColor: 'teal.500'}}
                                            transition="border-color 0.15s ease"
                                        />
                                        {errors.description && (
                                            <Text color="red.400" mt={1} fontSize="xs">
                                                {errors.description.message}
                                            </Text>
                                        )}
                                    </Box>

                                    <Separator borderColor="gray.700"/>

                                    {/* Изображение */}
                                    <Box>
                                        <Heading size="sm" mb={2} color="teal.200">
                                            Изображение
                                        </Heading>
                                        <Box
                                            border="2px dashed"
                                            borderColor={imageFile ? 'teal.400' : 'gray.700'}
                                            borderRadius="lg"
                                            p={4}
                                            textAlign="center"
                                            bg={isDragOver ? 'rgba(56,178,172,0.12)' : 'rgba(35,37,40,0.6)'}
                                            cursor="pointer"
                                            transition="all 0.25s ease"
                                            onClick={() => document.getElementById('update-product-image')?.click()}
                                            onDragOver={(e) => {
                                                e.preventDefault()
                                                setIsDragOver(true)
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault()
                                                setIsDragOver(false)
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                setIsDragOver(false)
                                                const file = e.dataTransfer.files[0]
                                                if (file && file.type.startsWith('image/')) {
                                                    setImageFile(file)
                                                    setImageError(null)
                                                }
                                            }}
                                        >
                                            {imageFile ? (
                                                <Flex direction="column" align="center" gap={2}>
                                                    <Image
                                                        src={URL.createObjectURL(imageFile)}
                                                        alt="preview"
                                                        borderRadius="md"
                                                        maxH="160px"
                                                        objectFit="cover"
                                                    />
                                                    {isUploadingImage ? (
                                                        <Flex align="center" gap={2} color="teal.300">
                                                            <Spinner size="xs"/>
                                                            <Text fontSize="xs">Загрузка изображения...</Text>
                                                        </Flex>
                                                    ) : (
                                                        <Text fontSize="xs" color="gray.400">
                                                            {imageFile.name}
                                                        </Text>
                                                    )}
                                                </Flex>
                                            ) : product?.imageUrl ? (
                                                <Flex direction="column" align="center" gap={2}>
                                                    <Image src={product.imageUrl} alt="product" borderRadius="md"
                                                           maxH="160px" objectFit="cover"/>
                                                    <Text fontSize="xs" color="gray.400">
                                                        Текущее изображение
                                                    </Text>
                                                </Flex>
                                            ) : (
                                                <Text color="gray.400" fontSize="sm">
                                                    Перетащите файл сюда или нажмите для выбора
                                                </Text>
                                            )}
                                        </Box>

                                        <Input
                                            id="update-product-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file && file.type.startsWith('image/')) {
                                                    setImageFile(file)
                                                    setImageError(null)
                                                }
                                            }}
                                            display="none"
                                        />

                                        {imageError && (
                                            <Alert.Root status="error" variant="subtle" mt={2}>
                                                <Alert.Indicator asChild>
                                                    <FiAlertCircle color="red.400"/>
                                                </Alert.Indicator>
                                                <Alert.Content>
                                                    <Alert.Description fontSize="xs">{imageError}</Alert.Description>
                                                </Alert.Content>
                                            </Alert.Root>
                                        )}
                                    </Box>

                                    {/* Цены */}
                                    <Box>
                                        <Heading size="sm" mb={2} color="teal.200">
                                            Цены
                                        </Heading>
                                        <Stack gap={3}>
                                            {fields.map((field, idx) => (
                                                <Box key={field.id} w="full">
                                                    <HStack
                                                        bg="gray.850"
                                                        p={3}
                                                        borderRadius="lg"
                                                        border="1px solid"
                                                        borderColor={errors.prices?.[idx] ? 'red.400' : 'gray.700'}
                                                        _hover={{borderColor: 'teal.500'}}
                                                        align="flex-start"
                                                    >
                                                        <Box flex={1}>
                                                            <Input
                                                                {...register(`prices.${idx}.size` as const)}
                                                                p={2}
                                                                placeholder="Размер"
                                                                bg="gray.800"
                                                                fontSize="sm"
                                                                h="32px"
                                                            />
                                                            {errors.prices?.[idx]?.size && (
                                                                <Text color="red.400" fontSize="xs" mt={1}>
                                                                    {errors.prices[idx]?.size?.message}
                                                                </Text>
                                                            )}
                                                        </Box>

                                                        <Box flex={1}>
                                                            <Input
                                                                {...register(`prices.${idx}.price` as const, {
                                                                    setValueAs: (v) =>
                                                                        typeof v === 'string' ? parseFloat(v.replace(',', '.')) || 0 : v,
                                                                })}
                                                                p={2}
                                                                placeholder="Цена"
                                                                type="text"
                                                                bg="gray.800"
                                                                fontSize="sm"
                                                                h="32px"
                                                                inputMode="decimal"
                                                                pattern="[0-9]*[.,]?[0-9]*"
                                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                                    const input = e.currentTarget
                                                                    // Удаляем всё, кроме цифр и разделителей
                                                                    let v = input.value.replace(/[^0-9.,]/g, '')

                                                                    // Находим первый разделитель точка или запятая
                                                                    const dotIdx = v.indexOf('.')
                                                                    const commaIdx = v.indexOf(',')
                                                                    const firstSepIdx = Math.min(
                                                                        dotIdx === -1 ? Infinity : dotIdx,
                                                                        commaIdx === -1 ? Infinity : commaIdx
                                                                    )

                                                                    if (firstSepIdx !== Infinity) {
                                                                        const sep = v[firstSepIdx] // '.' или ','
                                                                        const before = v.slice(0, firstSepIdx).replace(/[.,]/g, '')
                                                                        const after = v.slice(firstSepIdx + 1).replace(/[.,]/g, '')
                                                                        v = before + sep + after
                                                                    } else {
                                                                        v = v.replace(/[.,]/g, '')
                                                                    }

                                                                    input.value = v
                                                                }}
                                                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                                                    e.currentTarget.value = e.currentTarget.value.replace(',', '.')
                                                                }}
                                                            />
                                                            {errors.prices?.[idx]?.price && (
                                                                <Text color="red.400" fontSize="xs" mt={1}>
                                                                    {errors.prices[idx]?.price?.message}
                                                                </Text>
                                                            )}
                                                        </Box>

                                                        <IconButton
                                                            aria-label="Удалить"
                                                            color="red.400"
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            mt={1}
                                                            onClick={() => remove(idx)}
                                                        >
                                                            <FaTrash/>
                                                        </IconButton>
                                                    </HStack>
                                                </Box>
                                            ))}

                                            <Button
                                                size="xs"
                                                variant="solid"
                                                bg="teal.600"
                                                color="white"
                                                _hover={{
                                                    bg: 'teal.500',
                                                    boxShadow: '0 0 6px rgba(56,178,172,0.6)',
                                                }}
                                                _active={{bg: 'teal.700'}}
                                                onClick={() => append({size: '', price: 0})}
                                            >
                                                Добавить цену
                                            </Button>
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Heading size="sm" mb={2} color="teal.200">
                                            Категории
                                        </Heading>
                                        <Flex wrap="wrap" gap={2}>
                                            {allCategories.map(({_id, name}) => {
                                                const id = _id.toString();

                                                return (
                                                    <Controller
                                                        key={id}
                                                        name="categories"
                                                        control={control}
                                                        render={({field}) => {
                                                            const isChecked = field.value?.includes(id);

                                                            return (
                                                                <Box
                                                                    px={3}
                                                                    py={1.5}
                                                                    borderRadius="md"
                                                                    border="1px solid"
                                                                    borderColor={isChecked ? 'teal.400' : 'gray.700'}
                                                                    bg={isChecked ? 'teal.700' : 'gray.800'}
                                                                    color={isChecked ? 'teal.100' : 'gray.300'}
                                                                    fontWeight="medium"
                                                                    fontSize="xs"
                                                                    cursor="pointer"
                                                                    transition="all 0.2s ease"
                                                                    _hover={{
                                                                        borderColor: 'teal.300',
                                                                        bg: isChecked ? 'teal.600' : 'gray.750',
                                                                    }}
                                                                    onClick={() => {
                                                                        if (isChecked) {
                                                                            field.onChange(field.value?.filter((v: string) => v !== id))
                                                                        } else {
                                                                            field.onChange([...(field.value ?? []), id])
                                                                        }
                                                                    }}
                                                                >
                                                                    {name}
                                                                </Box>
                                                            )
                                                        }}
                                                    />
                                                )
                                            })}
                                        </Flex>
                                    </Box>

                                    <Controller
                                        name="hidden"
                                        control={control}
                                        render={({field}) => {
                                            const isChecked = !!field.value
                                            return (
                                                <Flex align="center" gap={2} cursor="pointer" userSelect="none">
                                                    <Text color={isChecked ? 'teal.100' : 'gray.300'} fontWeight="500"
                                                          fontSize="sm">
                                                        Скрыт
                                                    </Text>
                                                    <Box
                                                        role="switch"
                                                        aria-checked={isChecked}
                                                        tabIndex={0}
                                                        w="38px"
                                                        h="20px"
                                                        borderRadius="full"
                                                        px="2px"
                                                        display="flex"
                                                        alignItems="center"
                                                        bg={isChecked ? 'rgba(45,212,191,0.08)' : 'transparent'}
                                                        border="1px solid"
                                                        borderColor={isChecked ? 'teal.300' : 'gray.600'}
                                                        transition="all 180ms ease"
                                                        _hover={{borderColor: 'teal.300'}}
                                                        onClick={() => field.onChange(!isChecked)}
                                                    >
                                                        <Box
                                                            w="14px"
                                                            h="14px"
                                                            borderRadius="full"
                                                            bg={isChecked ? 'teal.300' : 'gray.400'}
                                                            transform={isChecked ? 'translateX(16px)' : 'translateX(0px)'}
                                                            transition="all 180ms ease"
                                                            boxShadow={isChecked ? '0 3px 8px rgba(56,178,172,0.18)' : 'none'}
                                                        />
                                                    </Box>
                                                </Flex>
                                            )
                                        }}
                                    />
                                </Stack>

                                <Dialog.Footer borderTop="1px solid" borderColor="gray.700" mt={6} pt={3} gap={3}>
                                    <Button
                                        p={2}
                                        variant="outline"
                                        size="sm"
                                        color="gray.300"
                                        borderColor="gray.700"
                                        _hover={{
                                            bg: 'gray.800',
                                            borderColor: 'teal.400',
                                            color: 'teal.200',
                                        }}
                                        _active={{bg: 'gray.700'}}
                                        onClick={close}
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        p={2}
                                        colorScheme="teal"
                                        size="sm"
                                        bg="teal.500"
                                        color="white"
                                        borderRadius="md"
                                        _hover={{
                                            bg: 'teal.400',
                                            boxShadow: '0 0 12px rgba(56,178,172,0.45)',
                                        }}
                                        _active={{bg: 'teal.600'}}
                                        type="submit"
                                        loading={isSubmitting}
                                        loadingText="Сохранение..."
                                    >
                                        Сохранить
                                    </Button>
                                </Dialog.Footer>
                            </form>
                        )}
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}
