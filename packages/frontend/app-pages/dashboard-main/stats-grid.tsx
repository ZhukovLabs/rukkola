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

const MotionBox = motion.create(Box);

const accentColors = {
    products: {scheme: "orange", shadow: "rgba(237, 137, 54, 0.15)"},
    categories: {scheme: "green", shadow: "rgba(72, 187, 120, 0.15)"},
    users: {scheme: "blue", shadow: "rgba(66, 153, 225, 0.15)"},
} as const;

type StatsGridProps = {
    stats: {
        products: number;
        hiddenProducts?: number;
        categories: number;
        users: number;
    };
};

export const StatsGrid = ({stats}: StatsGridProps) => {
    return (
        <SimpleGrid columns={{base: 1, md: 3}} gap={{base: 4, md: 5}}>
            <StatCard
                label="Товары"
                value={stats.products}
                icon={FiBox}
                helpText="Всего товаров в системе"
                hiddenValue={stats.hiddenProducts}
                accent={accentColors.products}
            />
            <StatCard
                label="Категории"
                value={stats.categories}
                icon={FiLayers}
                helpText="Всего категорий"
                accent={accentColors.categories}
            />
            <StatCard
                label="Пользователи"
                value={stats.users}
                icon={FiUsers}
                helpText="Всего пользователей"
                accent={accentColors.users}
            />
        </SimpleGrid>
    );
};

type StatCardProps = {
    label: string;
    value: number;
    icon: React.ElementType;
    helpText?: string;
    hiddenValue?: number;
    accent: {scheme: string; shadow: string};
};

const StatCard = ({label, value, icon, helpText, hiddenValue, accent}: StatCardProps) => (
    <MotionBox
        p={{base: 5, md: 6}}
        bg="gray.900"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.800"
        position="relative"
        overflow="hidden"
        _hover={{
            borderColor: `${accent.scheme}.800/50`,
            transform: "translateY(-3px)",
            boxShadow: `0 12px 40px -8px rgba(0,0,0,0.5)`,
        }}
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
    >
        <Box
            position="absolute"
            top="-20px"
            right="-20px"
            color={`${accent.scheme}.500`}
            opacity={0.04}
            transform="rotate(-15deg)"
            pointerEvents="none"
        >
            <Icon as={icon} boxSize={24} />
        </Box>

        <Flex align="center" gap={3} mb={4}>
            <Box
                bg={`${accent.scheme}.900/30`}
                p={2.5}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={`${accent.scheme}.700/30`}
                shadow={`0 0 16px ${accent.shadow}`}
            >
                <Icon as={icon} boxSize={5} color={`${accent.scheme}.400`} />
            </Box>
            <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                {label}
            </Text>
        </Flex>

        <Text
            fontSize={{base: "4xl", md: "5xl"}}
            fontWeight="black"
            color="white"
            lineHeight="1"
            letterSpacing="tight"
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
            <Flex align="center" gap={1.5} mt={3}>
                <Box boxSize="5px" borderRadius="full" bg={`${accent.scheme}.500`} shadow={`0 0 6px ${accent.shadow}`} />
                <Text color="gray.600" fontSize="xs" fontWeight="medium">
                    {helpText}
                </Text>
            </Flex>
        )}
    </MotionBox>
);
