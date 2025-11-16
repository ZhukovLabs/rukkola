import {Box, Flex} from "@chakra-ui/react";
import Image from "next/image";

type ActiveLunchProps = {
    image: string;
}

export const ActiveLunch = ({image}: ActiveLunchProps) => (
    <Flex justify="center" align="center" mt={4} mb={6}>
        <Box
            position="relative"
            overflow="hidden"
            rounded="xl"
            boxShadow="0 0 15px rgba(56,178,172,0.4)"
            border="1px solid"
            borderColor="teal.700"
            maxW="600px"
            w="100%"
            transition="all 0.3s ease"
            _hover={{
                transform: "scale(1.015)",
                boxShadow: "0 0 25px rgba(56,178,172,0.5)",
            }}
        >
            <Image
                src={image}
                alt="Обеденное меню"
                width={800}
                height={220}
                style={{
                    borderRadius: "12px",
                    objectFit: "contain",
                }}
                priority
            />
        </Box>
    </Flex>
);