'use client';

import {useEffect, useRef, useState, useCallback, memo, useMemo} from "react";
import {
    Box,
    HStack,
    VStack,
    Text,
    IconButton,
    Drawer,
    Portal,
    CloseButton,
    Flex,
} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {FiMenu} from "react-icons/fi";
import {useSearchParams} from "next/navigation";

import {NavItem} from "./nav-item";
import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "../constants";

const MotionNav = motion.create(Box);

type NavbarProps = {
    items: NavbarItem[];
};

const NAV_HEIGHT = 60;

export const Navbar = memo(function Navbar({items}: NavbarProps) {
    const searchParams = useSearchParams();
    const navRef = useRef<HTMLDivElement>(null);
    
    const [isFixed, setIsFixed] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [navHeight, setNavHeight] = useState(NAV_HEIGHT);
    const initialTopRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        
        const handleResize = () => {
            checkMobile();
            initialTopRef.current = null;
            if (navRef.current) {
                const rect = navRef.current.getBoundingClientRect();
                initialTopRef.current = rect.top + window.scrollY;
            }
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!navRef.current) return;
        
        const rect = navRef.current.getBoundingClientRect();
        initialTopRef.current = rect.top + window.scrollY;
        
        const updateHeight = () => {
            if (navRef.current) {
                setNavHeight(navRef.current.offsetHeight);
            }
        };
        
        updateHeight();
        
        const timeout = setTimeout(updateHeight, 100);
        return () => clearTimeout(timeout);
    }, [items]);

    const allSectionIds = useMemo(() => {
        const ids: string[] = [];
        const collect = (navItems: NavbarItem[]) => {
            for (const item of navItems) {
                ids.push(item.id);
                if (item.children) collect(item.children);
            }
        };
        collect(items);
        return ids;
    }, [items]);

    const activeItem = useMemo(() => 
        items.find(item => 
            item.id === activeId || item.children?.some(c => c.id === activeId)
        ),
        [items, activeId]
    );

    const handleClick = useCallback((id: string) => {
        const section = document.getElementById(`section-${id}`);
        if (!section) return;
        const currentHeight = navHeight;
        const y = section.getBoundingClientRect().top + window.scrollY - currentHeight;
        window.scrollTo({top: y, behavior: "smooth"});
    }, [navHeight]);

    useEffect(() => {
        if (!allSectionIds.length) return;

        let ticking = false;

        const updateActiveSection = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const navHeightValue = navRef.current?.offsetHeight || 60;
                const triggerY = navHeightValue;

                let activeSectionId: string | null = null;
                let minDistance = Infinity;

                for (const id of allSectionIds) {
                    const el = document.getElementById(`section-${id}`);
                    if (!el) continue;

                    const rect = el.getBoundingClientRect();
                    const distance = Math.abs(rect.top - triggerY);

                    if (rect.top <= triggerY && distance < minDistance) {
                        minDistance = distance;
                        activeSectionId = id;
                    }
                }

                if (activeSectionId) {
                    setActiveId(activeSectionId);
                }

                ticking = false;
            });
        };

        window.addEventListener("scroll", updateActiveSection, {passive: true});
        updateActiveSection();

        return () => window.removeEventListener("scroll", updateActiveSection);
    }, [allSectionIds]);

    useEffect(() => {
        if (!items.length || drawerOpen || initialTopRef.current === null) return;
        
        let ticking = false;
        
        const handleScroll = () => {
            if (ticking) return;
            
            ticking = true;
            requestAnimationFrame(() => {
                setIsFixed(window.scrollY > initialTopRef.current!);
                ticking = false;
            });
        };

        window.addEventListener("scroll", handleScroll, {passive: true});
        handleScroll();
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items, drawerOpen]);

    if (searchParams.has(CART_QUERY_KEY)) return null;

    return (
        <Box position="relative" zIndex="10">
            {isFixed && <Box height={isMobile ? '53px' : `${navHeight}px`} transition="height 0.2s ease"/>}

            <MotionNav
                ref={navRef}
                position={isFixed ? "fixed" : "relative"}
                top={0}
                pt={isFixed && isMobile ? "env(safe-area-inset-top, 0px)" : 0}
                insetX={0}
                zIndex={100}
                bgGradient="linear(to-r, rgba(26,32,44,0.9), rgba(26,32,44,0.8))"
                backdropFilter="blur(10px)"
                borderBottom={isFixed ? "1px solid rgba(255,255,255,0.06)" : "none"}
                py={{base: 2, md: 4}}
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.25, ease: "easeOut"}}
            >
                <Box display={{base: "flex", md: "none"}} flexDirection="column" px={4}>
                    {isFixed ? (
                        <Flex justifyContent="space-between" alignItems="center">
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Box
                                    w={2}
                                    h={6}
                                    borderRadius="full"
                                    bgGradient="linear(to-b, teal.400, teal.600)"
                                />

                                <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="whiteAlpha.900"
                                    textShadow="0 1px 4px rgba(0,0,0,0.3)"
                                >
                                    {activeItem?.name ?? items[0]?.name}
                                </Text>
                            </Box>

                            <Drawer.Root 
                            placement="bottom" 
                            open={drawerOpen}
                            onOpenChange={(e) => setDrawerOpen(e.open)}
                        >
                            <Drawer.Trigger asChild>
                                <IconButton
                                    aria-label="Открыть меню"
                                    size="sm"
                                    variant="ghost"
                                    color="white"
                                >
                                    <FiMenu/>
                                </IconButton>
                            </Drawer.Trigger>

                            <Portal>
                                <Drawer.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)"/>
                                <Drawer.Positioner>
                                    <Drawer.Content 
                                        bg="gray.800" 
                                        borderTopRadius="lg"
                                        maxH="85vh"
                                    >
                                        <Drawer.Header px={4} pt={4} pb={2}>
                                            <HStack justify="space-between">
                                                <Drawer.Title fontSize="sm" color="whitesmoke">Разделы</Drawer.Title>
                                                <Drawer.CloseTrigger asChild>
                                                    <CloseButton
                                                        size="sm"
                                                        color="white"
                                                        onClick={() => setDrawerOpen(false)}
                                                    />
                                                </Drawer.CloseTrigger>
                                            </HStack>
                                        </Drawer.Header>

                                        <Drawer.Body
                                            px={4}
                                            pb={4}
                                            overflowY="auto"
                                            css={{
                                                WebkitOverflowScrolling: "touch",
                                                "&::-webkit-scrollbar": {
                                                    width: "4px",
                                                },
                                                "&::-webkit-scrollbar-thumb": {
                                                    background: "rgba(255,255,255,0.2)",
                                                    borderRadius: "2px",
                                                },
                                            }}
                                        >
                                            <VStack align="stretch" gap={1}>
                                                {items.map((item) => {
                                                    const hasChildren = !!item.children?.length;
                                                    const isGroupActive =
                                                        activeId === item.id ||
                                                        item.children?.some((child) => child.id === activeId);

                                                    return (
                                                        <Box key={item.id}>
                                                            <MotionBox
                                                                px={3}
                                                                py={2}
                                                                borderRadius="md"
                                                                bg={isGroupActive ? "teal.500" : "transparent"}
                                                                color={isGroupActive ? "white" : "gray.200"}
                                                                fontWeight="medium"
                                                                cursor="pointer"
                                                                whileHover={{scale: 1.02, backgroundColor: "teal.600"}}
                                                                onClick={() => {
                                                                    if (!hasChildren) {
                                                                        setDrawerOpen(false);
                                                                        setTimeout(() => handleClick(item.id), 50);
                                                                    } else {
                                                                        setDrawerOpen(false);
                                                                    }
                                                                }}
                                                            >
                                                                {item.name}
                                                            </MotionBox>
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
                        <Box
                            overflowX="auto"
                            overflowY="hidden"
                            css={{
                                WebkitOverflowScrolling: "touch",
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": { display: "none" },
                            }}
                        >
                            <Flex gap={2} pb={1} flexWrap="nowrap">
                                {items.map((item) => {
                                    const hasChildren = !!item.children?.length;
                                    const isGroupActive =
                                        activeId === item.id ||
                                        item.children?.some((child) => child.id === activeId);

                                    return (
                                        <HStack key={item.id} gap={1.5} flexShrink={0}>
                                            <Box
                                                flexShrink={0}
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={1.5}
                                                px={4}
                                                py={2}
                                                borderRadius="full"
                                                borderWidth="1.5px"
                                                borderColor={isGroupActive ? "teal.400" : "whiteAlpha.300"}
                                                bg={isGroupActive ? "linear-gradient(135deg, teal.500 0%, teal.600 100%)" : "whiteAlpha.100"}
                                                color={isGroupActive ? "white" : "whiteAlpha.800"}
                                                fontWeight="semibold"
                                                fontSize="sm"
                                                cursor="pointer"
                                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                                _hover={{
                                                    borderColor: "teal.400",
                                                    bg: isGroupActive ? "linear-gradient(135deg, teal.400 0%, teal.500 100%)" : "whiteAlpha.200",
                                                    transform: "translateY(-1px)",
                                                }}
                                                _active={{ transform: "translateY(0)" }}
                                                onClick={() => {
                                                    if (!hasChildren) {
                                                        handleClick(item.id);
                                                    }
                                                }}
                                            >
                                                {item.name}
                                            </Box>
                                        </HStack>
                                    );
                                })}
                            </Flex>
                        </Box>
                    )}
                </Box>

                <Box
                    display={{base: "none", md: "flex"}}
                    justifyContent="center"
                    flexWrap={isFixed ? "nowrap" : "wrap"}
                    overflowX={isFixed ? "auto" : "visible"}
                    gap={4}
                    px={4}
                    maxWidth="100%"
                    mx="auto"
                    css={isFixed ? {
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.2) transparent",
                        "&::-webkit-scrollbar": { height: "4px" },
                        "&::-webkit-scrollbar-thumb": {
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "2px"
                        },
                    } : {}}
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
                            onClick={handleClick}
                            childrenItems={item.children}
                            activeId={activeId}
                        />
                    ))}
                </Box>
            </MotionNav>
        </Box>
    );
});

const MotionBox = motion.create(Box);