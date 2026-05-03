"use client";

import {
    Box,
    Flex,
    Text,
    SimpleGrid,
    Icon,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {FiBox, FiLayers, FiUsers} from "react-icons/fi";

const MotionBox = motion(Box);

interface StatsGridProps {
    stats: {
        products: number;
        hiddenProducts?: number;
        categories: number;
        users: number;
    };
}

export const StatsGrid = ({stats}: StatsGridProps) => {
    return (
        <SimpleGrid columns={{base: 1, md: 3}} gap={{base: 4, md: 5}}>
            <StatCard
                label="Товары"
                value={stats.products}
                icon={FiBox}
                helpText="Всего товаров в системе"
                hiddenValue={stats.hiddenProducts}
            />
            <StatCard
                label="Категории"
                value={stats.categories}
                icon={FiLayers}
                helpText="Всего категорий"
            />
            <StatCard
                label="Пользователи"
                value={stats.users}
                icon={FiUsers}
                helpText="Всего пользователей"
            />
        </SimpleGrid>
    );
};

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    helpText?: string;
    hiddenValue?: number;
}

const StatCard = ({label, value, icon, helpText, hiddenValue}: StatCardProps) => (
    <MotionBox
        p={{base: 5, md: 6}}
        bg="gray.800"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.700"
        _hover={{
            borderColor: "gray.600",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
    >
        <Flex align="center" gap={3} mb={4}>
            <Box
                bg="gray.700"
                p={2.5}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor="gray.600"
            >
                <Icon as={icon} boxSize={5} color="gray.300"/>
            </Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.400">
                {label}
            </Text>
        </Flex>

        <Text
            fontSize={{base: "3xl", md: "4xl"}}
            fontWeight="bold"
            color="white"
            lineHeight="1"
            mb={1}
        >
            {value}
        </Text>

        {hiddenValue !== undefined && hiddenValue > 0 && (
            <Text fontSize="sm" color="gray.500">
                Скрыто: <Text as="span" color="gray.400" fontWeight="semibold">{hiddenValue}</Text>
            </Text>
        )}

        {helpText && (
            <Text mt={3} color="gray.600" fontSize="sm">
                {helpText}
            </Text>
        )}
    </MotionBox>
);
