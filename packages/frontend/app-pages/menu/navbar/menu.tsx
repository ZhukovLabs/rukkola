'use client';

import {NavbarItem} from "./types";
import {Box} from "@chakra-ui/react";
import {useEffect, useState, useCallback, useRef} from "react";
import {MenuItem} from "./menu-item";
import {Arrow} from "./arrow";
import {MotionBox} from "@/lib/motion-box";

type MenuProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    menuRef: React.RefObject<HTMLDivElement | null>;
    isMobile: boolean;
    items: NavbarItem[];
    onItemClick: (id: string) => void;
};

export const Menu = ({triggerRef, menuRef, isMobile, items, onItemClick}: MenuProps) => {
    const [style, setStyle] = useState<React.CSSProperties>({});

    const computePosition = useCallback((): React.CSSProperties => {
        const trigger = triggerRef.current;
        if (!trigger) return {};
        const rect = trigger.getBoundingClientRect();

        if (isMobile) {
            return {
                position: "fixed" as const,
                top: rect.bottom + 8,
                left: window.innerWidth / 2,
                transform: "translateX(-50%)",
            };
        }
        return {
            position: "fixed" as const,
            top: rect.bottom + 8,
            left: rect.left,
        };
    }, [triggerRef, isMobile]);

    useEffect(() => {
        setStyle(computePosition());

        const update = () => setStyle(computePosition());
        window.addEventListener("scroll", update, {passive: true});
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [computePosition]);

    return (
        <MotionBox
            ref={menuRef}
            style={style}
            width={isMobile ? "90vw" : undefined}
            maxW={isMobile ? "90vw" : "240px"}
            minW={isMobile ? "90vw" : "180px"}
            zIndex={1000}
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.15, ease: "easeOut"}}
        >
            <Box
                bgGradient="linear(to-r, rgba(26, 32, 44, 0.85), rgba(26, 32, 44, 0.75))"
                backdropFilter="blur(14px)"
                boxShadow="0 8px 30px rgba(0,0,0,0.35)"
                borderRadius="lg"
                border="1px solid rgba(255,255,255,0.05)"
                maxH={isMobile ? "50vh" : undefined}
                overflowY={isMobile ? "auto" : "hidden"}
                css={isMobile ? {
                    WebkitOverflowScrolling: "touch",
                    "&::-webkit-scrollbar": {width: "4px"},
                    "&::-webkit-scrollbar-thumb": {background: "rgba(255,255,255,0.2)", borderRadius: "2px"},
                } : undefined}
            >
                <Box p={isMobile ? 3 : 2} display="flex" flexDir="column" gap={isMobile ? 2 : 1}>
                    {items.map((item) => (
                        <MenuItem key={item.id} item={item} isMobile={isMobile} onClick={() => onItemClick(item.id)}/>
                    ))}
                </Box>
                {!isMobile && <Arrow/>}
            </Box>
        </MotionBox>
    );
};
