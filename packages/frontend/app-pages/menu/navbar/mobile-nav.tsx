'use client';

import {useRef, memo} from "react";
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

    return (
        <Box display={{base: "flex", md: "none"}} flexDirection="column" px={isFixed ? 4 : 0}>
            <Box ref={scrollContainerRef} overflowX="auto" overflowY="hidden" css={hiddenScrollbar}>
                <Flex gap={2} pb={1} flexWrap="nowrap">
                    {items.map((item) => {
                        const hasChildren = !!item.children?.length;
                        const isGroupActive = activeId === item.id || item.children?.some((child) => child.id === activeId);
                        const isOpen = openIds.includes(item.id);

                        return (
                            <HStack key={item.id} data-nav-id={item.id} gap={1.5} flexShrink={0} align="start" alignItems="center">
                                <Box as="button" flexShrink={0} display="inline-flex" alignItems="center" gap={1.5} px={4} py={2} borderRadius="full" borderWidth="1.5px" borderColor={isGroupActive || isOpen ? "teal.400" : "whiteAlpha.300"} bg={isGroupActive || isOpen ? "linear-gradient(135deg, teal.500 0%, teal.600 100%)" : "whiteAlpha.100"} color={isGroupActive || isOpen ? "white" : "whiteAlpha.800"} fontWeight="semibold" fontSize="sm" cursor="pointer" transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" _hover={{borderColor: "teal.400", bg: isGroupActive || isOpen ? "linear-gradient(135deg, teal.400 0%, teal.500 100%)" : "whiteAlpha.200", transform: "translateY(-1px)"}} _active={{transform: "translateY(0)"}}                                 onClick={() => {
                                    if (hasChildren) {
                                        setOpenIds((prev) => {
                                            const isOpening = !prev.includes(item.id);
                                            const newOpenIds = isOpening ? [...prev, item.id] : prev.filter((id) => id !== item.id);
                                            if (isOpening && scrollContainerRef.current) {
                                                setTimeout(() => {
                                                    scrollContainerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
                                                }, 50);
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
