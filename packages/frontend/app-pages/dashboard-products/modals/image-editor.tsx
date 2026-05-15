'use client'
import { useState, useCallback, useMemo } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import {
    Dialog,
    Button,
    Box,
    Flex,
    Text,
    IconButton,
    HStack,
    VStack,
    Separator,
    Grid,
    Stack,
    Badge,
} from '@chakra-ui/react'
import {
    FiRotateCw,
    FiRotateCcw,
    FiCheck,
    FiX,
    FiMaximize2,
    FiMinimize2,
    FiRefreshCcw,
    FiSquare,
    FiImage,
    FiSun,
    FiDroplet,
} from 'react-icons/fi'
import { LuFlipHorizontal, LuFlipVertical, LuScaling, LuContrast } from 'react-icons/lu'

type AspectRatioOption = {
    label: string
    value: number | null
    icon: React.ReactNode
}

const ASPECT_RATIOS: AspectRatioOption[] = [
    { label: 'Оригинал', value: null, icon: <FiMaximize2 size={14} /> },
    { label: '1:1', value: 1, icon: <FiSquare size={14} /> },
    { label: '4:3', value: 4 / 3, icon: <FiImage size={14} /> },
    { label: '16:9', value: 16 / 9, icon: <FiImage size={14} /> },
    { label: '3:2', value: 3 / 2, icon: <FiImage size={14} /> },
    { label: '2:3', value: 2 / 3, icon: <FiImage size={14} /> },
]

export type Filters = {
    brightness: number
    contrast: number
    grayscale: number
    sepia: number
    saturate: number
}

const DEFAULT_FILTERS: Filters = {
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
}

type ImageEditorProps = {
    isOpen: boolean
    onClose: VoidFunction
    imageSrc: string
    onSave: (
        croppedAreaPixels: Area,
        rotation: number,
        flip: { horizontal: boolean; vertical: boolean },
        filters: Filters
    ) => void
    initialFlip?: { horizontal: boolean; vertical: boolean }
    onFlipChange?: (flip: { horizontal: boolean; vertical: boolean }) => void
}

const getRadianAngle = (degreeValue: number): number => (degreeValue * Math.PI) / 180

const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

export const ImageEditor = ({ isOpen, onClose, imageSrc, onSave, initialFlip, onFlipChange }: ImageEditorProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [flip, setFlip] = useState(initialFlip ?? { horizontal: false, vertical: false })
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
    const [aspect, setAspect] = useState<number | null>(null)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 })

    const filterStyle = useMemo(() => {
        return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`
    }, [filters])

    const currentAspect = useMemo(() => {
        if (aspect === null) {
            if (!mediaSize.width || !mediaSize.height) return undefined
            return mediaSize.width / mediaSize.height
        }
        return aspect
    }, [aspect, mediaSize])

    const cropperKey = useMemo(() => {
        return `${currentAspect}-${mediaSize.width}-${mediaSize.height}`
    }, [currentAspect, mediaSize])

    const onCropComplete = useCallback((_: Area, croppedAreaPixelsArg: Area) => {
        setCroppedAreaPixels(croppedAreaPixelsArg)
    }, [])

    const handleRotateLeft = () => setRotation((prev) => Math.round((prev - 90) % 360))
    const handleRotateRight = () => setRotation((prev) => Math.round((prev + 90) % 360))

    const handleFlipHorizontal = () => {
        const newFlip = { ...flip, horizontal: !flip.horizontal }
        setFlip(newFlip)
        onFlipChange?.(newFlip)
    }

    const handleFlipVertical = () => {
        const newFlip = { ...flip, vertical: !flip.vertical }
        setFlip(newFlip)
        onFlipChange?.(newFlip)
    }

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3))
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 1))

    const handleResetTransform = () => {
        setRotation(0)
        setFlip({ horizontal: false, vertical: false })
        setZoom(1)
        setCrop({ x: 0, y: 0 })
    }

    const handleResetFilters = () => setFilters(DEFAULT_FILTERS)

    const handleResetAll = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
        setFlip({ horizontal: false, vertical: false })
        setAspect(null)
        setFilters(DEFAULT_FILTERS)
    }

    const handleSave = () => {
        if (croppedAreaPixels) {
            onSave(croppedAreaPixels, rotation, flip, filters)
            onClose()
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="cover">
            <Dialog.Backdrop bg="blackAlpha.900" backdropFilter="blur(10px)" />
            <Dialog.Positioner p={{ base: 0, md: 4 }}>
                <Dialog.Content
                    bg="#0f1113"
                    borderRadius={{ base: "0", md: "2xl" }}
                    border={{ base: "none", md: "1px solid" }}
                    borderColor="whiteAlpha.100"
                    color="white"
                    maxW="1100px"
                    w="100vw"
                    h={{ base: "100dvh", md: "auto" }}
                    maxH={{ base: "100dvh", md: "90vh" }}
                    overflow="hidden"
                    boxShadow="2xl"
                    display="flex"
                    flexDirection="column"
                >
                    <Flex justify="space-between" align="center" px={{ base: 4, md: 6 }} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                        <HStack gap={3}>
                            <Box bg="gray.700" p={2} borderRadius="lg" display={{ base: 'none', sm: 'block' }}>
                                <FiImage size={20} color="#CBD5E0" />
                            </Box>
                            <VStack align="start" gap={0}>
                                <Text fontWeight="bold" color="white" fontSize={{ base: "sm", md: "md" }}>
                                    Редактор изображений
                                </Text>
                                <Text fontSize="xs" color="gray.500" display={{ base: 'none', sm: 'block' }}>
                                    Обрежьте и настройте изображение для товара
                                </Text>
                            </VStack>
                        </HStack>
                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                aria-label="Закрыть"
                                variant="ghost"
                                size="sm"
                                color="gray.500"
                                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                            >
                                <FiX />
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </Flex>

                    <Grid templateColumns={{ base: "1fr", lg: "1fr 340px" }} flex={1} overflow="hidden" minH={0}>
                        <Box position="relative" bg="#050505" h={{ base: "40vh", sm: "45vh", lg: "auto" }} minH={{ base: "250px", lg: "auto" }} overflow="hidden">
                            <Box
                                position="absolute"
                                inset={0}
                                zIndex={1}
                                style={{
                                    transform: `scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`,
                                    transition: 'transform 0.4s ease'
                                }}
                            >
                                <Cropper
                                    key={cropperKey}
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={currentAspect}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    onMediaLoaded={setMediaSize}
                                    showGrid={true}
                                    restrictPosition={true}
                                    style={{
                                        containerStyle: { background: '#050505' },
                                        cropAreaStyle: {
                                            border: '2px solid rgba(255,255,255,0.8)',
                                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                                        },
                                        mediaStyle: { filter: filterStyle }
                                    }}
                                />
                            </Box>
                            <HStack position="absolute" bottom={4} left={4} zIndex={10} gap={2}>
                                <Badge variant="subtle" bg="blackAlpha.700" color="whiteAlpha.800" textTransform="none" px={2} py={1} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                                    {Math.round(zoom * 100)}%
                                </Badge>
                                <Badge variant="subtle" bg="blackAlpha.700" color="whiteAlpha.800" textTransform="none" px={2} py={1} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
                                    {Math.round(rotation)}°
                                </Badge>
                            </HStack>
                        </Box>

                        <Box bg="#141619" borderLeft={{ base: "none", lg: "1px solid" }} borderTop={{ base: "1px solid", lg: "none" }} borderColor="whiteAlpha.100" p={{ base: 4, md: 6 }} overflowY="auto" flex={1}>
                            <Stack gap={6}>
                                <VStack align="stretch" gap={3}>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                        Пропорции
                                    </Text>
                                    <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }} gap={2}>
                                        {ASPECT_RATIOS.map((ratio) => (
                                            <Button
                                                key={ratio.label}
                                                size="sm"
                                                variant={aspect === ratio.value ? 'solid' : 'outline'}
                                                bg={aspect === ratio.value ? 'blue.600' : 'transparent'}
                                                borderColor={aspect === ratio.value ? 'blue.500' : 'whiteAlpha.200'}
                                                color={aspect === ratio.value ? 'white' : 'gray.400'}
                                                _hover={{
                                                    bg: aspect === ratio.value ? 'blue.500' : 'whiteAlpha.100',
                                                    borderColor: aspect === ratio.value ? 'blue.400' : 'whiteAlpha.300',
                                                }}
                                                onClick={() => setAspect(ratio.value)}
                                                flexDirection="row"
                                                h="auto"
                                                py={2.5}
                                                gap={2}
                                                justifyContent="center"
                                            >
                                                {ratio.icon}
                                                <Text fontSize="11px">{ratio.label}</Text>
                                            </Button>
                                        ))}
                                    </Grid>
                                </VStack>

                                <Separator borderColor="whiteAlpha.100" />

                                <VStack align="stretch" gap={4}>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                            Фильтры
                                        </Text>
                                        <IconButton
                                            aria-label="Сбросить фильтры"
                                            size="xs"
                                            variant="ghost"
                                            color="gray.500"
                                            onClick={handleResetFilters}
                                            _hover={{ color: 'blue.400' }}
                                        >
                                            <FiRefreshCcw size={12} />
                                        </IconButton>
                                    </Flex>
                                    <Stack gap={4}>
                                        {[
                                            { label: 'Яркость', icon: <FiSun size={12} />, key: 'brightness' as const, min: 0, max: 200, unit: '%' },
                                            { label: 'Контраст', icon: <LuContrast size={12} />, key: 'contrast' as const, min: 0, max: 200, unit: '%' },
                                            { label: 'Насыщенность', icon: <FiDroplet size={12} />, key: 'saturate' as const, min: 0, max: 200, unit: '%' },
                                            { label: 'Ч/Б', key: 'grayscale' as const, min: 0, max: 100, unit: '%' },
                                            { label: 'Сепия', key: 'sepia' as const, min: 0, max: 100, unit: '%' },
                                        ].map((filter) => (
                                            <VStack key={filter.key} align="stretch" gap={1}>
                                                <Flex justify="space-between" align="center">
                                                    <HStack gap={2}>
                                                        {'icon' in filter && filter.icon}
                                                        <Text fontSize="xs" color="gray.400">{filter.label}</Text>
                                                    </HStack>
                                                    <Text fontSize="xs" color="gray.200">
                                                        {filters[filter.key]}{filter.unit}
                                                    </Text>
                                                </Flex>
                                                <Box px={1} py={1}>
                                                    <input
                                                        type="range"
                                                        min={filter.min}
                                                        max={filter.max}
                                                        step={1}
                                                        value={filters[filter.key]}
                                                        onChange={(e) => setFilters(prev => ({
                                                            ...prev,
                                                            [filter.key]: parseInt(e.target.value)
                                                        }))}
                                                        style={{ width: '100%', accentColor: '#3182ce', cursor: 'pointer', height: '6px' }}
                                                    />
                                                </Box>
                                            </VStack>
                                        ))}
                                    </Stack>
                                </VStack>

                                <Separator borderColor="whiteAlpha.100" />

                                <VStack align="stretch" gap={4}>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                            Трансформация
                                        </Text>
                                        <IconButton
                                            aria-label="Сбросить трансформацию"
                                            size="xs"
                                            variant="ghost"
                                            color="gray.500"
                                            onClick={handleResetTransform}
                                            _hover={{ color: 'blue.400' }}
                                        >
                                            <FiRefreshCcw size={12} />
                                        </IconButton>
                                    </Flex>
                                    <Stack gap={4}>
                                        <VStack align="stretch" gap={2}>
                                            <Flex justify="space-between">
                                                <Text fontSize="xs" color="gray.400">Поворот</Text>
                                                <Text fontSize="xs" color="gray.200">{Math.round(rotation)}°</Text>
                                            </Flex>
                                            <Box px={1} py={1}>
                                                <input
                                                    type="range"
                                                    min={-180}
                                                    max={180}
                                                    step={1}
                                                    value={Math.round(rotation)}
                                                    onChange={(e) => setRotation(Math.round(parseInt(e.target.value)))}
                                                    style={{ width: '100%', accentColor: '#3182ce', cursor: 'pointer', height: '6px' }}
                                                />
                                            </Box>
                                            <HStack justify="space-between">
                                                <IconButton
                                                    aria-label="Повернуть влево"
                                                    size="xs"
                                                    variant="outline"
                                                    borderColor="whiteAlpha.200"
                                                    onClick={handleRotateLeft}
                                                >
                                                    <FiRotateCcw size={12} />
                                                </IconButton>
                                                <HStack gap={1} overflowX="auto" py={1}>
                                                    {[-90, 0, 90].map(angle => (
                                                        <Button
                                                            key={angle}
                                                            size="xs"
                                                            variant="ghost"
                                                            fontSize="10px"
                                                            color={rotation === angle ? 'blue.400' : 'gray.500'}
                                                            onClick={() => setRotation(angle)}
                                                        >
                                                            {angle}°
                                                        </Button>
                                                    ))}
                                                </HStack>
                                                <IconButton
                                                    aria-label="Повернуть вправо"
                                                    size="xs"
                                                    variant="outline"
                                                    borderColor="whiteAlpha.200"
                                                    onClick={handleRotateRight}
                                                >
                                                    <FiRotateCw size={12} />
                                                </IconButton>
                                            </HStack>
                                        </VStack>

                                        <VStack align="stretch" gap={2}>
                                            <Text fontSize="xs" color="gray.400">Отражение</Text>
                                            <HStack gap={2}>
                                                <Button
                                                    size="sm"
                                                    variant={flip.horizontal ? 'solid' : 'outline'}
                                                    bg={flip.horizontal ? 'blue.600' : 'transparent'}
                                                    borderColor={flip.horizontal ? 'blue.500' : 'whiteAlpha.200'}
                                                    color={flip.horizontal ? 'white' : 'gray.400'}
                                                    onClick={handleFlipHorizontal}
                                                    flex={1}
                                                    gap={2}
                                                    h="36px"
                                                >
                                                    <LuFlipHorizontal size={14} />
                                                    <Text fontSize="xs">Гориз.</Text>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={flip.vertical ? 'solid' : 'outline'}
                                                    bg={flip.vertical ? 'blue.600' : 'transparent'}
                                                    borderColor={flip.vertical ? 'blue.500' : 'whiteAlpha.200'}
                                                    color={flip.vertical ? 'white' : 'gray.400'}
                                                    onClick={handleFlipVertical}
                                                    flex={1}
                                                    gap={2}
                                                    h="36px"
                                                >
                                                    <LuFlipVertical size={14} />
                                                    <Text fontSize="xs">Верт.</Text>
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </Stack>
                                </VStack>

                                <Separator borderColor="whiteAlpha.100" />

                                <VStack align="stretch" gap={3}>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                                            Масштаб
                                        </Text>
                                        <IconButton
                                            aria-label="Вписать"
                                            size="xs"
                                            variant="ghost"
                                            color="gray.500"
                                            onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }) }}
                                            _hover={{ color: 'blue.400' }}
                                        >
                                            <LuScaling size={12} />
                                        </IconButton>
                                    </Flex>
                                    <HStack gap={3}>
                                        <IconButton
                                            aria-label="Уменьшить"
                                            size="xs"
                                            variant="ghost"
                                            onClick={handleZoomOut}
                                            disabled={zoom <= 1}
                                        >
                                            <FiMinimize2 size={14} />
                                        </IconButton>
                                        <Box flex={1} py={1}>
                                            <input
                                                type="range"
                                                min={1}
                                                max={3}
                                                step={0.01}
                                                value={zoom}
                                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                style={{ width: '100%', accentColor: '#3182ce', cursor: 'pointer', height: '6px' }}
                                            />
                                        </Box>
                                        <IconButton
                                            aria-label="Увеличить"
                                            size="xs"
                                            variant="ghost"
                                            onClick={handleZoomIn}
                                            disabled={zoom >= 3}
                                        >
                                            <FiMaximize2 size={14} />
                                        </IconButton>
                                    </HStack>
                                </VStack>
                            </Stack>
                        </Box>
                    </Grid>

                    <Flex justify="space-between" align="center" px={{ base: 4, md: 6 }} py={4} borderTop="1px solid" borderColor="whiteAlpha.100" bg="#0f1113">
                        <Button
                            variant="ghost"
                            size="sm"
                            color="gray.500"
                            _hover={{ color: 'red.400', bg: 'red.400/10' }}
                            onClick={handleResetAll}
                            gap={2}
                            px={{ base: 2, md: 4 }}
                        >
                            <FiRefreshCcw size={14} />
                            <Text display={{ base: 'none', sm: 'inline' }}>Сбросить всё</Text>
                            <Text display={{ base: 'inline', sm: 'none' }}>Сброс</Text>
                        </Button>
                        <HStack gap={3}>
                            <Button
                                variant="outline"
                                size="sm"
                                borderColor="whiteAlpha.200"
                                color="gray.300"
                                _hover={{ bg: 'whiteAlpha.100' }}
                                onClick={onClose}
                                px={{ base: 3, md: 5 }}
                            >
                                Отмена
                            </Button>
                            <Button
                                size="sm"
                                bg="blue.600"
                                color="white"
                                _hover={{ bg: 'blue.500' }}
                                onClick={handleSave}
                                px={{ base: 4, md: 6 }}
                                gap={2}
                            >
                                <FiCheck />
                                Сохранить
                            </Button>
                        </HStack>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}

export function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0,
    flip: { horizontal: boolean; vertical: boolean } = { horizontal: false, vertical: false },
    filters: Filters = DEFAULT_FILTERS
): Promise<File> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc
        image.crossOrigin = 'anonymous'

        image.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return reject(new Error('Canvas context not available'))

            const rotRad = getRadianAngle(rotation)
            const bBox = rotateSize(image.width, image.height, rotation)

            canvas.width = bBox.width
            canvas.height = bBox.height

            ctx.save()
            ctx.translate(bBox.width / 2, bBox.height / 2)
            ctx.rotate(rotRad)
            ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
            ctx.translate(-image.width / 2, -image.height / 2)

            ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`

            ctx.drawImage(image, 0, 0)
            ctx.restore()

            const croppedCanvas = document.createElement('canvas')
            const croppedCtx = croppedCanvas.getContext('2d')!
            croppedCanvas.width = pixelCrop.width
            croppedCanvas.height = pixelCrop.height

            croppedCtx.drawImage(
                canvas,
                Math.floor(pixelCrop.x),
                Math.floor(pixelCrop.y),
                Math.floor(pixelCrop.width),
                Math.floor(pixelCrop.height),
                0, 0, pixelCrop.width, pixelCrop.height
            )

            croppedCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' })
                        resolve(file)
                    } else {
                        reject(new Error('Failed to create blob'))
                    }
                },
                'image/jpeg',
                0.92
            )
        }

        image.onerror = () => reject(new Error('Failed to load image'))
    })
}