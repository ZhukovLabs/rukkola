import {NavbarItem} from "@/app-pages/menu/navbar/types";
import {Box} from "@chakra-ui/react";

type MenuItemProps = {
    item: NavbarItem;
    isMobile: boolean;
    onClick: VoidFunction;
};

export const MenuItem = ({
                             item: {name},
                             isMobile,
                             onClick,
                         }: MenuItemProps) => (
    <Box
        px={isMobile ? 5 : 4}
        py={isMobile ? 3 : 2}
        borderRadius="md"
        bg="transparent"
        color="white"
        fontSize={isMobile ? "md" : "sm"}
        fontWeight="medium"
        minH={isMobile ? "48px" : "auto"}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
            bg: "rgba(255,255,255,0.05)",
            transform: isMobile ? "none" : "translateX(4px)",
        }}
        _active={{bg: "rgba(255,255,255,0.1)"}}
        onClick={onClick}
    >
        {name}
    </Box>
);
