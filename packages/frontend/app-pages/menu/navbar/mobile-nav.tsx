'use client';

import {useRef, useCallback, useEffect, memo} from "react";
import {
    Box,
    Flex,
    HStack,
} from "@chakra-ui/react";
import {FiChevronRight} from "react-icons/fi";
import {NavbarItem} from "./types";

type MobileNavProps = {
    items: NavbarItem[];
    activeId: string | null;
    openIds: string[];
    setOpenIds: React.Dispatch<React.SetStateAction<string[]>>;
    isFixed: boolean;
    onItemClick: (id: string) => void;
};

export const MobileNav = memo(function MobileNav({
    items,
    activeId,
    openIds,
    setOpenIds,
    isFixed,
    onItemClick,
}: MobileNavProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToElement = useCallback((elementId: string) => {
        if (!scrollContainerRef.current) return;
        const element = scrollContainerRef.current.querySelector(`[data-nav-id="${elementId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
    }, []);

    useEffect(() => {
        if (activeId) {
            const parentItem = items.find(item => item.children?.some(c => c.id === activeId));
            if (parentItem && !openIds.includes(parentItem.id)) {
                setOpenIds(prev => [...prev, parentItem.id]);
            }
            setTimeout(() => scrollToElement(activeId), 100);
        }
    }, [activeId, items, openIds, scrollToElement, setOpenIds]);

    return (
        <Box display={{base: "flex", md: "none"}} flexDirection="column" px={isFixed ? 0 : 4}>
            <Box ref={scrollContainerRef} overflowX="auto" overflowY="hidden" css={hiddenScrollbar}>
                <Flex gap={2} pb={1} flexWrap="nowrap">
                    {items.map((item) => {
                        const hasChildren = !!item.children?.length;
                        const isGroupActive = activeId === item.id || item.children?.some((child) => child.id === activeId);
                        const isOpen = openIds.includes(item.id);

                        if (activeId === '6912991568567769d9cd9044') {
                            console.log('[MobileNav] Item:', item.id, 'isGroupActive:', isGroupActive, 'activeId:', activeId);
                        }

                        return (
                            <HStack key={item.id} data-nav-id={item.id} gap={1.5} flexShrink={0} align="start">
                                <Box as="button" flexShrink={0} display="inline-flex" alignItems="center" gap={1.5} px={4} py={2} borderRadius="full" borderWidth="1.5px" borderColor={isGroupActive || isOpen ? "teal.400" : "whiteAlpha.300"} bg={isGroupActive || isOpen ? "linear-gradient(135deg, teal.500 0%, teal.600 100%)" : "whiteAlpha.100"} color={isGroupActive || isOpen ? "white" : "whiteAlpha.800"} fontWeight="semibold" fontSize="sm" cursor="pointer" transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" _hover={{borderColor: "teal.400", bg: isGroupActive || isOpen ? "linear-gradient(135deg, teal.400 0%, teal.500 100%)" : "whiteAlpha.200", transform: "translateY(-1px)"}} _active={{transform: "translateY(0)"}} onClick={() => {
                                    if (hasChildren) {
                                        setOpenIds((prev) => {
                                            const newOpenIds = prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id];
                                            if (!prev.includes(item.id)) {
                                                setTimeout(() => scrollToElement(item.id), 50);
                                            }
                                            return newOpenIds;
                                        });
                                    } else {
                                        onItemClick(item.id);
                                        setOpenIds([]);
                                    }
                                }}>
                                    {item.name}
                                    {hasChildren && (
                                        <Box as={FiChevronRight} boxSize={3.5} transition="transform 0.2s ease" transform={isOpen ? "rotate(90deg)" : "rotate(0deg)"} />
                                    )}
                                </Box>

                                {hasChildren && isOpen && item.children!.map((child) => (
                                    <Box key={child.id} as="button" flexShrink={0} display="inline-flex" alignItems="center" px={3} py={1.5} borderRadius="full" borderWidth="1px" borderColor={activeId === child.id ? "teal.300" : "whiteAlpha.200"} bg={activeId === child.id ? "teal.500/90" : "whiteAlpha.50"} color={activeId === child.id ? "white" : "whiteAlpha.700"} fontSize="xs" fontWeight="medium" cursor="pointer" transition="all 0.15s ease" _hover={{borderColor: "teal.300", bg: "teal.500/80", color: "white"}} onClick={() => { onItemClick(child.id); setOpenIds([]); }}>
                                        {child.name}
                                    </Box>
                                ))}
                            </HStack>
                        );
                    })}
                </Flex>
            </Box>
        </Box>
    );
});

const hiddenScrollbar = {
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
};
