import {Box, Button, Flex, IconButton, Image, Stack, Table, Text} from "@chakra-ui/react";
import {Tooltip} from "@/components/tooltip";
import {FaEdit, FaEye, FaEyeSlash, FaTrash, FaWineBottle, FaWineGlassAlt} from "react-icons/fa";
import {useRouter} from "next/navigation";
import type {ActionResponse} from "@/types";
import type {UseMutateFunction} from "@tanstack/react-query";

type PortionPrice = { size: string; price: number };
type CategoryRef = { id: string; name: string };

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
};
import {PositionDialog} from "./position-dialog";

type ProductRowProps = {
    product: ProductType;
    position: number;
    totalItems: number;
    onToggle: UseMutateFunction<ActionResponse<{
        id: string;
        hidden: boolean;
    }>, Error, string, void>;
    onToggleAlcohol: UseMutateFunction<ActionResponse<{
        id: string;
        isAlcohol: boolean;
    }>, Error, string, void>
    onDelete: (id: string) => void;
    loadingId: string | null;
    deletePending: string | null;
    togglingAlcoholId: string | null;
    onMoveToPosition: (productId: string, position: number) => void;
    isMoving: boolean;
}

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

    return (
        <>
            <Table.Cell p={2}>
                <PositionDialog
                    currentPosition={position}
                    totalItems={totalItems}
                    onMove={(pos: number) => onMoveToPosition(p.id, pos)}
                    isLoading={isMoving}
                />
            </Table.Cell>
            <Table.Cell p={4}>
                <Image
                    src={`${p.image}?w=300` || '/placeholder.png'}
                    alt={p.name}
                    boxSize="60px"
                    borderRadius="lg"
                    objectFit="cover"
                    border="2px solid"
                    borderColor="gray.800"
                    _hover={{borderColor: 'gray.600', transform: 'scale(1.05)'}}
                    transition="all 0.2s"
                />
            </Table.Cell>

            <Table.Cell fontWeight="semibold" color="gray.200" p={4}>
                {p.name}
            </Table.Cell>

            <Table.Cell maxW="450px" whiteSpace="normal" color="gray.500" p={4} fontSize="sm">
                {p.description || <Text color="gray.600">—</Text>}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.prices?.length ? (
                    <Stack gap={1} fontSize="sm">
                        {p.prices.map(({size, price}) => (
                            <Flex key={size} justify="space-between" align="center" gap={3}>
                                <Text color="gray.600" fontSize="xs">{size}</Text>
                                <Text color="gray.300" fontWeight="600" fontSize="sm">
                                    {price} ₽
                                </Text>
                            </Flex>
                        ))}
                    </Stack>
                ) : (
                    <Text color="gray.600" fontSize="sm">нет данных</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.categories?.length ? (
                    <Flex wrap="wrap" gap={1}>
                        {p.categories.map((c: CategoryRef) => (
                            <Box
                                key={c.id}
                                bg="gray.800"
                                color="gray.400"
                                px={2.5}
                                py={0.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="medium"
                                border="1px solid"
                                borderColor="gray.750"
                            >
                                {c.name}
                            </Box>
                        ))}
                    </Flex>
                ) : (
                    <Text color="gray.600" fontSize="sm">—</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                <Stack direction="row" gap={2} align="center">
                    <Tooltip
                        content={p.isAlcohol ? 'Алкогольный — нажмите для переключения' : 'Безалкогольный — нажмите для переключения'}
                        openDelay={400}
                    >
                        <Button
                            size="xs"
                            borderRadius="lg"
                            bg="gray.850"
                            color="gray.200"
                            px={2.5}
                            py={1}
                            fontSize="xs"
                            fontWeight="semibold"
                            border="1px solid"
                            borderColor="gray.700"
                            _hover={{
                                bg: 'gray.800',
                                borderColor: 'gray.600',
                            }}
                            _active={{transform: 'scale(0.96)'}}
                            loading={togglingAlcoholId === p.id}
                            onClick={() => onToggleAlcohol(p.id)}
                            flexShrink={0}
                        >
                            {p.isAlcohol ? <FaWineBottle/> : <FaWineGlassAlt/>}
                            {p.isAlcohol ? 'Алк.' : 'Без алк.'}
                        </Button>
                    </Tooltip>

                    <Tooltip content={p.hidden ? 'Показать товар' : 'Скрыть товар'} openDelay={400}>
                        <IconButton
                            aria-label={p.hidden ? 'Показать' : 'Скрыть'}
                            size="xs"
                            borderRadius="lg"
                            bg="gray.850"
                            color="gray.200"
                            border="1px solid"
                            borderColor="gray.700"
                            _hover={{
                                bg: 'gray.800',
                                borderColor: 'gray.600',
                            }}
                            _active={{transform: 'scale(0.96)'}}
                            loading={loadingId === p.id}
                            onClick={() => onToggle(p.id)}
                            flexShrink={0}
                        >
                            {p.hidden ? <FaEye/> : <FaEyeSlash/>}
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Редактировать" openDelay={400}>
                        <IconButton
                            aria-label="Редактировать"
                            size="xs"
                            borderRadius="lg"
                            bg="gray.850"
                            color="gray.200"
                            border="1px solid"
                            borderColor="gray.700"
                            _hover={{
                                bg: 'gray.800',
                                borderColor: 'gray.600',
                            }}
                            _active={{transform: 'scale(0.96)'}}
                            onClick={() => {
                                const params = new URLSearchParams(window.location.search)
                                params.set('edit', p.id)
                                router.push(`?${params.toString()}`, {scroll: false})
                            }}
                            flexShrink={0}
                        >
                            <FaEdit/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip content="Удалить" openDelay={400}>
                        <IconButton
                            aria-label="Удалить"
                            size="xs"
                            borderRadius="lg"
                            bg="gray.850"
                            color="gray.400"
                            border="1px solid"
                            borderColor="gray.700"
                            _hover={{
                                bg: 'gray.800',
                                color: 'red.400',
                                borderColor: 'gray.600',
                            }}
                            _active={{transform: 'scale(0.96)'}}
                            onClick={() => onDelete(p.id)}
                            loading={deletePending === p.id}
                            flexShrink={0}
                        >
                            <FaTrash/>
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Table.Cell>
        </>
    );
}