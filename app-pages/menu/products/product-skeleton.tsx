import {Box, Skeleton, SkeletonText} from "@chakra-ui/react";

export const ProductSkeleton = () => (
    <Box
        borderRadius="lg"
        overflow="hidden"
        bg="gray.800"
        boxShadow="md"
        transition="all 0.2s"
    >
        <Skeleton height="200px" width="100%"/>
        <Box p={4}>
            <Skeleton height="24px" width="80%" mb={2}/>
            <SkeletonText mt={2} noOfLines={2} gap={2}/>
            <Skeleton height="32px" width="60%" mt={4}/>
        </Box>
    </Box>
);