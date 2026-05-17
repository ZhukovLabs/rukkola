import {MotionBox, MotionHeading} from "./motion";

type NotFoundTitleProps = {
    reducedMotion: boolean;
};

export const NotFoundTitle = ({reducedMotion}: NotFoundTitleProps) => {
    return (
        <MotionHeading
            fontSize={{base: "8xl", md: "9xl"}}
            fontWeight="black"
            letterSpacing="tight"
            color="white"
            initial={{y: -100, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{
                type: "spring" as const,
                stiffness: 120,
                damping: 15,
                delay: 0.2,
            }}
            textShadow="0 10px 30px rgba(0,0,0,0.4)"
        >
            4
            <MotionBox
                as="span"
                display="inline-block"
                mx={2}
                color="gray.400"
                animate={reducedMotion ? {} : {
                    y: [0, -15, 0],
                    rotate: [0, -10, 10, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                }}
                filter="drop-shadow(0 0 15px rgba(56, 178, 172, 0.6))"
            >
                0
            </MotionBox>
            4
        </MotionHeading>
    );
};
