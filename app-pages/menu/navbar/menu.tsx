import {NavbarItem} from "./types";
import {Box} from "@chakra-ui/react";
import {useEffect, useRef, useState} from "react";
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

export const Menu = ({
                         triggerRef,
                         menuRef,
                         isMobile,
                         items,
                         onItemClick,
                     }: MenuProps) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (!triggerRef.current) return;

        const updatePosition = () => {
            const rect = triggerRef.current!.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                left: isMobile ? window.innerWidth / 2 : rect.left,
            });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        };
    }, [triggerRef, isMobile]);

    if (!position) return null;

    return (
        <Box
            ref={menuRef}
            as={motion.div}
            position="fixed"
            top={`${position.top}px`}
            left={isMobile ? "50%" : `${position.left}px`}
            transform={isMobile ? "translateX(-50%)" : "none"}
            width={isMobile ? "90vw" : "auto"}
            maxW={isMobile ? "90vw" : "240px"}
            minW={isMobile ? "90vw" : "180px"}
            zIndex={99999}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <Box
                bgGradient="linear(to-r, rgba(26, 32, 44, 0.85), rgba(26, 32, 44, 0.75))"
                backdropFilter="blur(14px)"
                boxShadow="0 8px 30px rgba(0,0,0,0.35)"
                borderRadius="lg"
                border="1px solid rgba(255,255,255,0.05)"
                overflow="hidden"
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
        </Box>
    );
};