'use client';

import {Button, Portal, useBreakpointValue} from "@chakra-ui/react";
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
    activeId: string | null;
};

export const NavItem = ({
                            id,
                            title,
                            isActive,
                            onClick,
                            childrenItems,
                            activeId,
                        }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMobile = useBreakpointValue({base: true, md: false});
    const hasChildren = !!childrenItems?.length;
    const isGroupActive = isActive || childrenItems?.some(child => child.id === activeId);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e: Event) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
            setIsOpen(false);
        };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("touchstart", handleOutside, {passive: true});

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("touchstart", handleOutside);
        };
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
                setIsOpen(v => !v);
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
                color={isActive ? "white" : "gray.400"}
                bg={isActive ? "gray.700" : "transparent"}
                borderWidth="1px"
                borderColor={isActive ? "gray.500" : "transparent"}
                _hover={{bg: "gray.700", color: "white"}}
                _active={{color: "gray.100"}}
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
                color={isGroupActive ? "white" : "gray.400"}
                bg={isGroupActive ? "gray.700" : "transparent"}
                borderWidth="1px"
                borderColor={isGroupActive ? "gray.500" : "transparent"}
                _hover={{bg: "gray.700", color: "white"}}
                _active={{color: "gray.100"}}
                onClick={handleTriggerClick}
                style={{WebkitTapHighlightColor: "transparent"}}
            >
                {title}
                <ChevronDownIcon
                    ml={1}
                    transition="transform 0.2s ease"
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
