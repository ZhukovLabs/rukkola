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
import {motion, AnimatePresence} from 'framer-motion'
import {FiAlertCircle, FiEdit2, FiUploadCloud, FiX} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

const MotionFlex = motion.create(Flex)

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
    tags: [],
    imageFile: null,
}

const MODAL_STYLES = {
    background: 'rgba(20, 21, 23, 0.96)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    inputBackground: 'rgba(255, 255, 255, 0.03)',
    inputFocusBorder: 'rgba(255, 255, 255, 0.2)',
    headerBorder: 'rgba(255, 255, 255, 0.05)',
}

const SWITCH_STYLES = {
    width: '40px',
    height: '22px',
    thumbSize: '16px',
    translateX: '18px',
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
    <Flex
        align="center"
        gap={3}
        cursor="pointer"
        userSelect="none"
        onClick={() => onChange(!value)}
        _hover={{opacity: 0.9}}
        transition="opacity 0.2s"
    >
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
            bg={value ? `${activeColor}Alpha.200` : 'rgba(255, 255, 255, 0.05)'}
            border="1px solid"
            borderColor={value ? activeColor : 'rgba(255, 255, 255, 0.1)'}
            transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
        >
            <Box
                w={SWITCH_STYLES.thumbSize}
                h={SWITCH_STYLES.thumbSize}
                borderRadius="full"
                bg={value ? activeColor : 'gray.500'}
                transform={
                    value
                        ? `translateX(${SWITCH_STYLES.translateX})`
                        : 'translateX(0px)'
                }
                transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow={value ? `0 0 8px ${activeColor}80` : 'none'}
            />
        </Box>
        <Text
            color={value ? 'white' : 'gray.400'}
            fontWeight="500"
            fontSize="sm"
            transition="color 0.2s"
        >
            {label}
        </Text>
    </Flex>
)

const TAG_COLORS = [
    '#FF5F5F', // Red
    '#FF9F43', // Orange
    '#2ECC71', // Green
    '#3498DB', // Blue
    '#9B59B6', // Purple
    '#F368E0', // Pink
    '#00D2D3', // Cyan
    '#FFFFFF', // White
]

type TagInputProps = {
    onAdd: (tag: { text: string; color: string }) => void
}

const TagInput = ({onAdd}: TagInputProps) => {
    const [text, setText] = useState('')
    const [color, setColor] = useState(TAG_COLORS[0])

    const handleAdd = () => {
        const trimmed = text.trim()
        if (trimmed.length >= 2 && trimmed.length <= 12) {
            onAdd({text: trimmed, color})
            setText('')
        }
    }

    return (
        <Stack gap={3}>
            <Flex gap={2}>
                <Input
                    placeholder="Напр. Острое"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    bg={MODAL_STYLES.inputBackground}
                    borderColor="whiteAlpha.100"
                    fontSize="sm"
                    h="44px"
                    borderRadius="xl"
                    maxLength={12}
                    _focus={{
                        borderColor: 'whiteAlpha.300',
                        bg: 'whiteAlpha.100'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAdd()
                        }
                    }}
                />
                <Button
                    type="button"
                    px={6}
                    h="44px"
                    borderRadius="xl"
                    bg="white"
                    color="black"
                    fontSize="sm"
                    fontWeight="600"
                    _hover={{bg: 'gray.100'}}
                    onClick={handleAdd}
                    disabled={text.trim().length < 2 || text.trim().length > 12}
                >
                    Добавить
                </Button>
            </Flex>

            <Flex wrap="wrap" gap={2}>
                {TAG_COLORS.map((c) => (
                    <Box
                        key={c}
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        bg={c}
                        cursor="pointer"
                        border="2px solid"
                        borderColor={color === c ? 'white' : 'transparent'}
                        boxShadow={color === c ? `0 0 12px ${c}80` : 'none'}
                        transition="all 0.2s"
                        _hover={{transform: 'scale(1.1)'}}
                        onClick={() => setColor(c)}
                    />
                ))}

                <Box position="relative" w="28px" h="28px">
                    <Input
                        type="color"
                        position="absolute"
                        inset={0}
                        p={0}
                        bg="transparent"
                        border="none"
                        cursor="pointer"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        opacity={0}
                    />
                    <Flex
                        w="full"
                        h="full"
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        border="1px dashed"
                        borderColor="whiteAlpha.300"
                        align="center"
                        justify="center"
                        fontSize="lg"
                        color="whiteAlpha.600"
                        pointerEvents="none"
                        boxShadow={!TAG_COLORS.includes(color) ? `0 0 12px ${color}80` : 'none'}
                    >
                        +
                    </Flex>
                </Box>
            </Flex>
        </Stack>
    )
}


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

    const {fields: priceFields, append: appendPrice, remove: removePrice} = useFieldArray({
        control,
        name: 'prices',
    })

    const {
        fields: tagFields,
        append: appendTag,
        remove: removeTag,
    } = useFieldArray({
        control,
        name: 'tags',
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
            tags: initialValues?.tags ?? [],
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
                    tags: values.tags?.filter(tag => tag.text && tag.color) || [],
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
                        borderRadius={{base: 'none', md: '24px'}}
                        border={{base: 'none', md: '1px solid'}}
                        borderColor={MODAL_STYLES.borderColor}
                        color="white"
                        w={{base: '100vw', md: '3xl'}}
                        h={{base: '100dvh', md: 'auto'}}
                        minH={{base: '100dvh', md: 'unset'}}
                        maxW={{base: '100vw', md: '3xl'}}
                        maxH={{base: '100dvh', md: '92vh'}}
                        m={0}
                        overflow="hidden"
                        backdropFilter="blur(24px)"
                        display="flex"
                        flexDirection="column"
                        outline="none"
                        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                        _focusVisible={{
                            outline: 'none',
                        }}
                    >
                        <Dialog.Header
                            borderBottom="1px solid"
                            borderColor={MODAL_STYLES.headerBorder}
                            px={{base: 4, md: 8}}
                            py={5}
                            flexShrink={0}
                        >
                            <Flex align="center" justify="space-between" gap={4}>
                                <Heading
                                    size={{base: 'sm', md: 'md'}}
                                    color="white"
                                    fontWeight="600"
                                    letterSpacing="-0.01em"
                                >
                                    {title}
                                </Heading>

                                <Dialog.CloseTrigger asChild>
                                    <IconButton
                                        aria-label="Close"
                                        variant="ghost"
                                        size="sm"
                                        color="whiteAlpha.400"
                                        borderRadius="full"
                                        _hover={{
                                            bg: 'whiteAlpha.100',
                                            color: 'white',
                                        }}
                                        onClick={handleClose}
                                    >
                                        <FiX size={18}/>
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>
                        </Dialog.Header>

                        <Dialog.Body
                            px={{base: 4, md: 8}}
                            py={{base: 4, md: 7}}
                            overflowY="auto"
                            overscrollBehavior="contain"
                            flex="1"
                            minH={0}
                            css={{
                                '&::-webkit-scrollbar': {width: '4px'},
                                '&::-webkit-scrollbar-track': {background: 'transparent'},
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px'
                                },
                            }}
                        >
                            {isLoadingInitial ? (
                                <Flex align="center" justify="center" py={20}>
                                    <Spinner size="lg" color="whiteAlpha.400"/>
                                </Flex>
                            ) : (
                                <form onSubmit={handleSubmit(handleFormSubmit)}>
                                    <Stack gap={7}>
                                        {errors.root && (
                                            <Alert.Root
                                                status="error"
                                                variant="subtle"
                                                borderRadius="xl"
                                                bg="red.900/20"
                                                border="1px solid"
                                                borderColor="red.500/20"
                                            >
                                                <Alert.Indicator color="red.400">
                                                    <FiAlertCircle/>
                                                </Alert.Indicator>
                                                <Alert.Content>
                                                    <Alert.Description fontSize="sm" color="red.200">
                                                        {errors.root.message}
                                                    </Alert.Description>
                                                </Alert.Content>
                                            </Alert.Root>
                                        )}

                                        <Box>
                                            <Text
                                                mb={2.5}
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="whiteAlpha.800"
                                                display="flex"
                                                alignItems="center"
                                                gap={1.5}
                                            >
                                                Название
                                                <Text as="span" color="red.400">*</Text>
                                            </Text>

                                            <Input
                                                {...register('name')}
                                                placeholder="Например: Пицца Маргарита"
                                                bg={MODAL_STYLES.inputBackground}
                                                borderColor="whiteAlpha.100"
                                                h="46px"
                                                fontSize="sm"
                                                borderRadius="xl"
                                                transition="all 0.2s"
                                                _focus={{
                                                    borderColor: 'whiteAlpha.300',
                                                    bg: 'whiteAlpha.100',
                                                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05)'
                                                }}
                                                _placeholder={{color: 'whiteAlpha.300'}}
                                            />

                                            {errors.name && (
                                                <Text
                                                    color="red.400"
                                                    mt={1.5}
                                                    fontSize="xs"
                                                    fontWeight="500"
                                                >
                                                    {errors.name.message}
                                                </Text>
                                            )}
                                        </Box>

                                        <Box>
                                            <Text
                                                mb={2.5}
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="whiteAlpha.800"
                                            >
                                                Описание
                                            </Text>

                                            <Textarea
                                                {...register('description')}
                                                placeholder="Расскажите о составе и особенностях блюда..."
                                                bg={MODAL_STYLES.inputBackground}
                                                borderColor="whiteAlpha.100"
                                                minH={{base: '100px', md: '120px'}}
                                                fontSize="sm"
                                                borderRadius="xl"
                                                py={3}
                                                transition="all 0.2s"
                                                _focus={{
                                                    borderColor: 'whiteAlpha.300',
                                                    bg: 'whiteAlpha.100',
                                                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05)'
                                                }}
                                                _placeholder={{color: 'whiteAlpha.300'}}
                                            />

                                            {errors.description && (
                                                <Text
                                                    color="red.400"
                                                    mt={1.5}
                                                    fontSize="xs"
                                                    fontWeight="500"
                                                >
                                                    {errors.description.message}
                                                </Text>
                                            )}
                                        </Box>


                                        <Separator borderColor="whiteAlpha.100"/>

                                        <Box>
                                            <Text
                                                mb={3}
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="whiteAlpha.800"
                                            >
                                                Изображение
                                            </Text>

                                            <Box
                                                border="2px dashed"
                                                borderColor={
                                                    selectedImageFile
                                                        ? 'whiteAlpha.300'
                                                        : 'whiteAlpha.100'
                                                }
                                                borderRadius="2xl"
                                                p={{base: 4, md: 6}}
                                                bg={
                                                    isDragActive
                                                        ? 'whiteAlpha.100'
                                                        : 'whiteAlpha.05'
                                                }
                                                transition="all 0.3s ease"
                                                textAlign="center"
                                                cursor="pointer"
                                                _hover={{
                                                    borderColor: 'whiteAlpha.300',
                                                    bg: 'whiteAlpha.100'
                                                }}
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
                                                        gap={4}
                                                    >
                                                        <Box
                                                            position="relative"
                                                            borderRadius="xl"
                                                            overflow="hidden"
                                                            boxShadow="0 10px 20px rgba(0,0,0,0.3)"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                        >
                                                            <Image
                                                                src={previewImageUrl}
                                                                alt="preview"
                                                                maxH={{
                                                                    base: '180px',
                                                                    md: '240px',
                                                                }}
                                                                objectFit="cover"
                                                                transition="transform 0.3s"
                                                                _hover={{transform: 'scale(1.02)'}}
                                                            />

                                                            <Flex
                                                                position="absolute"
                                                                top={3}
                                                                right={3}
                                                                gap={2}
                                                            >
                                                                <IconButton
                                                                    type="button"
                                                                    aria-label="Редактировать изображение"
                                                                    size="sm"
                                                                    borderRadius="full"
                                                                    bg="blackAlpha.700"
                                                                    color="white"
                                                                    backdropFilter="blur(8px)"
                                                                    _hover={{bg: 'blackAlpha.800'}}
                                                                    onClick={(event) => {
                                                                        event.preventDefault()
                                                                        event.stopPropagation()
                                                                        handleImageEditorOpen()
                                                                    }}
                                                                >
                                                                    <FiEdit2 size={14}/>
                                                                </IconButton>

                                                                <IconButton
                                                                    type="button"
                                                                    aria-label="Удалить изображение"
                                                                    size="sm"
                                                                    borderRadius="full"
                                                                    bg="blackAlpha.700"
                                                                    color="red.400"
                                                                    backdropFilter="blur(8px)"
                                                                    _hover={{bg: 'red.900', color: 'white'}}
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
                                                                    <FaTrash size={12}/>
                                                                </IconButton>
                                                            </Flex>
                                                        </Box>

                                                        {isUploadingImage ? (
                                                            <Flex align="center" gap={3}>
                                                                <Spinner size="xs" color="whiteAlpha.400"/>
                                                                <Text fontSize="xs" color="whiteAlpha.400">
                                                                    Загрузка изображения...
                                                                </Text>
                                                            </Flex>
                                                        ) : (
                                                            <Text
                                                                fontSize="xs"
                                                                color="whiteAlpha.400"
                                                                fontWeight="500"
                                                            >
                                                                {imagePreviewLabel}
                                                            </Text>
                                                        )}
                                                    </Flex>
                                                ) : (
                                                    <Stack align="center" gap={3} py={4}>
                                                        <Box
                                                            p={4}
                                                            borderRadius="full"
                                                            bg="whiteAlpha.05"
                                                            color="whiteAlpha.400"
                                                        >
                                                            <FiUploadCloud size={32}/>
                                                        </Box>
                                                        <Box>
                                                            <Text
                                                                color="white"
                                                                fontSize="sm"
                                                                fontWeight="600"
                                                            >
                                                                Нажмите или перетащите файл
                                                            </Text>
                                                            <Text
                                                                color="whiteAlpha.400"
                                                                fontSize="xs"
                                                                mt={1}
                                                            >
                                                                PNG, JPG до 5МБ
                                                            </Text>
                                                        </Box>
                                                    </Stack>
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
                                                    borderRadius="lg"
                                                    bg="red.900/20"
                                                >
                                                    <Alert.Indicator color="red.400">
                                                        <FiAlertCircle/>
                                                    </Alert.Indicator>
                                                    <Alert.Content>
                                                        <Alert.Description fontSize="xs" color="red.200">
                                                            {errors.imageFile.message}
                                                        </Alert.Description>
                                                    </Alert.Content>
                                                </Alert.Root>
                                            )}
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                mb={3.5}
                                                color="whiteAlpha.800"
                                                display="flex"
                                                alignItems="center"
                                                gap={1.5}
                                            >
                                                Варианты и цены
                                                <Text as="span" color="red.400">*</Text>
                                            </Text>

                                            <Stack gap={3.5}>
                                                {priceFields.map((priceField, index) => (
                                                    <Box key={priceField.id}>
                                                        <Flex
                                                            direction={{
                                                                base: 'column',
                                                                sm: 'row',
                                                            }}
                                                            gap={3}
                                                            p={4}
                                                            borderRadius="2xl"
                                                            bg="whiteAlpha.05"
                                                            border="1px solid"
                                                            borderColor="whiteAlpha.100"
                                                            align="flex-start"
                                                            transition="all 0.2s"
                                                            _hover={{
                                                                bg: 'whiteAlpha.100',
                                                                borderColor: 'whiteAlpha.200'
                                                            }}
                                                        >
                                                            <Box flex={1} w="full">
                                                                <Input
                                                                    {...register(
                                                                        `prices.${index}.size`
                                                                    )}
                                                                    placeholder="Название (напр. Большой)"
                                                                    bg="blackAlpha.300"
                                                                    borderColor="whiteAlpha.100"
                                                                    fontSize="sm"
                                                                    borderRadius="xl"
                                                                    h="42px"
                                                                    _focus={{
                                                                        borderColor: 'whiteAlpha.400',
                                                                        bg: 'blackAlpha.500'
                                                                    }}
                                                                />

                                                                {errors.prices?.[index]?.size && (
                                                                    <Text
                                                                        color="red.400"
                                                                        fontSize="xs"
                                                                        mt={1.5}
                                                                        fontWeight="500"
                                                                    >
                                                                        {
                                                                            errors.prices?.[index]?.size?.message
                                                                        }
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <Box flex={1} w="full">
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
                                                                    bg="blackAlpha.300"
                                                                    borderColor="whiteAlpha.100"
                                                                    fontSize="sm"
                                                                    borderRadius="xl"
                                                                    h="42px"
                                                                    _focus={{
                                                                        borderColor: 'whiteAlpha.400',
                                                                        bg: 'blackAlpha.500'
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
                                                                        mt={1.5}
                                                                        fontWeight="500"
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
                                                                color="whiteAlpha.400"
                                                                variant="ghost"
                                                                size="sm"
                                                                borderRadius="lg"
                                                                _hover={{
                                                                    bg: 'red.900/40',
                                                                    color: 'red.400',
                                                                }}
                                                                onClick={() => removePrice(index)}
                                                            >
                                                                <FaTrash size={14}/>
                                                            </IconButton>
                                                        </Flex>
                                                    </Box>
                                                ))}

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    color="whiteAlpha.600"
                                                    borderRadius="xl"
                                                    alignSelf="flex-start"
                                                    _hover={{bg: 'whiteAlpha.100', color: 'white'}}
                                                    onClick={() =>
                                                        appendPrice(DEFAULT_PRICE)
                                                    }
                                                >
                                                    <Text fontSize="lg" mb={0.5}>+</Text>Добавить вариант цены
                                                </Button>
                                            </Stack>
                                        </Box>

                                        <Box>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                mb={3}
                                                color="whiteAlpha.800"
                                            >
                                                Категории
                                            </Text>

                                            <Flex wrap="wrap" gap={2.5}>
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
                                                                    px={4}
                                                                    py={2}
                                                                    borderRadius="full"
                                                                    border="1px solid"
                                                                    borderColor={
                                                                        isSelected
                                                                            ? 'white'
                                                                            : 'whiteAlpha.100'
                                                                    }
                                                                    bg={
                                                                        isSelected
                                                                            ? 'white'
                                                                            : 'whiteAlpha.05'
                                                                    }
                                                                    color={
                                                                        isSelected
                                                                            ? 'black'
                                                                            : 'whiteAlpha.700'
                                                                    }
                                                                    fontSize="xs"
                                                                    fontWeight="600"
                                                                    cursor="pointer"
                                                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                                                    _hover={{
                                                                        borderColor: isSelected ? 'white' : 'whiteAlpha.300',
                                                                        transform: 'translateY(-1px)'
                                                                    }}
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

                                        <Box>
                                            <Flex align="center" justify="space-between" mb={3}>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="whiteAlpha.800"
                                                >
                                                    Теги
                                                </Text>
                                                {tagFields.length >= 2 && (
                                                    <Text fontSize="xs" color="whiteAlpha.400" fontWeight="500">
                                                        Максимум 2 тега
                                                    </Text>
                                                )}
                                            </Flex>

                                            <Stack gap={4}>
                                                <Flex wrap="wrap" gap={3}>
                                                    <AnimatePresence mode="popLayout">
                                                        {tagFields.map((tagField, index) => (
                                                            <MotionFlex
                                                                key={tagField.id}
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                                                align="center"
                                                                gap={2.5}
                                                                px={4}
                                                                py={2}
                                                                borderRadius="full"
                                                                bg={`${(tagField as any).color}15`}
                                                                border="1px solid"
                                                                borderColor={`${(tagField as any).color}30`}
                                                                backdropFilter="blur(8px)"
                                                                boxShadow={`0 4px 12px ${(tagField as any).color}20`}
                                                            >
                                                                <Box
                                                                    w="8px"
                                                                    h="8px"
                                                                    borderRadius="full"
                                                                    bg={(tagField as any).color}
                                                                    boxShadow={`0 0 10px ${(tagField as any).color}`}
                                                                />
                                                                <Text 
                                                                    fontSize="xs" 
                                                                    fontWeight="800" 
                                                                    color="white" 
                                                                    textTransform="uppercase"
                                                                    letterSpacing="0.06em"
                                                                >
                                                                    {(tagField as any).text}
                                                                </Text>
                                                                <IconButton
                                                                    aria-label="Удалить тег"
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    color="whiteAlpha.400"
                                                                    minW="unset"
                                                                    h="auto"
                                                                    p={0.5}
                                                                    borderRadius="full"
                                                                    _hover={{ color: (tagField as any).color, bg: 'whiteAlpha.100' }}
                                                                    onClick={() => removeTag(index)}
                                                                >
                                                                    <FiX size={14} />
                                                                </IconButton>
                                                            </MotionFlex>
                                                        ))}
                                                    </AnimatePresence>
                                                </Flex>

                                                {tagFields.length < 2 && (
                                                    <Box
                                                        p={5}
                                                        borderRadius="2xl"
                                                        bg="whiteAlpha.05"
                                                        border="1px solid"
                                                        borderColor="whiteAlpha.100"
                                                    >
                                                        <TagInput
                                                            onAdd={(tag) => appendTag(tag)}
                                                        />
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Box>


                                        <Flex
                                            direction={{
                                                base: 'column',
                                                sm: 'row',
                                            }}
                                            gap={8}
                                            p={5}
                                            borderRadius="2xl"
                                            bg="whiteAlpha.05"
                                            border="1px solid"
                                            borderColor="whiteAlpha.100"
                                        >
                                            <Controller
                                                name="hidden"
                                                control={control}
                                                render={({field}) => (
                                                    <ToggleSwitch
                                                        label="Скрыть товар"
                                                        value={!!field.value}
                                                        activeColor="orange.400"
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="isAlcohol"
                                                control={control}
                                                render={({field}) => (
                                                    <ToggleSwitch
                                                        label="Содержит алкоголь"
                                                        value={!!field.value}
                                                        activeColor="purple.400"
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />
                                        </Flex>
                                    </Stack>

                                    <Dialog.Footer
                                        borderTop="1px solid"
                                        borderColor={MODAL_STYLES.headerBorder}
                                        mt={8}
                                        pt={6}
                                        px={0}
                                    >
                                        <Flex
                                            w="full"
                                            direction={{
                                                base: 'column-reverse',
                                                sm: 'row',
                                            }}
                                            justify="flex-end"
                                            gap={4}
                                        >
                                            <Button
                                                type="button"
                                                w={{base: 'full', sm: 'auto'}}
                                                variant="ghost"
                                                color="whiteAlpha.600"
                                                borderRadius="xl"
                                                px={8}
                                                h="48px"
                                                _hover={{
                                                    bg: 'whiteAlpha.100',
                                                    color: 'white',
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
                                                bg="white"
                                                color="black"
                                                borderRadius="xl"
                                                px={10}
                                                h="48px"
                                                fontWeight="600"
                                                boxShadow="0 4px 15px rgba(255, 255, 255, 0.2)"
                                                _hover={{
                                                    bg: 'gray.100',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.25)',
                                                }}
                                                _active={{
                                                    transform: 'translateY(0)',
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