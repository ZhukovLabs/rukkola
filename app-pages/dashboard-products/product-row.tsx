import {Box, Button, Flex, IconButton, Image, Stack, Table, Text} from "@chakra-ui/react";
import {Tooltip} from "@/components/tooltip";
import {FaEdit, FaEye, FaEyeSlash, FaTrash} from "react-icons/fa";

export const ProductRow = ({product: p, onToggle, onDelete, loadingId, deletePending, router}: any) => (
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
                    {p.prices.map((price: any) => (
                        <Flex key={price.size} justify="space-between" borderBottom="1px dashed" borderColor="gray.700"
                              pb="1">
                            <Text color="gray.400">{price.size}</Text>
                            <Text color="teal.400" fontWeight="semibold">
                                {price.price} руб.
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
                    {p.categories.map((c: any) => (
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
                    ))}
                </Flex>
            ) : (
                <Text color="gray.500">—</Text>
            )}
        </Table.Cell>

        <Table.Cell p={4}>
            <Flex gap={2} align="center" whiteSpace="nowrap">
                <Tooltip content={p.hidden ? 'Сейчас товар скрыт' : 'Сейчас товар отображается'} openDelay={400}>
                    <Button
                        minW={128}
                        size="sm"
                        borderRadius="xl"
                        bgGradient={
                            p.hidden
                                ? 'linear(to-r, orange.400, orange.500)'
                                : 'linear(to-r, teal.400, teal.500)'
                        }
                        color="white"
                        px={4}
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
                        {p.hidden ? <FaEye/> : <FaEyeSlash/>}
                        {p.hidden ? 'Показать' : 'Скрыть'}
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
                        loading={deletePending && deletePending === p.id}
                        flexShrink={0}
                    >
                        <FaTrash/>
                    </IconButton>
                </Tooltip>
            </Flex>
        </Table.Cell>
    </Table.Row>
)
