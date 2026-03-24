"use client";

import {Box, Flex, VStack, Text, Icon, IconButton} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {
    FiHome,
    FiBox,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiGrid,
    FiCoffee,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import {useRouter, usePathname} from "next/navigation";
import {useAuth} from "@/lib/auth/auth-context";
import {useState} from "react";

const MotionBox = motion.create(Box);

const menuItems = [
    {label: "Главная", icon: FiHome, path: "/dashboard"},
    {label: "Товары", icon: FiBox, path: "/dashboard/products"},
    {label: "Категории", icon: FiGrid, path: "/dashboard/categories"},
    {label: "Обеды", icon: FiCoffee, path: "/dashboard/lunches"},
    {label: "Настройки", icon: FiSettings, path: "/dashboard/settings"},
];

export const DashboardLayout = ({children}: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const {logout} = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarBg = "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)";
    const activeColor = "teal.400";
    const textColor = "gray.400";
    const hoverBg = "rgba(56,178,172,0.1)";

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <Flex minH="100vh" bg="gray.900" color="white" flexDir={{base: "column", md: "row"}}>
            <Flex
                display={{base: "flex", md: "none"}}
                justify="space-between"
                align="center"
                bg="gray.800"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor="gray.700"
            >
                <Flex align="center" gap={2}>
                    <Icon as={MdDashboard} color="teal.300" boxSize={5} />
                    <Text fontWeight="bold" fontSize="lg" color="teal.300">
                        Админ панель
                    </Text>
                </Flex>
                <IconButton
                    aria-label="Menu"
                    variant="ghost"
                    color="white"
                    _hover={{bg: hoverBg}}
                    onClick={() => setMobileOpen(!mobileOpen)}>
                    <FiMenu/>
                </IconButton>
            </Flex>

            <MotionBox
                w={{base: mobileOpen ? "100%" : 0, md: "280px"}}
                bg={sidebarBg}
                p={{base: mobileOpen ? 6 : 0, md: 6}}
                borderRight={{base: "none", md: "1px solid"}}
                borderColor="gray.800"
                display={{base: mobileOpen ? "block" : "none", md: "flex"}}
                flexDir="column"
                justifyContent="space-between"
                initial={{x: -40, opacity: 0}}
                animate={{x: 0, opacity: 1}}
                transition={{duration: 0.4}}
                position={{ md: "fixed" }}
                top={{ md: 0 }}
                left={{ md: 0 }}
                height={{ md: "100vh" }}
                overflowY={{ md: "auto" }}
                zIndex={{ md: 10 }}
            >
                <VStack align="stretch">
                    <Box
                        display={{base: "none", md: "block"}}
                        mb={8}
                        p={4}
                        bg="teal.900"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="teal.700"
                    >
                        <Flex justify="center" align="center" gap={3}>
                            <Icon as={MdDashboard} color="teal.300" boxSize={7} />
                            <VStack align="start" gap={0}>
                                <Text fontWeight="bold" fontSize="lg" color="white">
                                    Админ
                                </Text>
                                <Text fontSize="xs" color="teal.300">
                                    Панель управления
                                </Text>
                            </VStack>
                        </Flex>
                    </Box>

                    <Text 
                        fontSize="xs" 
                        fontWeight="semibold" 
                        color="gray.500" 
                        textTransform="uppercase" 
                        letterSpacing="wider"
                        mb={3}
                        px={3}
                    >
                        Меню
                    </Text>

                    <VStack align="stretch" gap={1}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Flex
                                    key={item.path}
                                    align="center"
                                    gap={3}
                                    px={4}
                                    py={3}
                                    borderRadius="lg"
                                    bg={isActive ? "teal.600" : "transparent"}
                                    color={isActive ? "white" : textColor}
                                    cursor="pointer"
                                    _hover={{
                                        bg: isActive ? "teal.600" : hoverBg,
                                        color: isActive ? "white" : activeColor,
                                        transform: "translateX(4px)",
                                    }}
                                    transition="all 0.2s ease"
                                    onClick={() => {
                                        router.push(item.path);
                                        setMobileOpen(false);
                                    }}
                                    boxShadow={isActive ? "0 4px 12px rgba(56,178,172,0.3)" : "none"}
                                >
                                    <Icon as={item.icon} boxSize={5}/>
                                    <Text fontWeight="medium">{item.label}</Text>
                                </Flex>
                            );
                        })}
                    </VStack>
                </VStack>

                <Box mt={4}>
                    <Box my={4} h="1px" bg="gray.700"/>
                    <Flex
                        align="center"
                        gap={3}
                        px={4}
                        py={3}
                        borderRadius="lg"
                        color="gray.400"
                        cursor="pointer"
                        _hover={{bg: "rgba(229,62,62,0.1)", color: "red.300"}}
                        transition="all 0.2s ease"
                        onClick={handleLogout}
                    >
                        <Icon as={FiLogOut} boxSize={5}/>
                        <Text fontWeight="medium">Выйти</Text>
                    </Flex>
                </Box>
            </MotionBox>

            <Box 
                flex="1" 
                p={{base: 4, md: 8}} 
                overflowX="auto" 
                ml={{ md: "280px" }}
                bg="gray.900"
            >
                {children}
            </Box>
        </Flex>
    );
};
