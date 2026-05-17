import {Flex} from "@chakra-ui/react";
import Link from "next/link";
import {FiHome} from "react-icons/fi";
import {NotFoundIcon} from "./NotFoundIcon";
import {NotFoundTitle} from "./NotFoundTitle";
import {NotFoundQuickLinks} from "./NotFoundQuickLinks";
import {MotionButton, MotionHeading, MotionText} from "./motion";

type NotFoundContentProps = {
    reducedMotion: boolean;
};

export const NotFoundContent = ({reducedMotion}: NotFoundContentProps) => {
    return (
        <Flex
            direction="column"
            align="center"
            textAlign="center"
            maxW="700px"
            zIndex={10}
            gap={6}
            px={4}
        >
            <NotFoundIcon reducedMotion={reducedMotion} />

            <NotFoundTitle reducedMotion={reducedMotion} />

            <MotionHeading
                fontSize={{base: "2xl", md: "3xl"}}
                fontWeight="bold"
                color="whiteAlpha.900"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.6}}
            >
                Ой! Эта страница улетела на орбиту
            </MotionHeading>

            <MotionText
                fontSize={{base: "md", md: "lg"}}
                color="gray.300"
                maxW="500px"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.7}}
            >
                Но не переживайте — мы вернём вас на Землю за один клик.
            </MotionText>

            <MotionButton
                as={Link}
                // @ts-expect-error - chakra v3 + next/link typing issue
                href="/"
                variant="solid"
                mt={4}
                size="lg"
                bgGradient="linear(to-r, gray.400, gray.600)"
                color="white"
                fontWeight="bold"
                borderRadius="full"
                px={8}
                py={7}
                boxShadow="0 10px 30px rgba(56, 178, 172, 0.3)"
                _hover={{
                    bgGradient: "linear(to-r, gray.500, gray.700)",
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 35px rgba(56, 178, 172, 0.4)",
                }}
                _active={{
                    transform: "translateY(-1px)",
                }}
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                transition={{delay: 0.8, type: "spring" as const, stiffness: 200}}
                whileTap={{scale: 0.95}}
            >
                <FiHome style={{marginRight: "8px"}} />
                Вернуться домой
            </MotionButton>

            <NotFoundQuickLinks />

            <MotionText
                fontSize="sm"
                color="gray.500"
                mt={8}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 1.2}}
            >
                P.S. Даже пицца иногда теряется в доставке
            </MotionText>
        </Flex>
    );
};
