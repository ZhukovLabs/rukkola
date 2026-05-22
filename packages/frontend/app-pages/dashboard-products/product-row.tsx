import { Box, Button, Flex, IconButton, Image, Stack, Table, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/tooltip";
import {
    FaEdit,
    FaEye,
    FaEyeSlash,
    FaTrash,
    FaWineBottle,
    FaWineGlassAlt,
    FaImage,
    FaExclamationTriangle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionResponse } from "@/types";
import type { UseMutateFunction } from "@tanstack/react-query";
import { PositionDialog } from "./position-dialog";

type PortionPrice = { size: string; price: number };
type CategoryRef = { id: string; name: string };
type ProductTag = { text: string; color: string };

type ProductType = {
    id: string;
    name: string;
    description?: string | null;
    prices: PortionPrice[];
    image?: string | null;
    categories: CategoryRef[];
    hidden: boolean;
    isAlcohol: boolean;
    order: number;
    tags?: ProductTag[];
};

type ProductRowProps = {
    product: ProductType;
    position: number;
    totalItems: number;
    onToggle: UseMutateFunction<
        ActionResponse<{
            id: string;
            hidden: boolean;
        }>,
        Error,
        string,
        void
    >;
    onToggleAlcohol: UseMutateFunction<
        ActionResponse<{
            id: string;
            isAlcohol: boolean;
        }>,
        Error,
        string,
        void
    >;
    onDelete: (id: string) => void;
    loadingId: string | null;
    deletePending: string | null;
    togglingAlcoholId: string | null;
    onMoveToPosition: (productId: string, position: number) => void;
    isMoving: boolean;
};

export const ProductRow = ({
                               product: p,
                               position,
                               totalItems,
                               onToggle,
                               onToggleAlcohol,
                               onDelete,
                               loadingId,
                               deletePending,
                               togglingAlcoholId,
                               onMoveToPosition,
                               isMoving,
                           }: ProductRowProps) => {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    const hasImage = Boolean(p.image);
    const showBrokenPlaceholder = hasImage && imageError;
    const showEmptyPlaceholder = !hasImage;

    return (
        <>
            <Table.Cell p={3}>
                <PositionDialog
                    currentPosition={position}
                    totalItems={totalItems}
                    onMove={(pos: number) => onMoveToPosition(p.id, pos)}
                    isLoading={isMoving}
                />
            </Table.Cell>

            <Table.Cell p={4}>
                <Box position="relative" boxSize="60px">
                    {showEmptyPlaceholder ? (
                        <Tooltip content="Изображение отсутствует" openDelay={300}>
                            <Flex
                                boxSize="100%"
                                borderRadius="xl"
                                bg="gray.900"
                                border="1px solid"
                                borderColor="gray.800"
                                align="center"
                                justify="center"
                                color="gray.700"
                                cursor="help"
                            >
                                <FaImage size={20} />
                            </Flex>
                        </Tooltip>
                    ) : showBrokenPlaceholder ? (
                        <Tooltip content="Ошибка загрузки изображения" openDelay={300}>
                            <Flex
                                boxSize="100%"
                                borderRadius="xl"
                                bg="red.950/10"
                                border="1px solid"
                                borderColor="red.900/20"
                                align="center"
                                justify="center"
                                color="red.400/30"
                                cursor="help"
                            >
                                <FaExclamationTriangle size={16} />
                            </Flex>
                        </Tooltip>
                    ) : (
                        <Box 
                            boxSize="100%" 
                            borderRadius="xl" 
                            overflow="hidden" 
                            border="1px solid" 
                            borderColor="gray.800"
                            bg="gray.900"
                            shadow="xl"
                            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            _hover={{ transform: "scale(1.1)", shadow: "0 10px 20px rgba(0,0,0,0.5)", zIndex: 10, position: "relative" }}
                        >
                            <Image
                                src={`${p.image}?w=300`}
                                alt={p.name}
                                boxSize="100%"
                                objectFit="cover"
                                onError={() => setImageError(true)}
                            />
                        </Box>
                    )}

                    {p.hidden && (
                        <Box
                            position="absolute"
                            top="-4px"
                            right="-4px"
                            bg="orange.500"
                            color="white"
                            borderRadius="full"
                            p={1}
                            shadow="0 0 10px rgba(237, 137, 54, 0.5)"
                            zIndex={11}
                            border="2px solid"
                            borderColor="gray.950"
                        >
                            <Tooltip content="Товар скрыт" openDelay={200}>
                                <Box>
                                    <FaEyeSlash size={10} />
                                </Box>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
            </Table.Cell>

            <Table.Cell p={4}>
                <Stack gap={1.5}>
                    <Text fontSize="md" fontWeight="bold" letterSpacing="tight" color="gray.100">{p.name}</Text>
                    {p.tags && p.tags.length > 0 && (
                        <Flex gap={2} flexWrap="wrap">
                            {p.tags.map((tag, index) => (
                                <Flex
                                    key={index}
                                    align="center"
                                    gap={1.5}
                                    fontSize="9px"
                                    color="gray.500"
                                    fontWeight="bold"
                                    textTransform="uppercase"
                                    letterSpacing="0.05em"
                                >
                                    <Box boxSize="5px" borderRadius="full" bg={tag.color} shadow={`0 0 6px ${tag.color}`} />
                                    {tag.text}
                                </Flex>
                            ))}
                        </Flex>
                    )}
                </Stack>
            </Table.Cell>

            <Table.Cell
                maxW="250px"
                whiteSpace="normal"
                color="gray.500"
                p={4}
                fontSize="xs"
                lineHeight="relaxed"
               
                fontWeight="medium"
            >
                {p.description || <Text color="gray.700" fontStyle="italic" opacity={0.5}>Описание отсутствует</Text>}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.prices?.length ? (
                    <Flex wrap="wrap" gap={2}>
                        {p.prices.map(({ size, price }) => (
                            <Flex
                                key={size}
                                align="center"
                                gap={2}
                                bg="whiteAlpha.50"
                                border="1px solid"
                                borderColor="whiteAlpha.100"
                                borderRadius="full"
                                px={3}
                                py={1}
                                transition="all 0.2s"
                                _hover={{ 
                                    bg: "whiteAlpha.100", 
                                    borderColor: "whiteAlpha.200", 
                                    transform: "translateY(-1px)"
                                }}
                            >
                                <Text color="gray.400" fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                                    {size}
                                </Text>
                                <Box w="1px" h="10px" bg="gray.800" />
                                <Text color="white" fontSize="xs" fontWeight="bold" whiteSpace="nowrap">
                                    {price} <Box as="span" fontSize="9px" color="gray.500" ml={0.5} fontWeight="medium">руб.</Box>
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                ) : (
                    <Text color="gray.700" fontSize="xs">—</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.categories?.length ? (
                    <Flex wrap="wrap" gap={2}>
                        {p.categories.map((c: CategoryRef) => (
                            <Box
                                key={c.id}
                                bg="green.950/10"
                                color="green.300/80"
                                px={3}
                                py={1}
                                borderRadius="lg"
                                fontSize="10px"
                                fontWeight="bold"
                                border="1px solid"
                                borderColor="green.900/30"
                                transition="all 0.2s"
                                _hover={{ borderColor: "green.700/50", color: "green.200" }}
                            >
                                {c.name}
                            </Box>
                        ))}
                    </Flex>
                ) : (
                    <Text color="gray.700" fontSize="sm">—</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                <Flex gap={2} align="center" justify="flex-end">
                    <Tooltip content={p.isAlcohol ? "Алкоголь" : "Без алкоголя"} openDelay={400}>
                        <IconButton
                            aria-label="Тип"
                            size="sm"
                            borderRadius="xl"
                            variant="ghost"
                            color={p.isAlcohol ? "orange.400" : "gray.600"}
                            _hover={{
                                bg: p.isAlcohol ? "orange.950/40" : "gray.800",
                                color: p.isAlcohol ? "orange.300" : "gray.300",
                            }}
                            loading={togglingAlcoholId === p.id}
                            onClick={() => onToggleAlcohol(p.id)}
                        >
                            {p.isAlcohol ? <FaWineBottle size={16} /> : <FaWineGlassAlt size={16} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip content={p.hidden ? "Показать" : "Скрыть"} openDelay={400}>
                        <IconButton
                            aria-label="Видимость"
                            size="sm"
                            borderRadius="xl"
                            variant="ghost"
                            color={p.hidden ? "gray.600" : "gray.400"}
                            _hover={{ bg: "gray.800", color: "white" }}
                            loading={loadingId === p.id}
                            onClick={() => onToggle(p.id)}
                        >
                            {p.hidden ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Изменить" openDelay={400}>
                        <IconButton
                            aria-label="Редактировать"
                            size="sm"
                            borderRadius="xl"
                            variant="ghost"
                            color="gray.400"
                            _hover={{ bg: "gray.800", color: "white" }}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search);
                                params.set("edit", p.id);
                                router.push(`?${params.toString()}`, { scroll: false });
                            }}
                        >
                            <FaEdit size={16} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Удалить" openDelay={400}>
                        <IconButton
                            aria-label="Удалить"
                            size="sm"
                            borderRadius="xl"
                            variant="ghost"
                            color="gray.600"
                            _hover={{ bg: "red.950/20", color: "red.400" }}
                            onClick={() => onDelete(p.id)}
                            loading={deletePending === p.id}
                        >
                            <FaTrash size={16} />
                        </IconButton>
                    </Tooltip>
                </Flex>
            </Table.Cell>
        </>
    );
};
