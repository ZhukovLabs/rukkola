'use client';

import {useEffect, useRef, useState, useCallback} from "react";
import {Box} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {useSearchParams} from "next/navigation";

import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "../constants";
import {MobileNav} from "./mobile-nav";
import {DesktopNav} from "./desktop-nav";

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
    const prevIsFixedRef = useRef(false);

    useEffect(() => {
        if (prevIsFixedRef.current && !isFixed && navRef.current) {
            const rect = navRef.current.getBoundingClientRect();
            initialTopRef.current = rect.top + window.scrollY;
        }
        prevIsFixedRef.current = isFixed;
    }, [isFixed]);

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
        if (initialTopRef.current === null || rect.top > 0) {
            initialTopRef.current = rect.top + window.scrollY;
        }
        
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
        if (!items.length || initialTopRef.current === null) {
            return;
        }
        
        const allIds = items.flatMap(item => [item.id, ...(item.children?.map(c => c.id) || [])]);
        
        const handleScroll = () => {
            const threshold = initialTopRef.current ?? 0;
            setIsFixed(window.scrollY > threshold);
            
            let foundId: string | null = null;
            
            console.log('[Navbar] allIds:', allIds);
            
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
            } else if (window.scrollY <= threshold && allIds.length > 0) {
                setActiveId(allIds[0]);
            }
        };

        handleScroll();
        
        window.addEventListener("scroll", handleScroll, {passive: true});
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items]);

    if (searchParams.has(CART_QUERY_KEY)) return null;

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
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.25, ease: "easeOut"}}
                layout
                css={isFixed ? {
                    WebkitOverflowScrolling: 'auto',
                    overscrollBehavior: 'contain',
                } : {}}
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
