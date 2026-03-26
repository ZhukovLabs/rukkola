'use client';

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";

export function ErrorFallback() {
    return (
        <Box py={20} textAlign="center">
            <VStack gap={4}>
                <Text color="gray.400" fontSize="lg">
                    Не удалось загрузить меню
                </Text>
                <Button
                    onClick={() => window.location.reload()}
                    colorPalette="teal"
                    variant="outline"
                >
                    <FiRefreshCw />
                    <Box as="span" ml={2}>Обновить страницу</Box>
                </Button>
            </VStack>
        </Box>
    );
}