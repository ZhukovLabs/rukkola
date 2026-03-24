import { NavbarItem } from "@/app-pages/menu/navbar/types";
import { Box } from "@chakra-ui/react";

type MenuItemProps = {
    item: NavbarItem;
    isMobile: boolean;
    onClick: VoidFunction;
};

export const MenuItem = ({ item: { name }, isMobile, onClick }: MenuItemProps) => {
    return (
        <Box
            px={isMobile ? 5 : 4}
            py={isMobile ? 3 : 2}
            borderRadius="md"
            bg="transparent"
            color="white"
            fontSize={isMobile ? "md" : "sm"}
            fontWeight="medium"
            minH={isMobile ? "48px" : undefined}
            cursor="pointer"
            transition="transform 0.15s ease, background-color 0.15s ease"
            _hover={{
                bg: "rgba(255,255,255,0.05)",
                transform: isMobile ? undefined : "translateX(4px)",
            }}
            _active={{ bg: "rgba(255,255,255,0.1)" }}
            onClick={onClick}
            userSelect="none"
        >
            {name}
        </Box>
    );
};
