'use client';

import {useEffect, useState, useCallback} from "react";import {Box} from "@chakra-ui/react";
import {useSearchParams} from "next/navigation";

import {NavbarItem} from "./types";
import {CART_QUERY_KEY} from "../constants";
import {MobileNav} from "./mobile-nav";
import {DesktopNav} from "./desktop-nav";
import {useProductModal} from "../product-modal/use-product-modal";

type NavbarProps = {
    items: NavbarItem[];
};

export function Navbar({items}: NavbarProps) {
    const searchParams = useSearchParams();
    const {productId} = useProductModal();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile, {passive: true});
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const check = () => {
            const el = document.querySelector('[data-navbar]');
            if (!el) return;
            setIsStuck(el.getBoundingClientRect().top <= 1);
        };
        check();
        window.addEventListener('scroll', check, {passive: true});
        return () => window.removeEventListener('scroll', check);
    }, []);

    const handleClick = useCallback((id: string) => {
        const section = document.getElementById(id);
        if (!section) return;
        const navEl = document.querySelector('[data-navbar]');
        const navHeight = navEl?.getBoundingClientRect().height || 60;
        const y = section.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({top: y, behavior: "smooth"});
    }, []);

    useEffect(() => {
        if (!items.length) return;

        const allIds = items.flatMap(item => [item.id, ...(item.children?.map(c => c.id) || [])]);
        let rafId = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
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

    if (searchParams.has(CART_QUERY_KEY) || !!productId) return null;

    return (
        <Box
            data-navbar
            position="sticky"
            top="env(safe-area-inset-top, 0px)"
            mx="-20px"
            pt={isMobile ? "env(safe-area-inset-top, 0px)" : 0}
            pb={isMobile ? "env(safe-area-inset-bottom, 0px)" : 0}
            zIndex={100}
            bgGradient="linear(to-r, rgba(26,32,44,0.95), rgba(26,32,44,0.9))"
            backdropFilter="blur(10px)"
            boxShadow={isStuck ? "0 1px 0 0 rgba(255,255,255,0.06)" : "0 0px 0 0 rgba(255,255,255,0.06)"}
            transition="box-shadow 0.3s ease"
            py={{base: 2, md: 4}}
        >
            <MobileNav
                items={items}
                activeId={activeId}
                openIds={openIds}
                setOpenIds={setOpenIds}
                onItemClick={handleClick}
            />

            <DesktopNav
                items={items}
                activeId={activeId}
                onItemClick={handleClick}
            />
        </Box>
    );
}
