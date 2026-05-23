'use client';

import {useEffect, useState} from "react";
import {Box, useBreakpointValue} from "@chakra-ui/react";
import {useSearchParams} from "next/navigation";

import {NavbarItem} from "./types";
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
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [isStuck, setIsStuck] = useState(false);
    const isMobile = useBreakpointValue({base: true, md: false});

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

    const handleClick = (id: string) => {
        const section = document.getElementById(id);
        if (!section) return;
        const navEl = document.querySelector('[data-navbar]');
        const navHeight = navEl?.getBoundingClientRect().height || 60;
        const y = section.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({top: y, behavior: "smooth"});
    };

    useEffect(() => {
        if (!items.length) return;

        const allIds = items.flatMap(item => [item.id, ...(item.children?.map(c => c.id) || [])]);

        const handleScroll = () => {
            let foundId: string | null = null;

            for (let i = allIds.length - 1; i >= 0; i--) {
                const id = allIds[i];
                const section = document.getElementById(`section-${id}`) || document.getElementById(id);
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
            } else if (window.scrollY === 0 && allIds.length > 0) {
                setActiveId(allIds[0]);
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, [items]);

    if (searchParams.has('cart') || !!productId) return null;

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
            <DesktopNav items={items} activeId={activeId} onItemClick={handleClick}/>
        </Box>
    );
}
