'use client';

import {memo} from "react";
import {Box} from "@chakra-ui/react";
import {NavbarItem} from "./types";
import {NavItem} from "./nav-item";

type DesktopNavProps = {
    items: NavbarItem[];
    activeId: string | null;
    onItemClick: (id: string) => void;
};

export const DesktopNav = memo(function DesktopNav({
    items,
    activeId,
    onItemClick,
}: DesktopNavProps) {
    return (
        <Box
            display={{base: "none", md: "flex"}}
            justifyContent="center"
            flexWrap="nowrap"
            overflowX="auto"
            gap={4}
            px="20px"
            maxWidth="100%"
            mx="auto"
            css={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.2) transparent",
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "2px"
                },
            }}
        >
            {items.map((item) => (
                <NavItem
                    key={item.id}
                    id={item.id}
                    title={item.name}
                    isActive={
                        activeId === item.id ||
                        item.children?.some((c) => c.id === activeId) ||
                        false
                    }
                    onClick={onItemClick}
                    childrenItems={item.children}
                    activeId={activeId}
                />
            ))}
        </Box>
    );
});
