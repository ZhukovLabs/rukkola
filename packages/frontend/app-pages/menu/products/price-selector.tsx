'use client';

import {Flex, Text, Button} from "@chakra-ui/react";
import {useState} from "react";
import {FiCheck} from "react-icons/fi";

type Price = { size: string; price: number };

type PriceSelectorProps = {
    prices: Price[];
    onAdd: (price: number, size: string) => void;
    added: boolean;
};

export function PriceSelector({prices, onAdd, added}: PriceSelectorProps) {
    const [selecting, setSelecting] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);

    if (!prices.length) return null;

    const firstPrice = prices[0];

    const handleAddClick = () => {
        if (prices.length > 1) {
            setSelecting(true);
            setSelectedPrice(firstPrice);
        } else {
            onAdd(firstPrice.price, firstPrice.size);
        }
    };

    const handleConfirm = () => {
        if (!selectedPrice) return;
        onAdd(selectedPrice.price, selectedPrice.size);
        setSelecting(false);
        setSelectedPrice(null);
    };

    const handleCancel = () => {
        setSelecting(false);
        setSelectedPrice(null);
    };

    if (selecting) {
        return (
            <Flex direction="column" gap={2}>
                {prices.map(p => (
                    <Button
                        key={p.size}
                        size="sm"
                        borderRadius="full"
                        px={{base: 2, md: 4}}
                        py={{base: 1, md: 2}}
                        fontSize={{base: "xs", md: "sm"}}
                        bg={selectedPrice?.size === p.size ? "gray.500" : "gray.800"}
                        color={selectedPrice?.size === p.size ? "white" : "gray.300"}
                        borderWidth="1px"
                        borderColor="gray.500"
                        w="full"
                        _hover={{bg: "gray.600", color: "white"}}
                        onClick={() => setSelectedPrice(p)}
                    >
                        {p.size} — {p.price.toFixed(2).replace(".", ",")} руб.
                    </Button>
                ))}
                <Flex gap={3}>
                    <Button size="sm" borderRadius="full" onClick={handleCancel} bg="red.500" flex={1}>
                        Отмена
                    </Button>
                    <Button size="sm" borderRadius="full" onClick={handleConfirm} bg="#059669" flex={1}>
                        OK
                    </Button>
                </Flex>
            </Flex>
        );
    }

    return (
        <Flex direction="column" gap={3}>
            {prices.map(p => (
                <Flex key={p.size} justify="space-between">
                    <Text fontSize="sm" color="gray.400">{p.size}</Text>
                    <Text fontSize="sm" color="gray.300">{p.price.toFixed(2).replace(".", ",")} руб.</Text>
                </Flex>
            ))}
            <Button
                size="sm"
                borderRadius="full"
                borderWidth="1px"
                borderColor="gray.500"
                onClick={handleAddClick}
                bg={added ? "gray.500" : "gray.800"}
                w="full"
            >
                {added ? (
                    <Flex align="center" gap={1}><FiCheck/> Добавлено</Flex>
                ) : "Добавить"}
            </Button>
        </Flex>
    );
}
