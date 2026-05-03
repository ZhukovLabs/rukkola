'use client';

import {useEffect, useRef, useState, useCallback} from "react";
import {Box} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {useSearchParams} from "next/navigation";

import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "../constants";
import {MobileNav} from "./mobile-nav";
import {DesktopNav} from "./desktop-nav";

const PRODUCT_QUERY_KEY = "product";

const MotionNav = motion.create(Box);

type NavbarProps = {
    items: NavbarItem[];
};

const NAV_HEIGHT = 60;

export function Navbar({items}: NavbarProps) {
    const searchParams = useSearchParams();
    const navRef = useRef<HTMLDivElement>(null);
    
    const [isFixed, setIsFixed] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [navHeight, setNavHeight] = useState(NAV_HEIGHT);
    const initialTopRef = useRef<number | null>(null);
    const isFixedRef = useRef(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        
        window.addEventListener('resize', checkMobile, { passive: true });
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!navRef.current) return;
        const rect = navRef.current.getBoundingClientRect();
        initialTopRef.current = rect.top + window.scrollY;
    }, []);

    useEffect(() => {
        if (!navRef.current) return;
        
        const updateHeight = () => {
            if (navRef.current) {
                setNavHeight(navRef.current.offsetHeight);
            }
        };
        
        updateHeight();
        
        const timeout = setTimeout(updateHeight, 100);
        return () => clearTimeout(timeout);
    }, [items]);

    const handleClick = useCallback((id: string) => {
        const section = document.getElementById(id);
        if (!section) return;
        const currentHeight = navRef.current?.offsetHeight || navHeight || 60;
        const y = section.getBoundingClientRect().top + window.scrollY - currentHeight;
        window.scrollTo({top: y, behavior: "smooth"});
    }, [navHeight]);

    useEffect(() => {
        if (!items.length) return;
        
        const allIds = items.flatMap(item => [item.id, ...(item.children?.map(c => c.id) || [])]);
        
        let rafId = 0;
        
        const handleScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                if (initialTopRef.current === null) return;
                
                const currentScrollY = window.scrollY;
                const threshold = initialTopRef.current;
                const shouldBeFixed = currentScrollY > threshold;
                
                if (isFixedRef.current !== shouldBeFixed) {
                    isFixedRef.current = shouldBeFixed;
                    setIsFixed(shouldBeFixed);
                }
                
                let foundId: string | null = null;
                
                for (let i = allIds.length - 1; i >= 0; i--) {
                    const id = allIds[i];
                    const sectionId = `section-${id}`;
                    const section = document.getElementById(sectionId) || document.getElementById(id);
                    if (section) {
                        const rect = section.getBoundingClientRect();
                        if (rect.top <= window.innerHeight / 2) {
                            foundId = id;
                            break;
                        }
                    }
                }
                
                if (foundId) {
                    setActiveId(foundId);
                } else if (currentScrollY === 0 && allIds.length > 0) {
                    setActiveId(allIds[0]);
                }
            });
        };

        handleScroll();
        
        window.addEventListener("scroll", handleScroll, {passive: true});
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [items]);

    if (searchParams.has(CART_QUERY_KEY) || searchParams.has(PRODUCT_QUERY_KEY)) return null;

    return (
        <Box position="relative" zIndex="10">
            {isFixed && (
                <Box 
                    height={isMobile ? `calc(53px + env(safe-area-inset-top, 0px))` : `${navHeight}px`} 
                />
            )}

            <MotionNav
                ref={navRef}
                position={isFixed ? "fixed" : "relative"}
                top={0}
                pt={isFixed && isMobile ? "env(safe-area-inset-top, 0px)" : 0}
                pb={isFixed && isMobile ? "env(safe-area-inset-bottom, 0px)" : 0}
                insetX={0}
                zIndex={100}
                bgGradient="linear(to-r, rgba(26,32,44,0.9), rgba(26,32,44,0.8))"
                backdropFilter="blur(10px)"
                borderBottom={isFixed ? "1px solid rgba(255,255,255,0.06)" : "none"}
                py={{base: 2, md: 4}}
                initial={false}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.2}}
            >
                <MobileNav
                    items={items}
                    activeId={activeId}
                    openIds={openIds}
                    setOpenIds={setOpenIds}
                    isFixed={isFixed}
                    onItemClick={handleClick}
                />

                <DesktopNav
                    items={items}
                    activeId={activeId}
                    isFixed={isFixed}
                    onItemClick={handleClick}
                />
            </MotionNav>
        </Box>
    );
}
