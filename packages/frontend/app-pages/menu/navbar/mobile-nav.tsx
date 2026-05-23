'use client';

import {useRef} from "react";
import {Box, Flex, HStack} from "@chakra-ui/react";
import {FiChevronRight} from "react-icons/fi";
import type {NavbarItem} from "./types";

type MobileNavProps = {
    items: NavbarItem[];
    activeId: string | null;
    openIds: string[];
    setOpenIds: React.Dispatch<React.SetStateAction<string[]>>;
    onItemClick: (id: string) => void;
};

const hiddenScrollbar = {
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": {display: "none"},
    transform: "translateZ(0)",
    WebkitTransform: "translate3d(0,0,0)",
    backfaceVisibility: "hidden" as const,
    overscrollBehavior: "none" as const,
};

function GroupButton({
    item,
    isActive,
    isOpen,
    onClick,
}: {
    item: NavbarItem;
    isActive: boolean;
    isOpen: boolean;
    onClick: () => void;
}) {
    const hasChildren = !!item.children?.length;
    return (
        <Box
            as="button"
            flexShrink={0}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            px={4}
            py={2}
            borderRadius="full"
            borderWidth="1.5px"
            borderColor={isActive || isOpen ? "gray.400" : "whiteAlpha.300"}
            bg={isActive || isOpen ? "linear-gradient(135deg, gray.500 0%, gray.600 100%)" : "whiteAlpha.100"}
            color={isActive || isOpen ? "white" : "whiteAlpha.800"}
            fontWeight="semibold"
            fontSize="sm"
            cursor="pointer"
            _hover={{
                borderColor: "gray.400",
                bg: isActive || isOpen
                    ? "linear-gradient(135deg, gray.400 0%, gray.500 100%)"
                    : "whiteAlpha.200",
            }}
            onClick={onClick}
        >
            {item.name}
            {hasChildren && (
                <Box
                    as={FiChevronRight}
                    boxSize={3.5}
                    transition="transform 0.2s ease"
                    transform={isOpen ? "rotate(90deg)" : "rotate(0deg)"}
                />
            )}
        </Box>
    );
}

function ChildButton({
    child,
    isActive,
    onClick,
}: {
    child: NavbarItem;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <Box
            as="button"
            flexShrink={0}
            display="inline-flex"
            alignItems="center"
            px={3}
            py={1.5}
            borderRadius="full"
            borderWidth="1px"
            borderColor={isActive ? "gray.300" : "whiteAlpha.200"}
            bg={isActive ? "gray.500/90" : "whiteAlpha.50"}
            color={isActive ? "white" : "whiteAlpha.700"}
            fontSize="xs"
            fontWeight="medium"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{borderColor: "gray.300", bg: "gray.500/80", color: "white"}}
            onClick={onClick}
        >
            {child.name}
        </Box>
    );
}

export function MobileNav({items, activeId, openIds, setOpenIds, onItemClick}: MobileNavProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <Box display={{base: "flex", md: "none"}} flexDirection="column">
            <Box ref={scrollContainerRef} overflowX="auto" css={hiddenScrollbar} pl="20px">
                <Flex gap={2} pb={1} flexWrap="nowrap">
                    {items.map((item) => {
                        const hasChildren = !!item.children?.length;
                        const isGroupActive = activeId === item.id || (item.children?.some(c => c.id === activeId) ?? false);
                        const isOpen = openIds.includes(item.id);

                        return (
                            <HStack key={item.id} gap={1.5} flexShrink={0} align="center">
                                <GroupButton
                                    item={item}
                                    isActive={isGroupActive}
                                    isOpen={isOpen}
                                    onClick={() => {
                                        if (hasChildren) {
                                            setOpenIds(prev => {
                                                const isOpening = !prev.includes(item.id);
                                                if (isOpening && scrollContainerRef.current) {
                                                    setTimeout(() => scrollContainerRef.current?.scrollBy({left: 100, behavior: "smooth"}));
                                                }
                                                return isOpening ? [...prev, item.id] : prev.filter(id => id !== item.id);
                                            });
                                        } else {
                                            onItemClick(item.id);
                                            setOpenIds([]);
                                        }
                                    }}
                                />

                                {hasChildren && isOpen && item.children!.map(child => (
                                    <ChildButton
                                        key={child.id}
                                        child={child}
                                        isActive={activeId === child.id}
                                        onClick={() => {
                                            onItemClick(child.id);
                                            setOpenIds([]);
                                        }}
                                    />
                                ))}
                            </HStack>
                        );
                    })}
                    <Box flexShrink={0} w="1px"/>
                </Flex>
            </Box>
        </Box>
    );
}
