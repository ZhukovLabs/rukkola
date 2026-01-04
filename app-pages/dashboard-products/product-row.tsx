import {Box, Button, Flex, IconButton, Image, Stack, Table, Text} from "@chakra-ui/react";
import {Tooltip} from "@/components/tooltip";
import {FaEdit, FaEye, FaEyeSlash, FaTrash, FaWineBottle, FaWineGlassAlt} from "react-icons/fa";
import {useRouter} from "next/navigation";
import type {ProductType} from "@/models/product";
import type {ActionResponse} from "@/types";
import type {UseMutateFunction} from "@tanstack/react-query";
import type {CategoryType} from "@/models/category";

type ProductRowProps = {
    product: ProductType;
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
}

export const ProductRow = ({
                               product: p,
                               onToggle,
                               onToggleAlcohol,
                               onDelete,
                               loadingId,
                               deletePending,
                               togglingAlcoholId
                           }: ProductRowProps) => {
    const router = useRouter();

    return (
        <Table.Row
            key={p.id}
            bg="gray.900"
            borderBottom="1px solid"
            borderColor="gray.800"
            _hover={{bg: 'gray.800', transition: '0.2s ease'}}
        >
            <Table.Cell p={4}>
                <Image
                    src={p.image || '/placeholder.png'}
                    alt={p.name}
                    boxSize="60px"
                    borderRadius="md"
                    objectFit="cover"
                    border="1px solid"
                    borderColor="gray.700"
                />
            </Table.Cell>

            <Table.Cell fontWeight="semibold" color="teal.400" p={4}>
                {p.name}
            </Table.Cell>

            <Table.Cell maxW="450px" whiteSpace="normal" color="gray.300" p={4}>
                {p.description || '—'}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.prices?.length ? (
                    <Stack gap={1} fontSize="sm">
                        {p.prices.map(({size, price}) => (
                            <Flex key={size} justify="space-between" borderBottom="1px dashed"
                                  borderColor="gray.700"
                                  pb="1">
                                <Text color="gray.400">{size}</Text>
                                <Text color="teal.400" fontWeight="semibold">
                                    {price} руб.
                                </Text>
                            </Flex>
                        ))}
                    </Stack>
                ) : (
                    <Text color="gray.500">нет данных</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                {p.categories?.length ? (
                    <Flex wrap="wrap" gap={1}>
                        {
                            /* @ts-expect-error - populate */
                            p.categories.map((c: CategoryType) => {
                                return (
                                    <Box
                                        key={c.id}
                                        bg="gray.700"
                                        color="gray.200"
                                        px={2}
                                        py={0.5}
                                        borderRadius="md"
                                        fontSize="sm"
                                    >
                                        {c.name}
                                    </Box>
                                );
                            })
                        }
                    </Flex>
                ) : (
                    <Text color="gray.500">—</Text>
                )}
            </Table.Cell>

            <Table.Cell p={4}>
                <Stack direction="row" gap={2} align="center">
                    {/* Кнопка алкоголь/безалкогольный */}
                    <Tooltip
                        content={p.isAlcohol ? 'Алкогольный продукт' : 'Безалкогольный продукт'}
                        openDelay={400}
                    >
                        <Button
                            size="sm"
                            borderRadius="xl"
                            bgGradient={
                                p.isAlcohol
                                    ? 'linear(to-r, purple.500, purple.600)'
                                    : 'linear(to-r, green.500, green.600)'
                            }
                            color="white"
                            px={3}
                            py={2}
                            fontSize="sm"
                            fontWeight="semibold"
                            _hover={{
                                transform: 'scale(1.05)',
                                bgGradient: p.isAlcohol
                                    ? 'linear(to-r, purple.600, purple.700)'
                                    : 'linear(to-r, green.600, green.700)',
                            }}
                            _active={{transform: 'scale(0.97)'}}
                            loading={togglingAlcoholId === p.id}
                            onClick={() => onToggleAlcohol(p.id)}
                            flexShrink={0}
                        >
                            {p.isAlcohol ? <FaWineBottle /> : <FaWineGlassAlt />}{p.isAlcohol ? 'Алк.' : 'Без алк.'}
                        </Button>
                    </Tooltip>

                    {/* Кнопка показать/скрыть */}
                    <Tooltip content={p.hidden ? 'Сейчас товар скрыт' : 'Сейчас товар отображается'}
                             openDelay={400}>
                        <Button
                            size="sm"
                            borderRadius="xl"
                            bgGradient={
                                p.hidden
                                    ? 'linear(to-r, orange.400, orange.500)'
                                    : 'linear(to-r, teal.400, teal.500)'
                            }
                            color="white"
                            px={3}
                            py={2}
                            fontSize="sm"
                            fontWeight="semibold"
                            _hover={{
                                transform: 'scale(1.05)',
                                bgGradient: p.hidden
                                    ? 'linear(to-r, orange.500, orange.600)'
                                    : 'linear(to-r, teal.500, teal.600)',
                            }}
                            _active={{transform: 'scale(0.97)'}}
                            loading={loadingId === p.id}
                            onClick={() => onToggle(p.id)}
                            flexShrink={0}
                        >
                            {p.hidden ? <FaEye /> : <FaEyeSlash />}{p.hidden ? 'Показать' : 'Скрыть'}
                        </Button>
                    </Tooltip>

                    <Tooltip content="Редактировать" openDelay={400}>
                        <IconButton
                            aria-label="Редактировать"
                            size="sm"
                            borderRadius="xl"
                            bgGradient="linear(to-r, blue.400, blue.500)"
                            color="white"
                            _hover={{transform: 'scale(1.1)', bgGradient: 'linear(to-r, blue.500, blue.600)'}}
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
                            size="sm"
                            borderRadius="xl"
                            bgGradient="linear(to-r, red.500, red.600)"
                            color="white"
                            _hover={{transform: 'scale(1.1)', bgGradient: 'linear(to-r, red.600, red.700)'}}
                            onClick={() => onDelete(p.id)}
                            loading={deletePending === p.id}
                            flexShrink={0}
                        >
                            <FaTrash/>
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Table.Cell>
        </Table.Row>
    )
}