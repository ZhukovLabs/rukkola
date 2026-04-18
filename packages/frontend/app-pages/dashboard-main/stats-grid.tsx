"use client";

import {
    Box,
    Flex,
    Text,
    SimpleGrid,
    Icon,
    Stat,
    FormatNumber,
    Stack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiBox, FiLayers, FiUsers } from "react-icons/fi";

const MotionBox = motion(Box);

interface StatsGridProps {
    stats: {
        products: number;
        hiddenProducts?: number;
        categories: number;
        users: number;
    };
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 6 }}>
            <StatBox
                label="Товары"
                value={stats.products}
                hiddenValue={stats.hiddenProducts}
                icon={FiBox}
                helpText="Всего товаров в системе"
            />
            <StatBox
                label="Категории"
                value={stats.categories}
                icon={FiLayers}
                helpText="Всего категорий"
            />
            <StatBox
                label="Пользователи"
                value={stats.users}
                icon={FiUsers}
                helpText="Всего пользователей"
            />
        </SimpleGrid>
    );
};

interface StatBoxProps {
    label: string;
    value: number;
    icon: React.ElementType;
    helpText?: string;
    hiddenValue?: number;
}

const StatBox = ({
                      label,
                      value,
                      icon,
                      helpText,
                      hiddenValue,
                  }: StatBoxProps) => (
    <MotionBox
        p={{ base: 5, md: 6 }}
        bg="gray.800"
        borderRadius="2xl"
        boxShadow="0 8px 24px rgba(0,0,0,0.3)"
        _hover={{
            transform: "translateY(-4px)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <Flex align="center" gap={{ base: 3, md: 4 }} mb={4}>
            <Box
                bg="rgba(128,128,128,0.1)"
                p={{ base: 3, md: 4 }}
                borderRadius="md"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Icon as={icon} boxSize={{ base: 6, md: 7 }} color="gray.300" />
            </Box>

            <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="medium"
                color="gray.300"
                lineClamp={2}
                wordBreak="break-word"
            >
                {label}
            </Text>
        </Flex>

        <Stat.Root>
            <Stack gap={1} align="flex-start">
                <Stat.ValueText
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="bold"
                    color="white"
                    lineHeight="1"
                >
                    <FormatNumber value={value} />
                </Stat.ValueText>

                {hiddenValue !== undefined && hiddenValue > 0 && (
                    <Text fontSize="sm" color="gray.400">
                        Скрыто:{" "}
                        <Text as="span" color="orange.300" fontWeight="semibold">
                            {hiddenValue}
                        </Text>
                    </Text>
                )}
            </Stack>

            {helpText && (
                <Stat.Label mt={hiddenValue ? 2 : 3} color="gray.500" fontSize="sm" lineClamp={2} wordBreak="break-word">
                    {helpText}
                </Stat.Label>
            )}
        </Stat.Root>
    </MotionBox>
);
