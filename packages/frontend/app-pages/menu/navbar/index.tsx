'use client';

import {useEffect, useRef, useState, useCallback, memo, useMemo, useLayoutEffect} from "react";
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
    Icon,
} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {FiMenu, FiChevronRight} from "react-icons/fi";
import {useSearchParams} from "next/navigation";

import {NavItem} from "./nav-item";
import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "../constants";
import {useIsLowPerformanceDevice} from "@/hooks/use-is-low-performance-device";

const MotionNav = motion.create(Box);
const MotionBox = motion.create(Box);

type NavbarProps = {
    items: NavbarItem[];
};

export const Navbar = memo(function Navbar({items}: NavbarProps) {
    const searchParams = useSearchParams();
    const navRef = useRef<HTMLDivElement>(null);
    const disableMotion = useIsLowPerformanceDevice();
    const initialTopRef = useRef<number | null>(null);
    
    const [isFixed, setIsFixed] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [navHeight, setNavHeight] = useState(60);
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile, { passive: true });
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLayoutEffect(() => {
        const measure = () => {
            if (navRef.current) {
                const height = navRef.current.offsetHeight || 60;
                if (height !== navHeight) {
                    setNavHeight(height);
                }
                const rect = navRef.current.getBoundingClientRect();
                const currentTop = rect.top + window.scrollY;
                if (initialTopRef.current === null || currentTop < initialTopRef.current) {
                    initialTopRef.current = currentTop;
                }
            }
        };
        measure();
        
        const rafId = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(rafId);
    }, [items, navHeight]);

    useEffect(() => {
        const handleResize = () => {
            initialTopRef.current = null;
            if (navRef.current) {
                const rect = navRef.current.getBoundingClientRect();
                initialTopRef.current = rect.top + window.scrollY;
            }
        };
        
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        const section = document.getElementById(id);
        if (!section) return;
        const currentHeight = navRef.current?.offsetHeight || navHeight || 60;
        const y = section.getBoundingClientRect().top + window.scrollY - currentHeight;
        window.scrollTo({top: y, behavior: "smooth"});
    }, [navHeight]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToElement = useCallback((elementId: string) => {
        if (!scrollContainerRef.current) return;
        const element = scrollContainerRef.current.querySelector(`[data-nav-id="${elementId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        }
    }, []);

    useEffect(() => {
        if (!allSectionIds.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                        break;
                    }
                }
            },
            {rootMargin: `-${navHeight + 16}px 0px -60% 0px`}
        );

        for (const id of allSectionIds) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }

        return () => observer.disconnect();
    }, [allSectionIds, navHeight]);

    useEffect(() => {
        if (!items.length) return;
        
        let ticking = false;
        
        const handleScroll = () => {
            if (drawerOpen) return;
            if (initialTopRef.current === null) return;
            
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    const shouldBeFixed = window.scrollY > initialTopRef.current!;
                    setIsFixed(shouldBeFixed);
                    ticking = false;
                });
            }
        };

        requestAnimationFrame(handleScroll);
        
        window.addEventListener("scroll", handleScroll, {passive: true});
        window.addEventListener("resize", handleScroll, {passive: true});
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [items, drawerOpen]);

    if (searchParams.has(CART_QUERY_KEY)) return null;

    const motionTransition = disableMotion ? undefined : {duration: 0.25, ease: "easeOut" as const};
    const motionInitial = disableMotion ? undefined : {opacity: 0, y: -10};
    const motionAnimate = disableMotion ? undefined : {opacity: 1, y: 0};
    
    const mobileAnimTransition = disableMotion ? undefined : {duration: 0.2, ease: "easeOut" as const};
    const mobileFixedInitial = disableMotion ? undefined : {opacity: 0};
    const mobileFixedAnimate = disableMotion ? undefined : {opacity: 1};

    return (
        <Box position="relative" zIndex="10">
            {isFixed && <Box height={isMobile ? 'calc(53px + var(--sat, 0px))' : `${navHeight}px`} transition="height 0.2s ease"/>}

            <MotionNav
                ref={navRef}
                position={isFixed ? "fixed" : "relative"}
                top={0}
                pt={isFixed && isMobile ? "var(--sat)" : 0}
                insetX={0}
                zIndex={100}
                bgGradient="linear(to-r, rgba(26,32,44,0.9), rgba(26,32,44,0.8))"
                backdropFilter="blur(10px)"
                borderBottom={isFixed ? "1px solid rgba(255,255,255,0.06)" : "none"}
                py={{base: 2, md: 4}}
                initial={motionInitial}
                animate={motionAnimate}
                transition={motionTransition}
                style={{
                    transition: "backdrop-filter 0.3s ease, border-bottom 0.3s ease"
                }}
            >
                <Box display={{base: "flex", md: "none"}} flexDirection="column" gap={isFixed ? 0 : 2} px={isFixed ? 0 : 4}>
                    {isFixed ? (
                        <MotionBox
                            key="fixed-mobile"
                            initial={mobileFixedInitial}
                            animate={mobileFixedAnimate}
                            transition={mobileAnimTransition}
                        >
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
                                    onExitComplete={() => setOpenIds([])}
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
                                                                onClick={() => {
                                                                    setDrawerOpen(false);
                                                                    setOpenIds([]);
                                                                }}
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

                                                                const whileHover = !disableMotion ? {
                                                                    scale: 1.02,
                                                                    backgroundColor: "teal.600"
                                                                } : undefined;

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
                                                                            whileHover={whileHover}
                                                                            onClick={() => {
                                                                                if (!hasChildren) {
                                                                                    setDrawerOpen(false);
                                                                                    setTimeout(() => {
                                                                                        handleClick(item.id);
                                                                                        setOpenIds([]);
                                                                                    }, 50);
                                                                                } else {
                                                                                    setOpenIds((prev) =>
                                                                                        prev.includes(item.id)
                                                                                            ? prev.filter((id) => id !== item.id)
                                                                                            : [...prev, item.id]
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            {item.name}
                                                                        </MotionBox>

                                                                        <AnimatePresence>
                                                                            {hasChildren && openIds.includes(item.id) && (
                                                                                <Box
                                                                                    overflowY="auto"
                                                                                    maxH="200px"
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
                                                                                    <VStack pl={4} mt={1} align="stretch" gap={1}>
                                                                                        {item.children!.map((child) => (
                                                                                            <MotionBox
                                                                                                key={child.id}
                                                                                                px={3}
                                                                                                py={2}
                                                                                                borderRadius="md"
                                                                                                bg={activeId === child.id ? "teal.400" : "gray.700"}
                                                                                                color={activeId === child.id ? "white" : "gray.200"}
                                                                                                fontWeight="medium"
                                                                                                cursor="pointer"
                                                                                                whileHover={whileHover}
                                                                                                onClick={() => {
                                                                                                    setDrawerOpen(false);
                                                                                                    setTimeout(() => {
                                                                                                        handleClick(child.id);
                                                                                                        setOpenIds([]);
                                                                                                    }, 50);
                                                                                                }}
                                                                                            >
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
                        </MotionBox>
                    ) : (
                        <Box
                            ref={scrollContainerRef}
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
                                    const isOpen = openIds.includes(item.id);

                                    return (
                                        <HStack key={item.id} gap={1.5} flexShrink={0} data-nav-id={item.id}>
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
                                                        setOpenIds([]);
                                                    } else {
                                                        setOpenIds((prev) => {
                                                            const newOpenIds = prev.includes(item.id)
                                                                ? prev.filter((id) => id !== item.id)
                                                                : [...prev, item.id];
                                                            if (!prev.includes(item.id)) {
                                                                setTimeout(() => scrollToElement(item.id), 50);
                                                            }
                                                            return newOpenIds;
                                                        });
                                                    }
                                                }}
                                            >
                                                {item.name}
                                                {hasChildren && (
                                                    <Icon
                                                        as={FiChevronRight}
                                                        boxSize={3.5}
                                                        transition="transform 0.2s ease"
                                                        transform={isOpen ? "rotate(90deg)" : "rotate(0deg)"}
                                                    />
                                                )}
                                            </Box>

                                            {hasChildren && isOpen && item.children!.map((child) => (
                                                <Box
                                                    key={child.id}
                                                    flexShrink={0}
                                                    display="inline-flex"
                                                    alignItems="center"
                                                    px={3}
                                                    py={1.5}
                                                    borderRadius="full"
                                                    borderWidth="1px"
                                                    borderColor={activeId === child.id ? "teal.300" : "whiteAlpha.200"}
                                                    bg={activeId === child.id ? "teal.500/90" : "whiteAlpha.50"}
                                                    color={activeId === child.id ? "white" : "whiteAlpha.700"}
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    cursor="pointer"
                                                    transition="all 0.15s ease"
                                                    _hover={{
                                                        borderColor: "teal.300",
                                                        bg: "teal.500/80",
                                                        color: "white",
                                                    }}
                                                    onClick={() => {
                                                        handleClick(child.id);
                                                        setOpenIds([]);
                                                    }}
                                                >
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

                <Box
                    display={{base: "none", md: "flex"}}
                    justifyContent="center"
                    flexWrap={isFixed ? "nowrap" : "wrap"}
                    overflowX={isFixed ? "auto" : "visible"}
                    gap={isFixed ? 0 : 4}
                    px={isFixed ? 0 : 4}
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