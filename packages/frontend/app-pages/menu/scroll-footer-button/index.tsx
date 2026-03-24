'use client';

import {Flex, Button, Icon} from "@chakra-ui/react";
import {FiChevronDown} from "react-icons/fi";
import {motion} from "framer-motion";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";

const MotionIcon = motion(Icon);
const MotionButton = motion(Button);

export const ScrollToFooterButton = () => {
    const disableMotion = useIsLowPerformanceDevice();

    const handleClick = () => {
        window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
    };

    return (
        <Flex direction="column" align="center" gap={{base: 3, md: 4}}>
            <MotionButton
                onClick={handleClick}
                px={{base: 6, md: 8}}
                py={5}
                fontSize={{base: "sm", md: "md"}}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={2}
                initial={!disableMotion ? {opacity: 0, y: -15} : undefined}
                animate={!disableMotion ? {opacity: 1, y: 0} : undefined}
                transition={!disableMotion ? {duration: 0.4} : undefined}
            >
                {disableMotion ? <>
                    <Icon as={FiChevronDown} boxSize={5}/>
                    Адрес, телефон, часы работы
                    <Icon as={FiChevronDown} boxSize={5}/>
                </> : (
                    <>
                        <MotionIcon
                            as={FiChevronDown}
                            boxSize={5}
                            animate={{y: [0, 3, 0]}}
                            transition={{
                                repeat: Infinity,
                                duration: 1.3,
                                ease: "easeInOut",
                            }}
                        />
                        Адрес, телефон, часы работы
                        <MotionIcon
                            as={FiChevronDown}
                            boxSize={5}
                            animate={{y: [0, 3, 0]}}
                            transition={{
                                repeat: Infinity,
                                duration: 1.3,
                                ease: "easeInOut",
                                delay: 0.15,
                            }}
                        />
                    </>
                )}
            </MotionButton>
        </Flex>
    );
};
