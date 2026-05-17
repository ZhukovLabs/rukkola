"use client";

import {Box} from "@chakra-ui/react";
import {BackgroundBlobs} from "./components/BackgroundBlobs";
import {NotFoundContent} from "./components/NotFoundContent";
import {useReducedMotion} from "./hooks/use-reduced-motion";

export const NotFound = () => {
    const reducedMotion = useReducedMotion();

    return (
        <Box
            minH="100vh"
            bg="gray.900"
            overflow="hidden"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
        >
            <BackgroundBlobs reducedMotion={reducedMotion} />
            <NotFoundContent reducedMotion={reducedMotion} />
        </Box>
    );
};
