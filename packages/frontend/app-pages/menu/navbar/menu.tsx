'use client';

import type {NavbarItem} from "./types";
import {Box} from "@chakra-ui/react";
import {useEffect, useState, useCallback} from "react";

function MenuItem({item, isMobile, onClick}: { item: NavbarItem; isMobile: boolean; onClick: () => void }) {
    return (
        <Box
            as="button"
            w="full"
            textAlign="left"
            px={4}
            py={2.5}
            borderRadius="lg"
            color="whiteAlpha.800"
            fontSize={isMobile ? "md" : "sm"}
            fontWeight="medium"
            cursor="pointer"
            transition="all 0.15s"
            _hover={{bg: "whiteAlpha.100", color: "white"}}
            _active={{bg: "whiteAlpha.200"}}
            onClick={onClick}
        >
            {item.name}
        </Box>
    );
}

function Arrow() {
    return (
        <Box
            position="absolute"
            top="-8px"
            left="50%"
            transform="translateX(-50%)"
            w={0}
            h={0}
            borderLeft="8px solid transparent"
            borderRight="8px solid transparent"
            borderBottom="8px solid rgba(26,32,44,0.85)"
            filter="drop-shadow(0 -2px 4px rgba(0,0,0,0.3))"
        />
    );
}

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
        <Box
            ref={menuRef}
            style={style}
            width={isMobile ? "90vw" : undefined}
            maxW={isMobile ? "90vw" : "240px"}
            minW={isMobile ? "90vw" : "180px"}
            zIndex={1000}
            animation="fadeIn 0.15s ease-out"
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
        </Box>
    );
};
