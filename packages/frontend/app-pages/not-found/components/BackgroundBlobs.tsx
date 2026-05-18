import {MotionBox} from "./motion";

type BackgroundBlobsProps = {
    reducedMotion: boolean;
};

export const BackgroundBlobs = ({reducedMotion}: BackgroundBlobsProps) => {
    const getBlobAnimation = (delay = 0) => reducedMotion
        ? {
            initial: {opacity: 0},
            animate: {opacity: 0.12},
            transition: {duration: 0}
        }
        : {
            initial: {scale: 0.8, opacity: 0},
            animate: {scale: [1, 1.1, 1], opacity: 1},
            transition: {
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut" as const,
                delay
            },
        };

    return (
        <>
            <MotionBox
                position="absolute"
                top="-30%"
                left="-30%"
                w={{base: "350px", md: "700px"}}
                h={{base: "350px", md: "700px"}}
                bgGradient="radial(circle, gray.500 0%, transparent 60%)"
                opacity={0.12}
                borderRadius="full"
                filter="blur(50px)"
                willChange="transform"
                {...getBlobAnimation()}
            />
            <MotionBox
                position="absolute"
                bottom="-40%"
                right="-35%"
                w={{base: "400px", md: "900px"}}
                h={{base: "400px", md: "900px"}}
                bgGradient="radial(circle, purple.600 0%, transparent 70%)"
                opacity={0.1}
                borderRadius="full"
                filter="blur(60px)"
                willChange="transform"
                {...getBlobAnimation(4)}
            />
        </>
    );
};
