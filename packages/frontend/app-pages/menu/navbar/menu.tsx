'use client';

import {NavbarItem} from "./types";
import {Box} from "@chakra-ui/react";
import {useEffect, useState, useRef} from "react";
import {MenuItem} from "./menu-item";
import {Arrow} from "./arrow";
import {motion} from "framer-motion";

type MenuProps = {
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    items: NavbarItem[];
    onItemClick: (id: string) => void;
    onClose: () => void;
};

const MotionBox = motion.create(Box);

export const Menu = ({
                         triggerRef,
                         items,
                         onItemClick,
                         onClose,
                     }: MenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!triggerRef.current) return;

        const updatePosition = () => {
            const rect = triggerRef.current!.getBoundingClientRect();
            const menuRect = menuRef.current?.getBoundingClientRect();
            
            let left = rect.left + rect.width / 2;
            const top = rect.bottom + 8;
            
            if (menuRect) {
                if (left - menuRect.width / 2 < 10) {
                    left = menuRect.width / 2 + 10;
                } else if (left + menuRect.width / 2 > window.innerWidth - 10) {
                    left = window.innerWidth - menuRect.width / 2 - 10;
                }
            }
            
            setPosition({top, left});
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, {passive: true});

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        };
    }, [triggerRef]);

    useEffect(() => {
        if (!position) return;

        const handleScroll = () => onClose();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, [position, onClose]);

    if (!position) return null;

    return (
        <MotionBox
            ref={menuRef}
            position="fixed"
            top={`${position.top}px`}
            left={`${position.left}px`}
            transform="translateX(-50%)"
            zIndex={99999}
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.15, ease: "easeOut"}}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <Box
                bgGradient="linear(to-r, rgba(26, 32, 44, 0.95), rgba(26, 32, 44, 0.9))"
                backdropFilter="blur(14px)"
                boxShadow="0 8px 30px rgba(0,0,0,0.35)"
                borderRadius="lg"
                border="1px solid rgba(255,255,255,0.08)"
                minW="160px"
            >
                <Box p={2} display="flex" flexDir="column" gap={1}>
                    {items.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isMobile={false}
                            onClick={() => onItemClick(item.id)}
                        />
                    ))}
                </Box>
                <Arrow/>
            </Box>
        </MotionBox>
    );
};