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
} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {FiMenu} from "react-icons/fi";
import {useSearchParams} from "next/navigation";

import {NavItem} from "./nav-item";
import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "@/app-pages/menu/config";
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
    
    const [isFixed, setIsFixed] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [navHeight, setNavHeight] = useState(60);
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
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
            }
        };
        measure();
    }, [items, navHeight]);

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
        
        const threshold = document.getElementById(items[0].id)?.offsetTop ?? 0;
        
        const handleScroll = () => {
            setIsFixed(window.scrollY > threshold - navHeight - 8);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items, navHeight]);

    const handleSetOpenIds = useCallback((ids: string[]) => {
        setOpenIds(ids);
    }, []);

    if (searchParams.has(CART_QUERY_KEY)) return null;

    const motionTransition = disableMotion ? undefined : {duration: 0.3};
    const motionInitial = disableMotion ? undefined : {opacity: 0, y: -12};
    const motionAnimate = disableMotion ? undefined : {opacity: 1, y: 0};

    return (
        <Box position="relative" zIndex="10">
            {isFixed && <Box height={isMobile ? '53px' : `${navHeight}px`}/>}

            <MotionNav
                ref={navRef}
                position={isFixed ? "fixed" : "relative"}
                top={0}
                insetX={0}
                zIndex={100}
                bgGradient="linear(to-r, rgba(26,32,44,0.9), rgba(26,32,44,0.8))"
                backdropFilter="blur(10px)"
                borderBottom={isFixed ? "1px solid rgba(255,255,255,0.06)" : "none"}
                py={{base: 2, md: 4}}
                initial={motionInitial}
                animate={motionAnimate}
                transition={motionTransition}
            >
                <Box display={{base: "flex", md: "none"}} alignItems="center" position="relative">
                    {!isFixed ? (
                        <>
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w={6}
                                bgGradient="linear(to-r, rgba(26,32,44,0.9), transparent)"
                                zIndex={1}
                                pointerEvents="none"
                            />
                            <Box
                                position="absolute"
                                right={0}
                                top={0}
                                bottom={0}
                                w={6}
                                bgGradient="linear(to-l, rgba(26,32,44,0.9), transparent)"
                                zIndex={1}
                                pointerEvents="none"
                            />
                            <Box
                                display="flex"
                                overflowX="auto"
                                gap={1}
                                px={4}
                                flex="1"
                                py={1}
                                position="relative"
                                zIndex={0}
                                css={{
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                    scrollSnapType: "x mandatory",
                                    "& > *": { scrollSnapAlign: "start" },
                                }}
                            >
                                <Box minW={2} />
                                {items.map((item) => {
                                    const hasChildren = !!item.children?.length;
                                    const isGroupActive = activeId === item.id || item.children?.some((c) => c.id === activeId);
                                    const isAnyChildActive = item.children?.some((c) => c.id === activeId);
                                    const isExpanded = expandedId === item.id;
                                    return (
                                        <MotionBox
                                            key={item.id}
                                            layout
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                            flexShrink={0}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                                bg={isGroupActive ? "teal.500" : "whiteAlpha.100"}
                                                boxShadow={isGroupActive ? "0 2px 6px rgba(45,199,180,0.3)" : "none"}
                                                onClick={() => {
                                                    if (hasChildren) {
                                                        setExpandedId(isExpanded ? null : item.id);
                                                    } else {
                                                        handleClick(item.id);
                                                    }
                                                }}
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                _hover={{ 
                                                    bg: isGroupActive ? "teal.400" : "whiteAlpha.200",
                                                }}
                                                css={{
                                                    WebkitTapHighlightColor: "transparent",
                                                }}
                                            >
                                                <Box
                                                    w={1.5}
                                                    h={1.5}
                                                    borderRadius="full"
                                                    bg={isGroupActive ? "white" : "gray.400"}
                                                    flexShrink={0}
                                                />
                                                <Box
                                                    color={isGroupActive || isAnyChildActive ? "white" : "gray.300"}
                                                    fontWeight="semibold"
                                                    fontSize="xs"
                                                    whiteSpace="nowrap"
                                                >
                                                    {item.name}
                                                </Box>
                                                {hasChildren && (
                                                    <Box
                                                        ml={1}
                                                        color="whiteAlpha.700"
                                                        fontSize="10px"
                                                        lineHeight="1"
                                                        transition="transform 0.2s"
                                                        transform={isExpanded ? "rotate(-180deg)" : "rotate(0deg)"}
                                                    >
                                                        ▶
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box
                                                display="flex"
                                                gap={1}
                                                overflow="hidden"
                                                transition="all 0.25s ease"
                                                maxW={isExpanded ? "500px" : "0"}
                                                opacity={isExpanded ? 1 : 0}
                                            >
                                                {item.children?.map((child) => (
                                                    <Box
                                                        key={child.id}
                                                        px={2}
                                                        py={1}
                                                        borderRadius="full"
                                                        bg={activeId === child.id ? "teal.400" : "whiteAlpha.50"}
                                                        color={activeId === child.id ? "white" : "gray.400"}
                                                        fontWeight={activeId === child.id ? "semibold" : "medium"}
                                                        fontSize="xs"
                                                        whiteSpace="nowrap"
                                                        cursor="pointer"
                                                        transition="all 0.15s"
                                                        border="1px solid"
                                                        borderColor={activeId === child.id ? "teal.300" : "whiteAlpha.200"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClick(child.id);
                                                        }}
                                                        _hover={{ 
                                                            bg: activeId === child.id ? "teal.300" : "whiteAlpha.200",
                                                            color: "white"
                                                        }}
                                                        css={{
                                                            WebkitTapHighlightColor: "transparent",
                                                        }}
                                                    >
                                                        {child.name}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </MotionBox>
                                    );
                                })}
                                <Box minW={2} />
                            </Box>
                        </>
                    ) : (
                        <>
                            <MotionBox
                                initial={disableMotion ? undefined : {opacity: 0, x: -20}}
                                animate={disableMotion ? undefined : {opacity: 1, x: 0}}
                                transition={disableMotion ? undefined : {duration: 0.4}}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                px={4}
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
                            </MotionBox>

                            <Drawer.Root 
                                placement="bottom" 
                                open={drawerOpen} 
                                onOpenChange={(details) => {
                                    setDrawerOpen(details.open);
                                    if (!details.open) setOpenIds([]);
                                }}
                            >
                                <Drawer.Trigger asChild>
                                    <IconButton
                                        aria-label="Открыть меню"
                                        size="sm"
                                        variant="ghost"
                                        color="white"
                                        ml="auto"
                                        mr={2}
                                    >
                                        <FiMenu/>
                                    </IconButton>
                                </Drawer.Trigger>

                                <Portal>
                                    <Drawer.Backdrop />
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
                                                            scale: 1.03,
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
                                                                            <VStack pl={4} mt={1} align="stretch"
                                                                                    gap={1}>
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
                        </>
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
