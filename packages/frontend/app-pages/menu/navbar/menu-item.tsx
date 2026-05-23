'use client';

import {Box} from "@chakra-ui/react";
import type {NavbarItem} from "./types";

type MenuItemProps = {
    item: NavbarItem;
    isMobile: boolean;
    onClick: () => void;
};

export function MenuItem({item, isMobile, onClick}: MenuItemProps) {
    return (
        <Box
            as="button"
            w="full"
            textAlign="left"
            px={4}
            py={2.5}
            borderRadius="lg"
            color="whiteAlpha.800"
            fontSize={isMobile ? "md" : "sm"}
            fontWeight="medium"
            cursor="pointer"
            transition="all 0.15s"
            _hover={{bg: "whiteAlpha.100", color: "white"}}
            _active={{bg: "whiteAlpha.200"}}
            onClick={onClick}
        >
            {item.name}
        </Box>
    );
}
