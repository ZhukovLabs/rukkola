"use client";

import {
    Button,
    Portal,
    useBreakpointValue
} from "@chakra-ui/react";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {useRef, useState, useEffect, useCallback} from "react";
import {AnimatePresence} from "framer-motion";
import {NavbarItem} from "./types";
import {Menu} from "./menu";

type NavItemProps = {
    id: string;
    title: string;
    isActive: boolean;
    onClick: (id: string) => void;
    childrenItems?: NavbarItem[];
};

export const NavItem = ({
                            id,
                            title,
                            isActive,
                            onClick,
                            childrenItems,
                        }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMobile = useBreakpointValue({base: true, md: false});
    const hasChildren = !!childrenItems?.length;

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e: Event) => {
            const target = e.target as Node;

            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
        };

        const events: (keyof DocumentEventMap)[] = ["mousedown", "touchstart"];
        events.forEach((ev) => document.addEventListener(ev, handleOutside));

        return () => events.forEach((ev) => document.removeEventListener(ev, handleOutside));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isMobile) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener("touchmove", handleScroll, {passive: true});
        return () => window.removeEventListener("touchmove", handleScroll);
    }, [isOpen, isMobile]);

    const handleTriggerClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasChildren) {
                setIsOpen((v) => !v);
            } else {
                onClick(id);
            }
        },
        [hasChildren, id, onClick]
    );

    const handleChildClick = (childId: string) => {
        onClick(childId);
        setIsOpen(false);
    };

    if (!hasChildren) {
        return (
            <Button
                size="sm"
                px={6}
                py={3}
                variant="ghost"
                borderRadius="full"
                fontWeight="medium"
                color={isActive ? "teal.300" : "gray.200"}
                bg="transparent"
                _hover={{color: "teal.200", transform: "translateY(-2px)"}}
                _active={{color: "teal.100"}}
                onClick={() => onClick(id)}
                style={{WebkitTapHighlightColor: "transparent"}}
            >
                {title}
            </Button>
        );
    }

    return (
        <>
            <Button
                ref={triggerRef}
                size="sm"
                px={6}
                py={3}
                variant="ghost"
                borderRadius="full"
                fontWeight="medium"
                color={isActive ? "teal.300" : "gray.200"}
                bg="transparent"
                _hover={{color: "teal.200", transform: "translateY(-2px)"}}
                _active={{color: "teal.100"}}
                onClick={handleTriggerClick}
                style={{WebkitTapHighlightColor: "transparent"}}
            >
                {title}
                <ChevronDownIcon
                    ml={1}
                    transition="transform 0.2s"
                    transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                />
            </Button>

            <Portal>
                <AnimatePresence>
                    {isOpen && (
                        <Menu
                            triggerRef={triggerRef}
                            menuRef={menuRef}
                            isMobile={!!isMobile}
                            items={childrenItems}
                            onItemClick={handleChildClick}
                        />
                    )}
                </AnimatePresence>
            </Portal>
        </>
    );
};