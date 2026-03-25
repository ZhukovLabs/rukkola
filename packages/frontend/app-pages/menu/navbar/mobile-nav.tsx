'use client';

import {useState, useRef, useCallback, memo} from "react";
import {
    Box,
    Flex,
    Text,
    IconButton,
    Drawer,
    Portal,
    CloseButton,
    HStack,
    VStack,
} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {FiMenu, FiChevronRight} from "react-icons/fi";
import {NavbarItem} from "./types";

const MotionBox = motion.create(Box);

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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToElement = useCallback((elementId: string) => {
        if (!scrollContainerRef.current) return;
        const element = scrollContainerRef.current.querySelector(`[data-nav-id="${elementId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
    }, []);

    const activeItem = items.find(item => 
        item.id === activeId || item.children?.some(c => c.id === activeId)
    );

    const handleItemClick = useCallback((item: NavbarItem) => {
        if (!item.children?.length) {
            setDrawerOpen(false);
            setTimeout(() => {
                onItemClick(item.id);
                setOpenIds([]);
            }, 50);
        } else {
            setOpenIds((prev) =>
                prev.includes(item.id)
                    ? prev.filter((id) => id !== item.id)
                    : [...prev, item.id]
            );
        }
    }, [onItemClick, setOpenIds]);

    const handleChildClick = useCallback((child: NavbarItem) => {
        setDrawerOpen(false);
        setTimeout(() => {
            onItemClick(child.id);
            setOpenIds([]);
        }, 50);
    }, [onItemClick, setOpenIds]);

    return (
        <Box display={{base: "flex", md: "none"}} flexDirection="column" px={isFixed ? 0 : 4}>
            {isFixed ? (
                <Flex justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box w={2} h={6} borderRadius="full" bgGradient="linear(to-b, teal.400, teal.600)" />
                        <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.900" textShadow="0 1px 4px rgba(0,0,0,0.3)">
                            {activeItem?.name ?? items[0]?.name}
                        </Text>
                    </Box>

                    <Drawer.Root placement="bottom" open={drawerOpen} onOpenChange={(e) => setDrawerOpen(e.open)} onExitComplete={() => setOpenIds([])}>
                        <Drawer.Trigger asChild>
                            <IconButton aria-label="Открыть меню" size="sm" variant="ghost" color="white">
                                <FiMenu />
                            </IconButton>
                        </Drawer.Trigger>

                        <Portal>
                            <Drawer.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                            <Drawer.Positioner>
                                <Drawer.Content bg="gray.800" borderTopRadius="lg" maxH="85vh" pb="env(safe-area-inset-bottom, 0px)">
                                    <Drawer.Header px={4} pt={4} pb={2}>
                                        <HStack justify="space-between">
                                            <Drawer.Title fontSize="sm" color="whitesmoke">Разделы</Drawer.Title>
                                            <Drawer.CloseTrigger asChild>
                                                <CloseButton size="sm" color="white" onClick={() => { setDrawerOpen(false); setOpenIds([]); }} />
                                            </Drawer.CloseTrigger>
                                        </HStack>
                                    </Drawer.Header>

                                    <Drawer.Body px={4} pb={4} overflowY="auto" css={scrollbarStyles}>
                                        <VStack align="stretch" gap={1}>
                                            {items.map((item) => {
                                                const hasChildren = !!item.children?.length;
                                                const isGroupActive = activeId === item.id || item.children?.some((child) => child.id === activeId);
                                                const isOpen = openIds.includes(item.id);

                                                return (
                                                    <Box key={item.id}>
                                                        <MotionBox px={3} py={2} borderRadius="md" bg={isGroupActive ? "teal.500" : "transparent"} color={isGroupActive ? "white" : "gray.200"} fontWeight="medium" cursor="pointer" whileHover={{scale: 1.02, backgroundColor: "teal.600"}} onClick={() => handleItemClick(item)}>
                                                            {item.name}
                                                        </MotionBox>

                                                        <AnimatePresence>
                                                            {hasChildren && isOpen && (
                                                                <Box overflowY="auto" maxH="200px" css={scrollbarStyles}>
                                                                    <VStack pl={4} mt={1} align="stretch" gap={1}>
                                                                        {item.children!.map((child) => (
                                                                            <MotionBox key={child.id} px={3} py={2} borderRadius="md" bg={activeId === child.id ? "teal.400" : "gray.700"} color={activeId === child.id ? "white" : "gray.200"} fontWeight="medium" cursor="pointer" whileHover={{scale: 1.02, backgroundColor: "teal.600"}} onClick={() => handleChildClick(child)}>
                                                                                {child.name}
                                                                            </MotionBox>
                                                                        ))}
                                                                    </VStack>
                                                                </Box>
                                                            )}
                                                        </AnimatePresence>
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    </Drawer.Body>
                                </Drawer.Content>
                            </Drawer.Positioner>
                        </Portal>
                    </Drawer.Root>
                </Flex>
            ) : (
                <Box ref={scrollContainerRef} overflowX="auto" overflowY="hidden" css={hiddenScrollbar}>
                    <Flex gap={2} pb={1} flexWrap="nowrap">
                        {items.map((item) => {
                            const hasChildren = !!item.children?.length;
                            const isGroupActive = activeId === item.id || item.children?.some((child) => child.id === activeId);
                            const isOpen = openIds.includes(item.id);

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
            )}
        </Box>
    );
});

const scrollbarStyles = {
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: "2px" },
};

const hiddenScrollbar = {
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
};
