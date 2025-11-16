'use client';

import {useEffect, useMemo, useRef, useState} from "react";
import {HStack, Box} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {useSearchParams} from "next/navigation";

import {NavItem} from "./nav-item";
import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "@/app-pages/menu/config";

const MotionNav = motion(Box);

type NavbarProps = {
    items: NavbarItem[];
};

export const Navbar = ({items}: NavbarProps) => {
    const searchParams = useSearchParams();
    const navRef = useRef<HTMLDivElement>(null);
    const [isFixed, setIsFixed] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [navHeight, setNavHeight] = useState(0);

    const allSectionIds = useMemo(() => {
        const ids = new Set<string>();

        const collect = (items: NavbarItem[]) => {
            items.forEach((item) => {
                ids.add(item.id);
                if (item.children) collect(item.children);
            });
        };

        collect(items);
        return Array.from(ids);
    }, [items]);

    useEffect(() => {
        const updateHeight = () => {
            if (navRef.current) {
                setNavHeight(navRef.current.offsetHeight);
            }
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: `-${navHeight + 20}px 0px -60% 0px`,
                threshold: [0, 0.1],
            }
        );

        allSectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            allSectionIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, [allSectionIds, navHeight]);

    useEffect(() => {
        const handleScroll = () => {
            const threshold = items[0]?.id ? document.getElementById(items[0].id)?.offsetTop || 0 : 0;
            setIsFixed(window.scrollY > threshold - navHeight - 10);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items, navHeight]);

    const handleClick = (id: string) => {
        const section = document.getElementById(id);
        if (!section) return;

        window.scrollTo({
            top: section.offsetTop - navHeight * 2,
            behavior: "smooth",
        });
    };

    if (searchParams.has(CART_QUERY_KEY)) return null;

    return (
        <Box position="relative" zIndex="10">
            {isFixed && <Box height={navHeight}/>}

            <MotionNav
                ref={navRef}
                position={isFixed ? "fixed" : "relative"}
                top={0}
                insetX={0}
                zIndex={100}
                mx="auto"
                bgGradient="linear(to-r, rgba(26, 32, 44, 0.85), rgba(26, 32, 44, 0.75))"
                backdropFilter="blur(14px)"
                boxShadow="0 8px 30px rgba(0,0,0,0.35)"
                py={4}
                borderBottom={isFixed ? "1px solid rgba(255,255,255,0.08)" : "none"}
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                transition={{duration: 0.4, ease: "easeOut"}}
            >
                <HStack wrap="wrap" justify="center" gap={6}>
                    {items.map((item) => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            title={item.name}
                            isActive={activeId === item.id || item.children?.some(child => child.id === activeId) || false}
                            onClick={handleClick}
                            childrenItems={item.children}
                            activeId={activeId}
                        />
                    ))}
                </HStack>
            </MotionNav>
        </Box>
    );
};