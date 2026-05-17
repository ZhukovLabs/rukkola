import {Box, Flex, Spinner} from "@chakra-ui/react";
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";
import {getCategories} from "@/lib/api/categories";
import {MotionButton, MotionText} from "./motion";

export const NotFoundQuickLinks = () => {
    const {data: response, isLoading} = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
        staleTime: 60 * 1000,
    });

    const categories = response?.data?.filter(c => c.isMenuItem && !c.hidden).slice(0, 4) || [];

    if (isLoading) {
        return (
            <Box mt={4}>
                <Spinner color="gray.500" />
            </Box>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <Box mt={6} w="full">
            <MotionText
                fontSize="sm"
                fontWeight="semibold"
                color="gray.400"
                mb={4}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.9}}
            >
                Возможно, вы искали:
            </MotionText>
            <Flex wrap="wrap" justify="center" gap={3}>
                {categories.map((category, index) => (
                    <MotionButton
                        key={category._id}
                        as={Link}
                        // @ts-expect-error - chakra v3 + next/link typing issue
                        href={`/#${category._id}`}
                        size="sm"
                        variant="outline"
                        color="gray.300"
                        borderColor="gray.700"
                        _hover={{
                            bg: "gray.800",
                            borderColor: "gray.600",
                            color: "white",
                        }}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 1 + index * 0.1}}
                    >
                        {category.name}
                    </MotionButton>
                ))}
            </Flex>
        </Box>
    );
};
