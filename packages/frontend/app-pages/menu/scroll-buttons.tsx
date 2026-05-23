'use client';

import {useState, useEffect} from "react";
import {Flex, Button, Icon, IconButton} from "@chakra-ui/react";
import {FiArrowUp, FiChevronDown} from "react-icons/fi";
import {MotionBox} from "@/lib/motion-box";

export const ScrollToFooterButton = () => {
    const handleClick = () => {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.scrollIntoView({behavior: 'smooth'});
        } else {
            window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
        }
    };

    return (
        <Flex direction="column" align="center" pt={4} pb={10}>
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
                <Icon as={FiChevronDown} boxSize={3} opacity={0.6}/>
            </Button>
        </Flex>
    );
};

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <MotionBox
            position="fixed"
            top="80px"
            right="16px"
            zIndex={9996}
            initial={{opacity: 0, scale: 0.8, y: 20}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.8, y: 20}}
            transition={{duration: 0.3, type: "spring", stiffness: 200, damping: 18}}
        >
            <IconButton
                aria-label="Наверх"
                borderRadius="full"
                size="lg"
                onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                bg="gray.700"
                color="gray.300"
                boxShadow="0 4px 10px rgba(0,0,0,0.3)"
                _hover={{
                    transform: "translateY(-3px) scale(1.05)",
                    color: "white",
                    bg: "gray.600",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
                }}
                _active={{transform: "scale(0.96)"}}
                transition="all 0.25s ease"
            >
                <FiArrowUp size={24}/>
            </IconButton>
        </MotionBox>
    );
};
