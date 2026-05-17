import {Icon} from "@chakra-ui/react";
import {FiAlertTriangle} from "react-icons/fi";
import {MotionBox} from "./motion";

type NotFoundIconProps = {
    reducedMotion: boolean;
};

export const NotFoundIcon = ({reducedMotion}: NotFoundIconProps) => {
    return (
        <MotionBox
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{type: "spring" as const, stiffness: 200, damping: 10}}
        >
            <MotionBox
                animate={reducedMotion ? {} : {
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                }}
            >
                <Icon
                    as={FiAlertTriangle}
                    boxSize={{base: 16, md: 20}}
                    color="yellow.400"
                    filter="drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))"
                />
            </MotionBox>
        </MotionBox>
    );
};
