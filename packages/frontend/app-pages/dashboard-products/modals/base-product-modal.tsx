'use client'

import {
    Alert,
    Box,
    Button,
    Dialog,
    Flex,
    Heading,
    IconButton,
    Image,
    Input,
    Separator,
    Spinner,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react'
import {useEffect, useMemo, useRef, useState, type FormEvent} from 'react'
import {useQuery} from '@tanstack/react-query'
import {
    Controller,
    SubmitHandler,
    useController,
    useFieldArray,
    useForm,
} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Area} from 'react-easy-crop'
import {FiAlertCircle, FiEdit2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

import {getCategories} from '../actions'
import {
    productSchema,
    ProductFormValues,
} from '@/app-pages/dashboard-products/validation'
import {
    Filters,
    getCroppedImg,
    ImageEditor,
} from './image-editor'

type ProductModalProps = {
    isOpen: boolean
    onClose: VoidFunction
    title: string
    submitText: string
    submitLoadingText?: string
    onSubmit: (
        values: Omit<ProductFormValues, 'imageFile'> & {
            removeImage?: boolean
        },
        file?: File
    ) => Promise<void>
    initialValues?: Partial<ProductFormValues> & {
        image?: string
    }
    isLoadingInitial?: boolean
    productIdForImageUpload?: string
}

const DEFAULT_PRICE = {
    size: '',
    price: 0,
}

const DEFAULT_FORM_VALUES: ProductFormValues = {
    name: '',
    description: '',
    prices: [DEFAULT_PRICE],
    categories: [],
    hidden: false,
    isAlcohol: false,
    imageFile: null,
}

const MODAL_STYLES = {
    background: 'rgba(24,26,28,0.95)',
    borderColor: 'gray.700',
    inputBackground: 'gray.800',
}

const SWITCH_STYLES = {
    width: '38px',
    height: '20px',
    thumbSize: '14px',
    translateX: '16px',
}

const normalizePriceValue = (value: string) =>
    parseFloat(value.replace(',', '.')) || 0

const sanitizePriceInput = (value: string) => {
    let sanitizedValue = value.replace(/[^0-9.,]/g, '')

    const dotIndex = sanitizedValue.indexOf('.')
    const commaIndex = sanitizedValue.indexOf(',')

    const separatorIndex = Math.min(
        dotIndex === -1 ? Infinity : dotIndex,
        commaIndex === -1 ? Infinity : commaIndex
    )

    if (separatorIndex !== Infinity) {
        const separator = sanitizedValue[separatorIndex]

        const integerPart = sanitizedValue
            .slice(0, separatorIndex)
            .replace(/[.,]/g, '')

        const decimalPart = sanitizedValue
            .slice(separatorIndex + 1)
            .replace(/[.,]/g, '')

        sanitizedValue = `${integerPart}${separator}${decimalPart}`
    } else {
        sanitizedValue = sanitizedValue.replace(/[.,]/g, '')
    }

    return sanitizedValue
}

const getAbsoluteImageUrl = (src?: string) => {
    if (!src) {
        return ''
    }

    if (src.startsWith('http') || src.startsWith('blob:')) {
        return src
    }

    return `${window.location.origin}${src}`
}

type ToggleSwitchProps = {
    value: boolean
    label: string
    activeColor: string
    onChange: (value: boolean) => void
}

const ToggleSwitch = ({
                          value,
                          label,
                          activeColor,
                          onChange,
                      }: ToggleSwitchProps) => (
    <Flex align="center" gap={2} cursor="pointer" userSelect="none">
        <Text
            color={value ? activeColor : 'gray.300'}
            fontWeight="500"
            fontSize="sm"
        >
            {label}
        </Text>

        <Box
            role="switch"
            aria-checked={value}
            tabIndex={0}
            w={SWITCH_STYLES.width}
            h={SWITCH_STYLES.height}
            borderRadius="full"
            px="2px"
            display="flex"
            alignItems="center"
            bg={value ? `${activeColor}Alpha.100` : 'transparent'}
            border="1px solid"
            borderColor={value ? activeColor : 'gray.600'}
            transition="all 180ms ease"
            onClick={() => onChange(!value)}
        >
            <Box
                w={SWITCH_STYLES.thumbSize}
                h={SWITCH_STYLES.thumbSize}
                borderRadius="full"
                bg={value ? activeColor : 'gray.400'}
                transform={
                    value
                        ? `translateX(${SWITCH_STYLES.translateX})`
                        : 'translateX(0px)'
                }
                transition="all 180ms ease"
            />
        </Box>
    </Flex>
)

export const BaseProductModal = ({
                                     isOpen,
                                     onClose,
                                     title,
                                     submitText,
                                     submitLoadingText = 'Сохранение...',
                                     onSubmit,
                                     initialValues,
                                     isLoadingInitial = false,
                                     productIdForImageUpload,
                                 }: ProductModalProps) => {
    const [isDragActive, setIsDragActive] = useState(false)
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
    const [imageEditorSource, setImageEditorSource] = useState('')
    const [imageFlip, setImageFlip] = useState({
        horizontal: false,
        vertical: false,
    })
    const [shouldRemoveImage, setShouldRemoveImage] = useState(false)

    const imageSourceRef = useRef<string>('')

    const {data: {data: categories = []} = {}} = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    })

    const {
        control,
        register,
        reset,
        handleSubmit,
        setError,
        clearErrors,
        formState: {errors, isSubmitting},
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: DEFAULT_FORM_VALUES,
    })

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'prices',
    })

    const {
        field: {value: selectedImageFile, onChange: setSelectedImageFile},
    } = useController({
        control,
        name: 'imageFile',
    })

    const handleClose = () => {
        setShouldRemoveImage(false)
        onClose()
    }

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = ''
            return
        }

        document.body.style.overflow = 'hidden'

        reset({
            name: initialValues?.name ?? '',
            description: initialValues?.description ?? '',
            prices:
                initialValues?.prices?.length
                    ? initialValues.prices
                    : [DEFAULT_PRICE],
            categories: initialValues?.categories ?? [],
            hidden: initialValues?.hidden ?? false,
            isAlcohol: initialValues?.isAlcohol ?? false,
            imageFile: null,
        })

        clearErrors()

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen, initialValues, reset, clearErrors])

    const previewImageUrl = useMemo(() => {
        if (selectedImageFile) {
            return URL.createObjectURL(selectedImageFile)
        }

        if (shouldRemoveImage) {
            return null
        }

        return initialValues?.image || null
    }, [initialValues?.image, selectedImageFile, shouldRemoveImage])

    useEffect(() => {
        return () => {
            if (previewImageUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewImageUrl)
            }
        }
    }, [previewImageUrl])

    const isUploadingImage =
        isSubmitting && Boolean(selectedImageFile) && Boolean(productIdForImageUpload)

    const imagePreviewLabel = selectedImageFile
        ? selectedImageFile.name
        : initialValues?.image
            ? 'Текущее изображение'
            : ''

    const handleImageSelect = (file?: File) => {
        if (!file || !file.type.startsWith('image/')) {
            return
        }

        setSelectedImageFile(file)
        setShouldRemoveImage(false)
        clearErrors('imageFile')
    }

    const handleImageEditorOpen = () => {
        const source = getAbsoluteImageUrl(previewImageUrl || undefined)

        if (!source) {
            return
        }

        imageSourceRef.current = source
        setImageEditorSource(source)
        setImageFlip({
            horizontal: false,
            vertical: false,
        })
        setIsImageEditorOpen(true)
    }

    const handleImageEditorSave = async (
        croppedAreaPixels: Area,
        rotation: number,
        flip: {
            horizontal: boolean
            vertical: boolean
        },
        filters: Filters
    ) => {
        try {
            const croppedImageFile = await getCroppedImg(
                imageSourceRef.current,
                croppedAreaPixels,
                rotation,
                flip,
                filters
            )

            setSelectedImageFile(croppedImageFile)
            clearErrors('imageFile')
        } catch (error) {
            console.error(error)
        }
    }

    const handleFormSubmit: SubmitHandler<ProductFormValues> = async (
        values
    ) => {
        clearErrors()

        try {
            await onSubmit(
                {
                    name: values.name,
                    description: values.description,
                    categories: values.categories,
                    hidden: values.hidden,
                    isAlcohol: values.isAlcohol,
                    prices: values.prices.map((priceItem) => ({
                        ...priceItem,
                        price: normalizePriceValue(String(priceItem.price)),
                    })),
                    removeImage: shouldRemoveImage && !values.imageFile,
                },
                values.imageFile || undefined
            )

            handleClose()
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Ошибка при сохранении',
            })
        }
    }

    return (
        <>
            <Dialog.Root
                open={isOpen}
                onOpenChange={({open}) => {
                    if (!open) {
                        handleClose()
                    }
                }}
            >
                <Dialog.Backdrop
                    bg="blackAlpha.800"
                    backdropFilter="blur(8px)"
                    position="fixed"
                    inset={0}
                    overflow="hidden"
                />

                <Dialog.Positioner
                    position="fixed"
                    inset={0}
                    overflow="hidden"
                    px={{base: 0, md: 6}}
                    py={{base: 0, md: 8}}
                    display="flex"
                    alignItems={{base: 'stretch', md: 'center'}}
                    justifyContent="center"
                >
                    <Dialog.Content
                        bg={MODAL_STYLES.background}
                        borderRadius={{base: 'none', md: '2xl'}}
                        border={{base: 'none', md: '1px solid'}}
                        borderColor={MODAL_STYLES.borderColor}
                        color="white"
                        w={{base: '100vw', md: '3xl'}}
                        h={{base: '100dvh', md: 'auto'}}
                        minH={{base: '100dvh', md: 'unset'}}
                        maxW={{base: '100vw', md: '3xl'}}
                        maxH={{base: '100dvh', md: '90vh'}}
                        m={0}
                        overflow="hidden"
                        backdropFilter="blur(18px)"
                        display="flex"
                        flexDirection="column"
                        outline="none"
                        boxShadow="none"
                        _focusVisible={{
                            outline: 'none',
                            boxShadow: 'none',
                        }}
                    >
                        <Dialog.Header
                            borderBottom="1px solid"
                            borderColor={MODAL_STYLES.borderColor}
                            px={{base: 4, md: 6}}
                            py={4}
                            flexShrink={0}
                        >
                            <Flex align="center" justify="space-between" gap={4}>
                                <Heading
                                    size={{base: 'sm', md: 'md'}}
                                    color="gray.200"
                                >
                                    {title}
                                </Heading>

                                <Dialog.CloseTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        color="gray.400"
                                        minW="unset"
                                        px={3}
                                        outline="none"
                                        boxShadow="none"
                                        _hover={{
                                            bg: 'gray.700',
                                            color: 'gray.200',
                                        }}
                                        _focusVisible={{
                                            outline: 'none',
                                            boxShadow: 'none',
                                        }}
                                    >
                                        ×
                                    </Button>
                                </Dialog.CloseTrigger>
                            </Flex>
                        </Dialog.Header>

                        <Dialog.Body
                            px={{base: 4, md: 6}}
                            py={{base: 4, md: 5}}
                            overflowY="auto"
                            overscrollBehavior="contain"
                            flex="1"
                            minH={0}
                        >
                            {isLoadingInitial ? (
                                <Flex align="center" justify="center" py={10}>
                                    <Spinner size="lg" />
                                </Flex>
                            ) : (
                                <form onSubmit={handleSubmit(handleFormSubmit)}>
                                    <Stack gap={5}>
                                        {errors.root && (
                                            <Alert.Root
                                                status="error"
                                                variant="subtle"
                                            >
                                                <Alert.Indicator asChild>
                                                    <FiAlertCircle />
                                                </Alert.Indicator>
                                                <Alert.Content>
                                                    <Alert.Description fontSize="sm">
                                                        {errors.root.message}
                                                    </Alert.Description>
                                                </Alert.Content>
                                            </Alert.Root>
                                        )}

                                        <Box>
                                            <Heading
                                                mb={2}
                                                size="sm"
                                                color="gray.200"
                                            >
                                                Название
                                            </Heading>

                                            <Input
                                                {...register('name')}
                                                placeholder="Введите название"
                                                bg={MODAL_STYLES.inputBackground}
                                                borderColor="gray.700"
                                                h="42px"
                                                fontSize="sm"
                                                outline="none"
                                                boxShadow="none"
                                                _focusVisible={{
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    borderColor: 'gray.500',
                                                }}
                                            />

                                            {errors.name && (
                                                <Text
                                                    color="red.400"
                                                    mt={1}
                                                    fontSize="xs"
                                                >
                                                    {errors.name.message}
                                                </Text>
                                            )}
                                        </Box>

                                        <Box>
                                            <Heading
                                                mb={2}
                                                size="sm"
                                                color="gray.200"
                                            >
                                                Описание
                                            </Heading>

                                            <Textarea
                                                {...register('description')}
                                                placeholder="Краткое описание товара"
                                                bg={MODAL_STYLES.inputBackground}
                                                borderColor="gray.700"
                                                minH={{base: '96px', md: '110px'}}
                                                fontSize="sm"
                                                outline="none"
                                                boxShadow="none"
                                                _focusVisible={{
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    borderColor: 'gray.500',
                                                }}
                                            />

                                            {errors.description && (
                                                <Text
                                                    color="red.400"
                                                    mt={1}
                                                    fontSize="xs"
                                                >
                                                    {errors.description.message}
                                                </Text>
                                            )}
                                        </Box>

                                        <Separator borderColor="gray.700" />

                                        <Box>
                                            <Heading
                                                size="sm"
                                                mb={3}
                                                color="gray.200"
                                            >
                                                Изображение
                                            </Heading>

                                            <Box
                                                border="2px dashed"
                                                borderColor={
                                                    selectedImageFile
                                                        ? 'gray.400'
                                                        : 'gray.700'
                                                }
                                                borderRadius="xl"
                                                p={{base: 4, md: 5}}
                                                bg={
                                                    isDragActive
                                                        ? 'rgba(128,128,128,0.12)'
                                                        : 'rgba(35,37,40,0.6)'
                                                }
                                                transition="all 0.2s ease"
                                                textAlign="center"
                                                cursor="pointer"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            'product-image-input'
                                                        )
                                                        ?.click()
                                                }
                                                onDragOver={(event) => {
                                                    event.preventDefault()
                                                    setIsDragActive(true)
                                                }}
                                                onDragLeave={(event) => {
                                                    event.preventDefault()
                                                    setIsDragActive(false)
                                                }}
                                                onDrop={(event) => {
                                                    event.preventDefault()
                                                    setIsDragActive(false)
                                                    handleImageSelect(
                                                        event.dataTransfer.files?.[0]
                                                    )
                                                }}
                                            >
                                                {previewImageUrl ? (
                                                    <Flex
                                                        direction="column"
                                                        align="center"
                                                        gap={3}
                                                    >
                                                        <Box
                                                            position="relative"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                        >
                                                            <Image
                                                                src={previewImageUrl}
                                                                alt="preview"
                                                                borderRadius="lg"
                                                                maxH={{
                                                                    base: '180px',
                                                                    md: '220px',
                                                                }}
                                                                objectFit="cover"
                                                            />

                                                            <IconButton
                                                                type="button"
                                                                aria-label="Удалить изображение"
                                                                position="absolute"
                                                                top={2}
                                                                left={2}
                                                                size="sm"
                                                                bg="blackAlpha.700"
                                                                color="red.400"
                                                                outline="none"
                                                                boxShadow="none"
                                                                _focusVisible={{
                                                                    outline: 'none',
                                                                    boxShadow: 'none',
                                                                }}
                                                                onClick={(event) => {
                                                                    event.preventDefault()
                                                                    event.stopPropagation()

                                                                    if (selectedImageFile) {
                                                                        setSelectedImageFile(null)
                                                                    } else {
                                                                        setShouldRemoveImage(true)
                                                                    }
                                                                }}
                                                            >
                                                                <FaTrash size={12} />
                                                            </IconButton>

                                                            <IconButton
                                                                type="button"
                                                                aria-label="Редактировать изображение"
                                                                position="absolute"
                                                                top={2}
                                                                right={2}
                                                                size="sm"
                                                                bg="blackAlpha.700"
                                                                color="white"
                                                                outline="none"
                                                                boxShadow="none"
                                                                _focusVisible={{
                                                                    outline: 'none',
                                                                    boxShadow: 'none',
                                                                }}
                                                                onClick={(event) => {
                                                                    event.preventDefault()
                                                                    event.stopPropagation()
                                                                    handleImageEditorOpen()
                                                                }}
                                                            >
                                                                <FiEdit2 />
                                                            </IconButton>
                                                        </Box>

                                                        {isUploadingImage ? (
                                                            <Flex align="center" gap={2}>
                                                                <Spinner size="xs" />
                                                                <Text fontSize="xs">
                                                                    Загрузка изображения...
                                                                </Text>
                                                            </Flex>
                                                        ) : (
                                                            <Text
                                                                fontSize="xs"
                                                                color="gray.400"
                                                                textAlign="center"
                                                            >
                                                                {imagePreviewLabel}
                                                            </Text>
                                                        )}
                                                    </Flex>
                                                ) : (
                                                    <Text
                                                        color="gray.400"
                                                        fontSize="sm"
                                                    >
                                                        Перетащите файл сюда или нажмите для выбора
                                                    </Text>
                                                )}
                                            </Box>

                                            <Input
                                                id="product-image-input"
                                                type="file"
                                                accept="image/*"
                                                display="none"
                                                onChange={(event) =>
                                                    handleImageSelect(event.target.files?.[0])
                                                }
                                            />

                                            {errors.imageFile && (
                                                <Alert.Root
                                                    status="error"
                                                    variant="subtle"
                                                    mt={3}
                                                >
                                                    <Alert.Indicator asChild>
                                                        <FiAlertCircle />
                                                    </Alert.Indicator>
                                                    <Alert.Content>
                                                        <Alert.Description fontSize="xs">
                                                            {errors.imageFile.message}
                                                        </Alert.Description>
                                                    </Alert.Content>
                                                </Alert.Root>
                                            )}
                                        </Box>

                                        <Box>
                                            <Heading
                                                size="sm"
                                                mb={3}
                                                color="gray.200"
                                            >
                                                Цены
                                            </Heading>

                                            <Stack gap={3}>
                                                {fields.map((priceField, index) => (
                                                    <Box key={priceField.id}>
                                                        <Flex
                                                            direction={{
                                                                base: 'column',
                                                                sm: 'row',
                                                            }}
                                                            gap={3}
                                                            p={3}
                                                            borderRadius="lg"
                                                            border="1px solid"
                                                            borderColor="gray.700"
                                                            bg="gray.850"
                                                        >
                                                            <Box flex={1}>
                                                                <Input
                                                                    {...register(
                                                                        `prices.${index}.size`
                                                                    )}
                                                                    placeholder="Размер"
                                                                    bg="gray.800"
                                                                    fontSize="sm"
                                                                    outline="none"
                                                                    boxShadow="none"
                                                                    _focusVisible={{
                                                                        outline: 'none',
                                                                        boxShadow: 'none',
                                                                        borderColor: 'gray.500',
                                                                    }}
                                                                />

                                                                {errors.prices?.[index]?.size && (
                                                                    <Text
                                                                        color="red.400"
                                                                        fontSize="xs"
                                                                        mt={1}
                                                                    >
                                                                        {
                                                                            errors.prices?.[index]?.size?.message
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <Box flex={1}>
                                                                <Input
                                                                    {...register(
                                                                        `prices.${index}.price`,
                                                                        {
                                                                            setValueAs:
                                                                                (value) =>
                                                                                    typeof value ===
                                                                                    'string'
                                                                                        ? normalizePriceValue(value)
                                                                                        : value,
                                                                        }
                                                                    )}
                                                                    placeholder="Цена"
                                                                    type="text"
                                                                    bg="gray.800"
                                                                    fontSize="sm"
                                                                    outline="none"
                                                                    boxShadow="none"
                                                                    _focusVisible={{
                                                                        outline: 'none',
                                                                        boxShadow: 'none',
                                                                        borderColor: 'gray.500',
                                                                    }}
                                                                    onInput={(
                                                                        event: FormEvent<HTMLInputElement>
                                                                    ) => {
                                                                        event.currentTarget.value =
                                                                            sanitizePriceInput(
                                                                                event.currentTarget.value
                                                                            )
                                                                    }}
                                                                    onBlur={(event) => {
                                                                        event.currentTarget.value =
                                                                            event.currentTarget.value.replace(
                                                                                ',',
                                                                                '.'
                                                                            )
                                                                    }}
                                                                />

                                                                {errors.prices?.[index]?.price && (
                                                                    <Text
                                                                        color="red.400"
                                                                        fontSize="xs"
                                                                        mt={1}
                                                                    >
                                                                        {
                                                                            errors.prices?.[index]?.price?.message
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <IconButton
                                                                type="button"
                                                                aria-label="Удалить цену"
                                                                color="red.400"
                                                                variant="ghost"
                                                                alignSelf={{
                                                                    base: 'flex-end',
                                                                    sm: 'center',
                                                                }}
                                                                outline="none"
                                                                boxShadow="none"
                                                                _focusVisible={{
                                                                    outline: 'none',
                                                                    boxShadow: 'none',
                                                                }}
                                                                onClick={() => remove(index)}
                                                            >
                                                                <FaTrash />
                                                            </IconButton>
                                                        </Flex>
                                                    </Box>
                                                ))}

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    bg="gray.600"
                                                    color="white"
                                                    alignSelf="flex-start"
                                                    outline="none"
                                                    boxShadow="none"
                                                    _focusVisible={{
                                                        outline: 'none',
                                                        boxShadow: 'none',
                                                    }}
                                                    onClick={() =>
                                                        append(DEFAULT_PRICE)
                                                    }
                                                >
                                                    Добавить цену
                                                </Button>
                                            </Stack>
                                        </Box>

                                        <Box>
                                            <Heading
                                                size="sm"
                                                mb={3}
                                                color="gray.200"
                                            >
                                                Категории
                                            </Heading>

                                            <Flex wrap="wrap" gap={2}>
                                                {categories.map(({id, name}) => (
                                                    <Controller
                                                        key={id}
                                                        name="categories"
                                                        control={control}
                                                        render={({field}) => {
                                                            const isSelected =
                                                                field.value?.includes(id)

                                                            return (
                                                                <Box
                                                                    px={3}
                                                                    py={2}
                                                                    borderRadius="md"
                                                                    border="1px solid"
                                                                    borderColor={
                                                                        isSelected
                                                                            ? 'gray.400'
                                                                            : 'gray.700'
                                                                    }
                                                                    bg={
                                                                        isSelected
                                                                            ? 'gray.700'
                                                                            : 'gray.800'
                                                                    }
                                                                    color={
                                                                        isSelected
                                                                            ? 'gray.100'
                                                                            : 'gray.300'
                                                                    }
                                                                    fontSize="xs"
                                                                    cursor="pointer"
                                                                    transition="all 0.2s ease"
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            field.onChange(
                                                                                field.value?.filter(
                                                                                    (categoryId: string) =>
                                                                                        categoryId !== id
                                                                                )
                                                                            )
                                                                            return
                                                                        }

                                                                        field.onChange([
                                                                            ...(field.value || []),
                                                                            id,
                                                                        ])
                                                                    }}
                                                                >
                                                                    {name}
                                                                </Box>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </Flex>
                                        </Box>

                                        <Flex
                                            direction={{
                                                base: 'column',
                                                sm: 'row',
                                            }}
                                            gap={4}
                                        >
                                            <Controller
                                                name="hidden"
                                                control={control}
                                                render={({field}) => (
                                                    <ToggleSwitch
                                                        label="Скрыт"
                                                        value={!!field.value}
                                                        activeColor="gray.300"
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="isAlcohol"
                                                control={control}
                                                render={({field}) => (
                                                    <ToggleSwitch
                                                        label="Алкогольный"
                                                        value={!!field.value}
                                                        activeColor="purple.300"
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </Flex>
                                    </Stack>

                                    <Dialog.Footer
                                        borderTop="1px solid"
                                        borderColor="gray.700"
                                        mt={6}
                                        pt={4}
                                        px={0}
                                    >
                                        <Flex
                                            w="full"
                                            direction={{
                                                base: 'column-reverse',
                                                sm: 'row',
                                            }}
                                            justify="flex-end"
                                            gap={3}
                                        >
                                            <Button
                                                type="button"
                                                w={{base: 'full', sm: 'auto'}}
                                                variant="outline"
                                                borderColor="gray.700"
                                                color="gray.300"
                                                outline="none"
                                                boxShadow="none"
                                                _focusVisible={{
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                }}
                                                onClick={handleClose}
                                            >
                                                Отмена
                                            </Button>

                                            <Button
                                                w={{base: 'full', sm: 'auto'}}
                                                type="submit"
                                                loading={isSubmitting}
                                                loadingText={submitLoadingText}
                                                bg="gray.500"
                                                color="white"
                                                outline="none"
                                                boxShadow="none"
                                                _hover={{
                                                    bg: 'gray.400',
                                                }}
                                                _focusVisible={{
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                }}
                                            >
                                                {submitText}
                                            </Button>
                                        </Flex>
                                    </Dialog.Footer>
                                </form>
                            )}
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            <ImageEditor
                isOpen={isImageEditorOpen}
                onClose={() => setIsImageEditorOpen(false)}
                imageSrc={imageEditorSource}
                onSave={handleImageEditorSave}
                initialFlip={imageFlip}
                onFlipChange={setImageFlip}
            />
        </>
    )
}