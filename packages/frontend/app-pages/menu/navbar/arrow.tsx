import {Box} from "@chakra-ui/react";

export const Arrow = () => (
    <Box
        position="absolute"
        top="-8px"
        left="50%"
        transform="translateX(-50%)"
        w={0}
        h={0}
        borderLeft="8px solid transparent"
        borderRight="8px solid transparent"
        borderBottom="8px solid rgba(26,32,44,0.85)"
        filter="drop-shadow(0 -2px 4px rgba(0,0,0,0.3))"
    />
);