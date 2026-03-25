'use client';

import {Button} from "@chakra-ui/react";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {useState, useRef, useEffect} from "react";
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
    const hasChildren = !!childrenItems?.length;
    const isGroupActive = isActive || childrenItems?.some(child => child.id === activeId);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e: Event) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            setIsOpen(false);
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [isOpen]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (hasChildren) {
            setIsOpen(v => !v);
        } else {
            onClick(id);
        }
    };

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
                _hover={{color: "teal.200"}}
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
                color={isGroupActive ? "teal.300" : "gray.200"}
                bg="transparent"
                _hover={{color: "teal.200"}}
                _active={{color: "teal.100"}}
                onClick={handleClick}
                style={{WebkitTapHighlightColor: "transparent"}}
            >
                {title}
                <ChevronDownIcon
                    ml={1}
                    transition="transform 0.2s ease"
                    transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                />
            </Button>

            {isOpen && (
                <Menu
                    triggerRef={triggerRef}
                    items={childrenItems}
                    onItemClick={handleChildClick}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};