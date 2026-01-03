import { Button, Flex, Text } from "@chakra-ui/react";

const navButtonStyles = {
    size: "xs",
    bg: "teal.500",
    color: "white",
    _hover: { bg: "teal.600" },
    _active: { bg: "teal.700", transform: "scale(0.95)" },
    borderRadius: "full",
    minW: "36px",
    minH: "36px",
    boxShadow: "md",
    p: 2,
} as const;

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
    const generatePages = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

        if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];

        if (page >= totalPages - 3)
            return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    const pages = generatePages();

    return (
        <Flex justify="center" align="center" gap={2} flexWrap="wrap">
            <Button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                {...navButtonStyles}
                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            >
                ← Назад
            </Button>

            {pages.map((num, idx) =>
                num === "..." ? (
                    <Text key={`ellipsis-${idx}`} color="gray.500" px={2}>
                        ...
                    </Text>
                ) : (
                    <Button
                        key={`page-${num}-${idx}`}
                        size="sm"
                        onClick={() => onPageChange(Number(num))}
                        bg={num === page ? "teal.500" : "gray.800"}
                        color={num === page ? "white" : "gray.300"}
                        _hover={{ bg: "teal.600", color: "white", transform: "scale(1.05)" }}
                        border="1px solid"
                        borderColor={num === page ? "teal.500" : "gray.700"}
                        borderRadius="full"
                        minW="36px"
                        minH="36px"
                    >
                        {num}
                    </Button>
                )
            )}

            <Button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                {...navButtonStyles}
                _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            >
                Вперёд →
            </Button>
        </Flex>
    );
};
