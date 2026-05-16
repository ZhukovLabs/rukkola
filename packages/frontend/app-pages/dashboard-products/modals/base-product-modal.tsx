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
import {
    FiAlertCircle,
    FiEdit2,
    FiPlus,
    FiUploadCloud,
    FiX,
    FiMenu,
} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

const MotionFlex = motion.create(Flex)
const MotionBox = motion.create(Box)

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
    background: '#111111',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    inputBackground: 'rgba(255, 255, 255, 0.03)',
    inputFocusBorder: 'rgba(255, 255, 255, 0.12)',
    headerBorder: 'rgba(255, 255, 255, 0.05)',
}

const SWITCH_STYLES = {
    width: '38px',
    height: '20px',
    thumbSize: '14px',
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

type SectionHeaderProps = {
    title: string
    required?: boolean
}

const SectionHeader = ({title, required}: SectionHeaderProps) => (
    <Box mb={4}>
        <Heading size="xs" color="whiteAlpha.600" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase">
            {title}
            {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Heading>
    </Box>
)

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
        justify="space-between"
        p={4}
        borderRadius="xl"
        bg="whiteAlpha.02"
        border="1px solid"
        borderColor="whiteAlpha.08"
        cursor="pointer"
        userSelect="none"
        onClick={() => onChange(!value)}
        transition="all 0.2s"
        _hover={{
            bg: 'whiteAlpha.05',
        }}
    >
        <Text
            color={value ? 'white' : 'whiteAlpha.500'}
            fontWeight="600"
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
            px="3px"
            display="flex"
            alignItems="center"
            bg={value ? activeColor : 'whiteAlpha.100'}
            transition="background-color 0.2s"
            position="relative"
        >
            <MotionBox
                w={SWITCH_STYLES.thumbSize}
                h={SWITCH_STYLES.thumbSize}
                borderRadius="full"
                bg="white"
                animate={{
                    x: value ? 18 : 0,
                }}
                transition={{type: 'spring', stiffness: 500, damping: 35}}
            />
        </Box>
    </Flex>
)

const TAG_COLORS = [
    '#FF4757', // Red
    '#FFA502', // Orange
    '#2ED573', // Green
    '#1E90FF', // Blue
    '#A4B0BE', // Muted Blue
    '#5352ED', // Purple
    '#FF6B81', // Pink
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
        <Stack gap={4}>
            <Flex gap={3}>
                <Input
                    placeholder="Напр. Острое"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    bg="whiteAlpha.05"
                    borderColor="whiteAlpha.100"
                    fontSize="sm"
                    h="44px"
                    borderRadius="lg"
                    maxLength={12}
                    _focus={{
                        borderColor: 'whiteAlpha.300',
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
                    borderRadius="lg"
                    bg="transparent"
                    color="whiteAlpha.500"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    fontSize="sm"
                    fontWeight="700"
                    _hover={{bg: 'whiteAlpha.02', color: 'whiteAlpha.800', borderColor: 'whiteAlpha.300'}}
                    _active={{bg: 'whiteAlpha.05'}}
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
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        bg={c}
                        cursor="pointer"
                        border="2px solid"
                        borderColor={color === c ? 'white' : 'transparent'}
                        transition="transform 0.2s"
                        _hover={{transform: 'scale(1.1)'}}
                        onClick={() => setColor(c)}
                    />
                ))}

                <Box position="relative" w="24px" h="24px">
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
                        color="whiteAlpha.600"
                        pointerEvents="none"
                    >
                        <FiPlus size={12}/>
                    </Flex>
                </Box>
            </Flex>
        </Stack>
    )
}

type TagProps = {
    tag: { text: string; color: string }
    onRemove?: VoidFunction
    isOverlay?: boolean
    dragHandleProps?: any
}

const Tag = ({ tag, onRemove, isOverlay, dragHandleProps }: TagProps) => (
    <Flex
        align="center"
        gap={2}
        px={3}
        py={1}
        borderRadius="md"
        bg={`${tag.color}15`}
        border="1px solid"
        borderColor={`${tag.color}30`}
        position="relative"
        userSelect="none"
        boxShadow={isOverlay ? '0 10px 20px rgba(0,0,0,0.4)' : 'none'}
        cursor={isOverlay ? 'grabbing' : 'default'}
    >
        <Box
            {...dragHandleProps}
            cursor={isOverlay ? 'grabbing' : 'grab'}
            color="whiteAlpha.400"
            _active={{ color: 'whiteAlpha.600' }}
            _hover={{ color: 'whiteAlpha.600' }}
        >
            <FiMenu size={12} />
        </Box>

        <Box w="6px" h="6px" borderRadius="full" bg={tag.color} />
        <Text fontSize="10px" fontWeight="800" color="white" textTransform="uppercase">
            {tag.text}
        </Text>
        {!isOverlay && onRemove && (
            <IconButton
                aria-label="Remove"
                size="xs"
                variant="ghost"
                color="whiteAlpha.400"
                minW="unset"
                h="auto"
                p={0.5}
                _hover={{ color: 'white' }}
                onClick={onRemove}
            >
                <FiX size={12} />
            </IconButton>
        )}
    </Flex>
)

type SortableTagProps = {
    id: string
    tag: { text: string; color: string }
    onRemove: VoidFunction
}

const SortableTag = ({ id, tag, onRemove }: SortableTagProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <Tag 
                tag={tag} 
                onRemove={onRemove} 
                dragHandleProps={{ ...attributes, ...listeners }} 
            />
        </div>
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
    const [activeTagId, setActiveTagId] = useState<string | null>(null)

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
        move: moveTag,
    } = useFieldArray({
        control,
        name: 'tags',
    })

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTagId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = tagFields.findIndex((f) => f.id === active.id)
            const newIndex = tagFields.findIndex((f) => f.id === over.id)
            moveTag(oldIndex, newIndex)
        }
        
        setActiveTagId(null)
    }

    const activeTag = useMemo(() => {
        if (!activeTagId) return null
        return tagFields.find(f => f.id === activeTagId)
    }, [activeTagId, tagFields])

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
                    bg="blackAlpha.700"
                    backdropFilter="blur(4px)"
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
                        borderRadius={{base: 'none', md: '20px'}}
                        border={{base: 'none', md: '1px solid'}}
                        borderColor={MODAL_STYLES.borderColor}
                        color="white"
                        w={{base: '100vw', md: '2xl'}}
                        h={{base: '100dvh', md: 'auto'}}
                        minH={{base: '100dvh', md: 'unset'}}
                        maxW={{base: '100vw', md: '2xl'}}
                        maxH={{base: '100dvh', md: '90vh'}}
                        m={0}
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        outline="none"
                        boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
                        _focusVisible={{
                            outline: 'none',
                        }}
                    >
                        <Dialog.Header
                            borderBottom="1px solid"
                            borderColor={MODAL_STYLES.headerBorder}
                            px={{base: 6, md: 8}}
                            py={5}
                            flexShrink={0}
                        >
                            <Flex align="center" justify="space-between" gap={4}>
                                <Heading
                                    size="sm"
                                    color="white"
                                    fontWeight="700"
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
                                        <FiX size={20}/>
                                    </IconButton>
                                </Dialog.CloseTrigger>
                            </Flex>
                        </Dialog.Header>

                        <Dialog.Body
                            px={{base: 6, md: 8}}
                            py={{base: 6, md: 8}}
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
                                <Flex align="center" justify="center" py={20} direction="column" gap={4}>
                                    <Spinner size="md" color="whiteAlpha.400"/>
                                    <Text fontSize="xs" color="whiteAlpha.400">Загрузка...</Text>
                                </Flex>
                            ) : (
                                <form onSubmit={handleSubmit(handleFormSubmit)}>
                                    <Stack gap={10}>
                                        {errors.root && (
                                            <Alert.Root
                                                status="error"
                                                variant="subtle"
                                                borderRadius="lg"
                                                bg="red.950"
                                                border="1px solid"
                                                borderColor="red.900"
                                            >
                                                <Alert.Indicator color="red.400">
                                                    <FiAlertCircle size={16}/>
                                                </Alert.Indicator>
                                                <Alert.Content>
                                                    <Alert.Description fontSize="xs" color="red.200">
                                                        {errors.root.message}
                                                    </Alert.Description>
                                                </Alert.Content>
                                            </Alert.Root>
                                        )}

                                        {/* Информация */}
                                        <Box>
                                            <SectionHeader title="Основное" required />
                                            <Stack gap={4}>
                                                <Box>
                                                    <Input
                                                        {...register('name')}
                                                        placeholder="Название"
                                                        bg={MODAL_STYLES.inputBackground}
                                                        borderColor="whiteAlpha.100"
                                                        h="48px"
                                                        fontSize="sm"
                                                        borderRadius="lg"
                                                        _focus={{
                                                            borderColor: MODAL_STYLES.inputFocusBorder,
                                                            bg: 'whiteAlpha.05',
                                                        }}
                                                    />
                                                    {errors.name && (
                                                        <Text color="red.500" mt={1.5} fontSize="xs" fontWeight="600">
                                                            {errors.name.message}
                                                        </Text>
                                                    )}
                                                </Box>

                                                <Box>
                                                    <Textarea
                                                        {...register('description')}
                                                        placeholder="Описание"
                                                        bg={MODAL_STYLES.inputBackground}
                                                        borderColor="whiteAlpha.100"
                                                        minH="100px"
                                                        fontSize="sm"
                                                        borderRadius="lg"
                                                        py={3}
                                                        _focus={{
                                                            borderColor: MODAL_STYLES.inputFocusBorder,
                                                            bg: 'whiteAlpha.05',
                                                        }}
                                                    />
                                                    {errors.description && (
                                                        <Text color="red.500" mt={1.5} fontSize="xs" fontWeight="600">
                                                            {errors.description.message}
                                                        </Text>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Box>

                                        {/* Медиа */}
                                        <Box>
                                            <SectionHeader title="Изображение" />
                                            <Box
                                                border="1px dashed"
                                                borderColor="whiteAlpha.200"
                                                borderRadius="xl"
                                                p={2}
                                                bg={isDragActive ? 'whiteAlpha.100' : 'whiteAlpha.02'}
                                                transition="all 0.2s"
                                                textAlign="center"
                                                cursor="pointer"
                                                onClick={() => document.getElementById('product-image-input')?.click()}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                                                onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    setIsDragActive(false);
                                                    handleImageSelect(e.dataTransfer.files?.[0]);
                                                }}
                                            >
                                                {previewImageUrl ? (
                                                    <Flex direction="column" align="center" p={4} gap={4}>
                                                        <Box
                                                            position="relative"
                                                            borderRadius="lg"
                                                            overflow="hidden"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Image
                                                                src={previewImageUrl}
                                                                alt="preview"
                                                                maxH="240px"
                                                                w="full"
                                                                objectFit="cover"
                                                            />

                                                            <Flex position="absolute" top={2} right={2} gap={2}>
                                                                <IconButton
                                                                    type="button"
                                                                    aria-label="Edit"
                                                                    size="xs"
                                                                    borderRadius="md"
                                                                    bg="blackAlpha.800"
                                                                    color="white"
                                                                    onClick={(e) => { e.stopPropagation(); handleImageEditorOpen(); }}
                                                                >
                                                                    <FiEdit2 size={12}/>
                                                                </IconButton>

                                                                <IconButton
                                                                    type="button"
                                                                    aria-label="Remove"
                                                                    size="xs"
                                                                    borderRadius="md"
                                                                    bg="blackAlpha.800"
                                                                    color="red.400"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (selectedImageFile) setSelectedImageFile(null);
                                                                        else setShouldRemoveImage(true);
                                                                    }}
                                                                >
                                                                    <FaTrash size={10}/>
                                                                </IconButton>
                                                            </Flex>
                                                        </Box>
                                                        <Text fontSize="10px" color="whiteAlpha.400" fontWeight="700" textTransform="uppercase">
                                                            {isUploadingImage ? 'Загрузка...' : imagePreviewLabel}
                                                        </Text>
                                                    </Flex>
                                                ) : (
                                                    <Stack align="center" gap={3} py={10}>
                                                        <FiUploadCloud size={24} color="rgba(255,255,255,0.2)"/>
                                                        <Text color="whiteAlpha.500" fontSize="xs" fontWeight="600">
                                                            Нажмите для загрузки изображения
                                                        </Text>
                                                    </Stack>
                                                )}
                                            </Box>

                                            <Input
                                                id="product-image-input"
                                                type="file"
                                                accept="image/*"
                                                display="none"
                                                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                                            />

                                            {errors.imageFile && (
                                                <Text color="red.500" mt={2} fontSize="xs" fontWeight="600">
                                                    {errors.imageFile.message}
                                                </Text>
                                            )}
                                        </Box>

                                        {/* Цены */}
                                        <Box>
                                            <SectionHeader title="Цены" required />
                                            <Stack gap={3}>
                                                {priceFields.map((priceField, index) => (
                                                    <MotionBox
                                                        key={priceField.id}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <Flex gap={3} align="flex-start">
                                                            <Box flex={2}>
                                                                <Input
                                                                    {...register(`prices.${index}.size`)}
                                                                    placeholder="Размер/Порция"
                                                                    bg="whiteAlpha.05"
                                                                    borderColor="whiteAlpha.100"
                                                                    fontSize="sm"
                                                                    borderRadius="lg"
                                                                    h="44px"
                                                                    _focus={{ borderColor: 'whiteAlpha.300' }}
                                                                />
                                                                {errors.prices?.[index]?.size && (
                                                                    <Text color="red.500" fontSize="10px" mt={1} fontWeight="600">
                                                                        {errors.prices?.[index]?.size?.message}
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <Box flex={1}>
                                                                <Input
                                                                    {...register(`prices.${index}.price`, {
                                                                        setValueAs: (v) => typeof v === 'string' ? normalizePriceValue(v) : v,
                                                                    })}
                                                                    placeholder="Цена"
                                                                    bg="whiteAlpha.05"
                                                                    borderColor="whiteAlpha.100"
                                                                    fontSize="sm"
                                                                    borderRadius="lg"
                                                                    h="44px"
                                                                    _focus={{ borderColor: 'whiteAlpha.300' }}
                                                                    onInput={(e: FormEvent<HTMLInputElement>) => {
                                                                        e.currentTarget.value = sanitizePriceInput(e.currentTarget.value)
                                                                    }}
                                                                />
                                                                {errors.prices?.[index]?.price && (
                                                                    <Text color="red.500" fontSize="10px" mt={1} fontWeight="600">
                                                                        {errors.prices?.[index]?.price?.message}
                                                                    </Text>
                                                                )}
                                                            </Box>

                                                            <IconButton
                                                                type="button"
                                                                aria-label="Delete"
                                                                variant="ghost"
                                                                size="sm"
                                                                color="whiteAlpha.300"
                                                                _hover={{ color: 'red.400', bg: 'transparent' }}
                                                                onClick={() => removePrice(index)}
                                                                disabled={priceFields.length <= 1}
                                                                h="44px"
                                                            >
                                                                <FaTrash size={12}/>
                                                            </IconButton>
                                                        </Flex>
                                                    </MotionBox>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    color="whiteAlpha.300"
                                                    size="sm"
                                                    h="40px"
                                                    w="full"
                                                    border="1px dashed"
                                                    borderColor="whiteAlpha.100"
                                                    _hover={{ bg: 'transparent', color: 'whiteAlpha.600', borderColor: 'whiteAlpha.300' }}
                                                    _active={{ bg: 'whiteAlpha.02' }}
                                                    onClick={() => appendPrice(DEFAULT_PRICE)}
                                                >
                                                    Добавить вариант
                                                </Button>
                                            </Stack>
                                        </Box>

                                        {/* Категории */}
                                        <Box>
                                            <SectionHeader title="Категории" />
                                            <Flex wrap="wrap" gap={2}>
                                                {categories.map(({id, name}) => (
                                                    <Controller
                                                        key={id}
                                                        name="categories"
                                                        control={control}
                                                        render={({field}) => {
                                                            const isSelected = field.value?.includes(id)
                                                            return (
                                                                <Box
                                                                    px={4}
                                                                    py={1.5}
                                                                    borderRadius="full"
                                                                    border="1px solid"
                                                                    borderColor={isSelected ? 'white' : 'whiteAlpha.100'}
                                                                    bg={isSelected ? 'white' : 'transparent'}
                                                                    color={isSelected ? 'black' : 'whiteAlpha.600'}
                                                                    fontSize="xs"
                                                                    fontWeight="700"
                                                                    cursor="pointer"
                                                                    transition="all 0.1s"
                                                                    _hover={{
                                                                        borderColor: isSelected ? 'white' : 'whiteAlpha.300',
                                                                    }}
                                                                    onClick={() => {
                                                                        if (isSelected) field.onChange(field.value?.filter((cid: string) => cid !== id));
                                                                        else field.onChange([...(field.value || []), id]);
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

                                        {/* Теги */}
                                        <Box>
                                            <SectionHeader title="Теги" />
                                            <Stack gap={4}>
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragStart={handleDragStart}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={tagFields.map((f) => f.id)}
                                                        strategy={horizontalListSortingStrategy}
                                                    >
                                                        <Flex wrap="wrap" gap={2}>
                                                            <AnimatePresence mode="popLayout">
                                                                {tagFields.map((tagField, index) => (
                                                                    <SortableTag
                                                                        key={tagField.id}
                                                                        id={tagField.id}
                                                                        tag={tagField as any}
                                                                        onRemove={() => removeTag(index)}
                                                                    />
                                                                ))}
                                                            </AnimatePresence>
                                                        </Flex>
                                                    </SortableContext>
                                                    
                                                    <DragOverlay dropAnimation={{
                                                        sideEffects: defaultDropAnimationSideEffects({
                                                            styles: {
                                                                active: {
                                                                    opacity: '0.3',
                                                                },
                                                            },
                                                        }),
                                                    }}>
                                                        {activeTag ? (
                                                            <Tag tag={activeTag as any} isOverlay />
                                                        ) : null}
                                                    </DragOverlay>
                                                </DndContext>

                                                {tagFields.length < 2 && (
                                                    <Box p={4} borderRadius="xl" bg="whiteAlpha.02" border="1px solid" borderColor="whiteAlpha.08">
                                                        <TagInput onAdd={(tag) => appendTag(tag)} />
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Настройки */}
                                        <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
                                            <Box flex={1}>
                                                <Controller
                                                    name="hidden"
                                                    control={control}
                                                    render={({field}) => (
                                                        <ToggleSwitch
                                                            label="Скрыть"
                                                            value={!!field.value}
                                                            activeColor="#E67E22"
                                                            onChange={field.onChange}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Controller
                                                    name="isAlcohol"
                                                    control={control}
                                                    render={({field}) => (
                                                        <ToggleSwitch
                                                            label="Алкоголь"
                                                            value={!!field.value}
                                                            activeColor="#9B59B6"
                                                            onChange={field.onChange}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Dialog.Footer
                                        borderTop="1px solid"
                                        borderColor={MODAL_STYLES.headerBorder}
                                        mt={10}
                                        pt={6}
                                        px={0}
                                    >
                                        <Flex w="full" justify="flex-end" gap={3}>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                color="whiteAlpha.400"
                                                borderRadius="lg"
                                                px={6}
                                                h="44px"
                                                fontSize="sm"
                                                fontWeight="600"
                                                _hover={{ bg: 'whiteAlpha.05', color: 'white' }}
                                                onClick={handleClose}
                                            >
                                                Отмена
                                            </Button>

                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                loadingText={submitLoadingText}
                                                bg="transparent"
                                                color="whiteAlpha.500"
                                                border="1px solid"
                                                borderColor="whiteAlpha.200"
                                                borderRadius="lg"
                                                px={8}
                                                h="44px"
                                                fontSize="sm"
                                                fontWeight="700"
                                                _hover={{ bg: 'whiteAlpha.02', color: 'whiteAlpha.900', borderColor: 'whiteAlpha.400' }}
                                                _active={{ bg: 'whiteAlpha.05' }}
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