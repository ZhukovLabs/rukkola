'use client';

import {Flex, Button, Icon} from "@chakra-ui/react";
import {FiChevronDown} from "react-icons/fi";

export const ScrollToFooterButton = () => {
    const handleClick = () => {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
        }
    };

    return (
        <Flex
            direction="column"
            align="center"
            pt={4}
            pb={10}
        >
            <Button
                onClick={handleClick}
                variant="outline"
                h="auto"
                px={5}
                py={2.5}
                fontSize="10px"
                fontWeight="medium"
                letterSpacing="0.02em"
                textTransform="uppercase"
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={2}
                color="whiteAlpha.700"
                borderColor="whiteAlpha.200"
                bg="whiteAlpha.50"
                backdropFilter="blur(8px)"
                transition="all 0.3s ease"
                _hover={{
                    borderColor: "whiteAlpha.400",
                    color: "whiteAlpha.900",
                    bg: "whiteAlpha.100",
                }}
                _active={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(1px)"
                }}
            >
                <span>Адрес, телефон, часы работы</span>
                <Icon as={FiChevronDown} boxSize={3} opacity={0.6} />
            </Button>
        </Flex>
    );
};
