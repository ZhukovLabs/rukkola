'use client';

import {NavbarItem} from "./types";
import {Box} from "@chakra-ui/react";
import {useEffect, useState, useCallback, useRef} from "react";
import {MenuItem} from "./menu-item";
import {Arrow} from "./arrow";
import {motion} from "framer-motion";

type MenuProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    menuRef: React.RefObject<HTMLDivElement | null>;
    isMobile: boolean;
    items: NavbarItem[];
    onItemClick: (id: string) => void;
};

const MotionBox = motion.create(Box);

function isPositionLocked(el: HTMLElement | null): boolean {
    let node = el;
    while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (style.position === "fixed") return true;
        if (style.position === "sticky") {
            const threshold = parseInt(style.top, 10) || 0;
            if (node.getBoundingClientRect().top <= threshold) return true;
        }
        node = node.parentElement;
    }
    return false;
}

export const Menu = ({
                         triggerRef,
                         menuRef,
                         isMobile,
                         items,
                         onItemClick,
                     }: MenuProps) => {
    const [ready, setReady] = useState(false);
    const fixedRef = useRef<boolean | null>(null);

    const computeStyle = useCallback((): React.CSSProperties => {
        const trigger = triggerRef.current;
        if (!trigger) return {};
        const fixed = isPositionLocked(trigger);
        fixedRef.current = fixed;
        const rect = trigger.getBoundingClientRect();

        if (fixed) {
            return {
                position: "fixed",
                top: rect.bottom + 8,
                left: isMobile ? window.innerWidth / 2 : rect.left,
                transform: isMobile ? "translateX(-50%)" : undefined,
            };
        }
        return {
            position: "absolute",
            top: rect.bottom + 8 + window.scrollY,
            left: isMobile ? window.innerWidth / 2 + window.scrollX : rect.left + window.scrollX,
            transform: isMobile ? "translateX(-50%)" : undefined,
        };
    }, [triggerRef, isMobile]);

    const [style, setStyle] = useState<React.CSSProperties>(() => computeStyle());

    useEffect(() => {
        setStyle(computeStyle());
        setReady(true);
    }, [computeStyle]);

    useEffect(() => {
        if (!ready) return;

        const check = () => {
            const trigger = triggerRef.current;
            if (!trigger) return;
            if (isPositionLocked(trigger) !== fixedRef.current) {
                setStyle(computeStyle());
            }
        };

        const onResize = () => setStyle(computeStyle());

        window.addEventListener("scroll", check, {passive: true});
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", check);
            window.removeEventListener("resize", onResize);
        };
    }, [ready, triggerRef, computeStyle]);

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
                    "&::-webkit-scrollbar": {
                        width: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "2px",
                    },
                } : undefined}
            >
                <Box p={isMobile ? 3 : 2} display="flex" flexDir="column" gap={isMobile ? 2 : 1}>
                    {items.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isMobile={isMobile}
                            onClick={() => onItemClick(item.id)}
                        />
                    ))}
                </Box>

                {!isMobile && <Arrow/>}
            </Box>
        </MotionBox>
    );
};
