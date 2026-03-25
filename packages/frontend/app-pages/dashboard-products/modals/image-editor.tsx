'use client'

import { useState, useCallback, useEffect } from 'react'
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
} from '@chakra-ui/react'
import { FiRotateCw, FiRotateCcw, FiCheck, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi'
import { LuFlipHorizontal, LuFlipVertical } from 'react-icons/lu'

type AspectRatioOption = {
    label: string
    value: number | null
    icon?: React.ReactNode
}

const ASPECT_RATIOS: AspectRatioOption[] = [
    { label: 'Свободно', value: null, icon: <FiMaximize2 /> },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
    { label: '2:3', value: 2 / 3 },
]

type ImageEditorProps = {
    isOpen: boolean
    onClose: VoidFunction
    imageSrc: string
    onSave: (croppedAreaPixels: Area, rotation: number) => void
    initialFlip?: { horizontal: boolean; vertical: boolean }
    onFlipChange?: (flip: { horizontal: boolean; vertical: boolean }) => void
}

export const ImageEditor = ({ isOpen, onClose, imageSrc, onSave, initialFlip, onFlipChange }: ImageEditorProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [flip, setFlip] = useState({ horizontal: false, vertical: false })
    const [aspect, setAspect] = useState<number | null>(null)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    useEffect(() => {
        if (!isOpen) {
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setRotation(0)
            setFlip({ horizontal: false, vertical: false })
        } else if (initialFlip) {
            setFlip(initialFlip)
        }
    }, [isOpen, initialFlip])

    useEffect(() => {
        const styleId = 'image-editor-flip-styles'
        let styleEl = document.getElementById(styleId)
        
        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }
        
        const transform = flip.horizontal || flip.vertical 
            ? `scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`
            : 'none'
        
        styleEl.textContent = `
            .image-editor-cropper img {
                transform: ${transform} !important;
            }
        `
        
        return () => {
            if (styleEl) {
                styleEl.textContent = ''
            }
        }
    }, [flip])

    const handleFlipChange = (newFlip: { horizontal: boolean; vertical: boolean }) => {
        setFlip(newFlip)
        onFlipChange?.(newFlip)
    }

    const onCropComplete = useCallback((_: Area, croppedAreaPixelsArg: Area) => {
        setCroppedAreaPixels(croppedAreaPixelsArg)
    }, [])

    const handleRotateLeft = () => {
        setRotation((prev) => (prev - 90) % 360)
    }

    const handleRotateRight = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

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

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.2, 3))
    }

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.2, 1))
    }

    const handleFit = () => {
        setZoom(1)
        setCrop({ x: 0, y: 0 })
    }

    const handleSave = () => {
        if (croppedAreaPixels) {
            onSave(croppedAreaPixels, rotation)
            onClose()
        }
    }

    const handleReset = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
    }

    const selectedAspectLabel = ASPECT_RATIOS.find(r => r.value === aspect)?.label || 'Свободно'

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(8px)" />
            <Dialog.Positioner>
                <Dialog.Content
                    bg="rgba(24,26,28,0.95)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.700"
                    color="white"
                    maxW="700px"
                    w="full"
                    p={4}
                >
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="semibold" color="teal.200" fontSize="lg">
                            Редактирование изображения
                        </Text>
                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                aria-label="Закрыть"
                                variant="ghost"
                                size="sm"
                                color="gray.400"
                                _hover={{ color: 'teal.200' }}
                            >
                                <FiX />
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </Flex>

                    <Box 
                        position="relative" 
                        h="350px" 
                        bg="gray.900" 
                        borderRadius="md" 
                        overflow="hidden"
                        className="image-editor-cropper"
                    >
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect || 16 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            showGrid={true}
                            style={{
                                containerStyle: { background: '#1a1c1e' },
                                cropAreaStyle: { 
                                    border: '2px solid #38b2ac',
                                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                                },
                            }}
                        />
                    </Box>

                    <Box mt={4}>
                        <Flex justify="space-between" align="center" mb={2}>
                            <Text fontSize="sm" color="gray.400">
                                Ориентация: <Text as="span" color="gray.200">{selectedAspectLabel}</Text>
                            </Text>
                            <Button
                                size="xs"
                                variant="ghost"
                                color="teal.300"
                                _hover={{ bg: 'gray.700' }}
                                onClick={handleFit}
                            >
                                <FiMinimize2 />
                                Вписать
                            </Button>
                        </Flex>
                        <Flex gap={2} flexWrap="wrap" mb={4}>
                            {ASPECT_RATIOS.map((ratio) => (
                                <Button
                                    key={ratio.label}
                                    size="xs"
                                    variant={aspect === ratio.value ? 'solid' : 'outline'}
                                    bg={aspect === ratio.value ? 'teal.600' : 'transparent'}
                                    color={aspect === ratio.value ? 'white' : 'gray.300'}
                                    borderColor="gray.600"
                                    _hover={{
                                        bg: aspect === ratio.value ? 'teal.500' : 'gray.700',
                                    }}
                                    onClick={() => setAspect(ratio.value)}
                                >
                                    {ratio.label}
                                </Button>
                            ))}
                        </Flex>

                        <Separator borderColor="gray.700" mb={4} />

                        <VStack gap={3} align="stretch">
                            <Flex align="center" gap={4}>
                                <Text fontSize="sm" color="gray.400" minW="70px">
                                    Поворот
                                </Text>
                                <HStack gap={2} flex={1}>
                                    <IconButton
                                        aria-label="Повернуть влево на 90°"
                                        size="sm"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleRotateLeft}
                                        title="Повернуть влево"
                                    >
                                        <FiRotateCcw />
                                    </IconButton>
                                    <Text fontSize="sm" color="gray.300" minW="50px" textAlign="center">
                                        {rotation}°
                                    </Text>
                                    <IconButton
                                        aria-label="Повернуть вправо на 90°"
                                        size="sm"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleRotateRight}
                                        title="Повернуть вправо"
                                    >
                                        <FiRotateCw />
                                    </IconButton>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={() => setRotation(0)}
                                        ml={2}
                                    >
                                        Сброс
                                    </Button>
                                </HStack>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Text fontSize="sm" color="gray.400" minW="70px">
                                    Отражение
                                </Text>
                                <HStack gap={2} flex={1}>
                                    <IconButton
                                        aria-label="Отразить горизонтально"
                                        size="sm"
                                        variant={flip.horizontal ? 'solid' : 'outline'}
                                        bg={flip.horizontal ? 'teal.600' : 'transparent'}
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleFlipHorizontal}
                                        title="Отразить горизонтально"
                                    >
                                        <LuFlipHorizontal size={18} />
                                    </IconButton>
                                    <IconButton
                                        aria-label="Отразить вертикально"
                                        size="sm"
                                        variant={flip.vertical ? 'solid' : 'outline'}
                                        bg={flip.vertical ? 'teal.600' : 'transparent'}
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleFlipVertical}
                                        title="Отразить вертикально"
                                    >
                                        <LuFlipVertical size={18} />
                                    </IconButton>
                                    {(flip.horizontal || flip.vertical) && (
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            borderColor="gray.600"
                                            color="gray.300"
                                            _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                            onClick={() => setFlip({ horizontal: false, vertical: false })}
                                        >
                                            Сброс
                                        </Button>
                                    )}
                                </HStack>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Text fontSize="sm" color="gray.400" minW="70px">
                                    Масштаб
                                </Text>
                                <HStack gap={2} flex={1}>
                                    <IconButton
                                        aria-label="Уменьшить"
                                        size="sm"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleZoomOut}
                                        disabled={zoom <= 1}
                                    >
                                        <FiMinimize2 />
                                    </IconButton>
                                    <Box flex={1} position="relative" h="24px">
                                        <input
                                            type="range"
                                            min={1}
                                            max={3}
                                            step={0.05}
                                            value={zoom}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            style={{
                                                width: '100%',
                                                height: '4px',
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                accentColor: '#38b2ac',
                                                cursor: 'pointer',
                                                background: `linear-gradient(to right, #38b2ac ${((zoom - 1) / 2) * 100}%, #4a5568 ${((zoom - 1) / 2) * 100}%)`,
                                            }}
                                        />
                                    </Box>
                                    <IconButton
                                        aria-label="Увеличить"
                                        size="sm"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleZoomIn}
                                        disabled={zoom >= 3}
                                    >
                                        <FiMaximize2 />
                                    </IconButton>
                                    <Text fontSize="sm" color="gray.300" minW="45px" textAlign="right">
                                        {Math.round(zoom * 100)}%
                                    </Text>
                                </HStack>
                            </Flex>

                            <Flex align="center" gap={4}>
                                <Text fontSize="sm" color="gray.400" minW="70px">
                                    Положение
                                </Text>
                                <HStack gap={2} flex={1}>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        borderColor="gray.600"
                                        color="gray.300"
                                        _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                                        onClick={handleFit}
                                        flex={1}
                                    >
                                        Центрировать
                                    </Button>
                                </HStack>
                            </Flex>
                        </VStack>
                    </Box>

                    <Flex justify="flex-end" gap={3} mt={6}>
                        <Button
                            variant="outline"
                            size="sm"
                            color="gray.300"
                            borderColor="gray.600"
                            _hover={{ borderColor: 'teal.400', color: 'teal.200' }}
                            onClick={handleReset}
                        >
                            Сбросить всё
                        </Button>
                        <Button
                            size="sm"
                            bg="gray.700"
                            color="white"
                            _hover={{ bg: 'gray.600' }}
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button
                            size="sm"
                            bg="teal.500"
                            color="white"
                            _hover={{ bg: 'teal.400' }}
                            onClick={handleSave}
                        >
                            <FiCheck />
                            Применить
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    )
}

export function getCroppedImg(
    imageSrc: string, 
    cropPixel: Area, 
    rotation: number,
    flip?: { horizontal: boolean; vertical: boolean }
): Promise<File> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = imageSrc
        image.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Canvas context not available'))
                return
            }

            let rotRad = (rotation * Math.PI) / 180

            const rad = Math.abs(rotation) % 180
            const swapDimensions = rad === 90 || rad === 270

            let bBoxWidth: number
            let bBoxHeight: number

            if (swapDimensions) {
                bBoxWidth = Math.abs(image.height * Math.cos(rotRad)) + Math.abs(image.width * Math.sin(rotRad))
                bBoxHeight = Math.abs(image.height * Math.sin(rotRad)) + Math.abs(image.width * Math.cos(rotRad))
            } else {
                bBoxWidth = Math.abs(image.width * Math.cos(rotRad)) + Math.abs(image.height * Math.sin(rotRad))
                bBoxHeight = Math.abs(image.width * Math.sin(rotRad)) + Math.abs(image.height * Math.cos(rotRad))
            }

            canvas.width = bBoxWidth
            canvas.height = bBoxHeight

            ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
            ctx.rotate(rotRad)
            
            if (flip?.horizontal || flip?.vertical) {
                ctx.scale(
                    flip.horizontal ? -1 : 1,
                    flip.vertical ? -1 : 1
                )
            }
            
            ctx.translate(-image.width / 2, -image.height / 2)

            ctx.drawImage(image, 0, 0)

            const data = ctx.getImageData(cropPixel.x, cropPixel.y, cropPixel.width, cropPixel.height)

            canvas.width = cropPixel.width
            canvas.height = cropPixel.height
            ctx.putImageData(data, 0, 0)

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' })
                    resolve(file)
                } else {
                    reject(new Error('Canvas is empty'))
                }
            }, 'image/jpeg', 0.95)
        }
        image.onerror = () => reject(new Error('Failed to load image'))
    })
}