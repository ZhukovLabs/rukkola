"use client";

import {Box, Flex, VStack, Text, Icon, IconButton, Link, HStack} from "@chakra-ui/react";
import {motion, AnimatePresence} from "framer-motion";
import {
    FiHome,
    FiBox,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiGrid,
    FiCoffee,
    FiShoppingBag,
    FiClock,
    FiX,
} from "react-icons/fi";
import {MdDashboard} from "react-icons/md";
import {useRouter, usePathname} from "next/navigation";
import {useAuth} from "@/lib/auth/auth-context";
import {useState, useCallback} from "react";

const MotionBox = motion.create(Box);

type MenuItem = {
    label: string;
    icon: typeof FiHome;
    path: string;
    color: string;
    roles?: ('admin' | 'moderator')[];
};

const menuItems: MenuItem[] = [
    {label: "Главная", icon: FiHome, path: "/dashboard", color: "teal"},
    {label: "Товары", icon: FiBox, path: "/dashboard/products", color: "orange"},
    {label: "Категории", icon: FiGrid, path: "/dashboard/categories", color: "green"},
    {label: "Обеды", icon: FiCoffee, path: "/dashboard/lunches", color: "pink"},
    {label: "История", icon: FiClock, path: "/dashboard/history", color: "purple", roles: ['admin']},
    {label: "Настройки", icon: FiSettings, path: "/dashboard/settings", color: "blue"},
];

const SIDEBAR_WIDTH = "280px";

const SidebarContent = ({
    pathname,
    user,
    onNavigate,
    onLogout,
}: {
    pathname: string;
    user: {name?: string; role?: string} | null;
    onNavigate: (path: string) => void;
    onLogout: () => void;
}) => (
    <>
        {/* Brand */}
        <Box
            mx={4}
            mt={4}
            mb={8}
            p={4}
            bg="gray.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.800"
        >
            <Flex justify="center" align="center" gap={3}>
                <Box
                    bg="teal.900/30"
                    p={2.5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="teal.700/30"
                    shadow="0 0 16px rgba(20, 184, 166, 0.08)"
                >
                    <Icon as={MdDashboard} color="teal.400" boxSize={6} />
                </Box>
                <VStack align="start" gap={0}>
                    <Text fontWeight="black" fontSize="md" color="white" letterSpacing="tight">
                        Админ
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        Панель управления
                    </Text>
                </VStack>
            </Flex>
        </Box>

        {/* Section heading */}
        <Flex align="center" gap={3} px={5} mb={3}>
            <Box boxSize="5px" borderRadius="full" bg="teal.500" shadow="0 0 8px rgba(20, 184, 166, 0.5)" />
            <Text fontSize="10px" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                Меню
            </Text>
            <Box flex="1" h="1px" bg="gray.800" />
        </Flex>

        {/* Menu items */}
        <VStack px={3} align="stretch" gap={0.5}>
            {menuItems
                .filter((item) => !item.roles || (user && (item.roles as readonly string[]).includes(user.role ?? '')))
                .map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Flex
                            key={item.path}
                            position="relative"
                            onClick={() => onNavigate(item.path)}
                            cursor="pointer"
                            align="center"
                            gap={3}
                            px={4}
                            py={2.5}
                            borderRadius="xl"
                            bg={isActive ? "whiteAlpha.50" : "transparent"}
                            _hover={{bg: "whiteAlpha.50"}}
                            transition="all 0.15s"
                            role="group"
                        >
                            {isActive && (
                                <MotionBox
                                    layoutId="activeTab"
                                    position="absolute"
                                    left={0}
                                    top={0}
                                    bottom={0}
                                    display="flex"
                                    alignItems="center"
                                >
                                    <Box
                                        w="3px"
                                        h="55%"
                                        bg={`${item.color}.500`}
                                        borderRadius="full"
                                        shadow={`0 0 12px var(--chakra-colors-${item.color}-500)`}
                                    />
                                </MotionBox>
                            )}
                            <Box
                                bg={isActive ? `${item.color}.900/40` : "transparent"}
                                _groupHover={{
                                    bg: isActive ? `${item.color}.900/40` : "whiteAlpha.50",
                                }}
                                p={2}
                                borderRadius="lg"
                                transition="all 0.15s"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon
                                    as={item.icon}
                                    boxSize={4}
                                    color={isActive ? `${item.color}.400` : "gray.500"}
                                    _groupHover={{
                                        color: isActive ? `${item.color}.400` : "gray.400",
                                    }}
                                    transition="color 0.15s"
                                />
                            </Box>
                            <Text
                                fontWeight={isActive ? "bold" : "medium"}
                                fontSize="sm"
                                color={isActive ? "white" : "gray.400"}
                                _groupHover={{
                                    color: isActive ? "white" : "gray.300",
                                }}
                                transition="color 0.15s"
                            >
                                {item.label}
                            </Text>
                        </Flex>
                    );
                })}
        </VStack>

        {/* Bottom section */}
        <Box px={3} pb={4} mt="auto">
            <Link
                href="/?token=x7fa5ca6"
                display="flex"
                alignItems="center"
                gap={3}
                px={4}
                py={2.5}
                borderRadius="xl"
                color="gray.500"
                _hover={{bg: "whiteAlpha.50", color: "gray.300", textDecoration: "none"}}
                transition="all 0.15s"
                target="_blank"
                rel="noopener noreferrer"
                textDecoration="none"
                mb={0.5}
            >
                <Icon as={FiShoppingBag} boxSize={4} />
                <Text fontWeight="medium" fontSize="sm">Перейти в меню</Text>
            </Link>

            <Flex
                align="center"
                gap={3}
                px={4}
                py={2.5}
                borderRadius="xl"
                color="gray.500"
                cursor="pointer"
                _hover={{bg: "rgba(229,62,62,0.08)", color: "red.400"}}
                transition="all 0.15s"
                onClick={onLogout}
                role="group"
            >
                <Icon as={FiLogOut} boxSize={4} _groupHover={{color: "red.400"}} transition="color 0.15s" />
                <Text fontWeight="medium" fontSize="sm">Выйти</Text>
            </Flex>
        </Box>
    </>
);

export const DashboardLayout = ({children}: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const {logout, user} = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        await logout();
        router.push("/");
    }, [logout, router]);

    const handleNavigate = useCallback((path: string) => {
        router.push(path);
        setMobileOpen(false);
    }, [router]);

    const sidebarProps = {pathname, user: user ?? null, onNavigate: handleNavigate, onLogout: handleLogout};

    return (
        <Flex minH="100vh" bg="gray.900" color="white" flexDir={{base: "column", md: "row"}}>
            {/* Mobile header */}
            <HStack
                display={{base: "flex", md: "none"}}
                justify="space-between"
                align="center"
                bg="gray.950"
                px={5}
                py={3.5}
                borderBottom="1px solid"
                borderColor="gray.800"
                position="sticky"
                top={0}
                zIndex={20}
            >
                <Flex align="center" gap={2.5}>
                    <Box
                        bg="teal.900/30"
                        p={2}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="teal.700/30"
                    >
                        <Icon as={MdDashboard} color="teal.400" boxSize={4} />
                    </Box>
                    <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize="sm" color="white" lineHeight="1.2">
                            Админ панель
                        </Text>
                        <Text fontSize="10px" color="gray.500" lineHeight="1.2">
                            {user?.name || 'Управление'}
                        </Text>
                    </VStack>
                </Flex>
                <IconButton
                    aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                    variant="ghost"
                    color="white"
                    _hover={{bg: "whiteAlpha.100"}}
                    onClick={() => setMobileOpen((prev) => !prev)}
                >
                    {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </IconButton>
            </HStack>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <MotionBox
                        display={{base: "block", md: "none"}}
                        position="fixed"
                        inset={0}
                        bg="blackAlpha.600"
                        zIndex={15}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <Flex
                display={{base: "none", md: "flex"}}
                w={SIDEBAR_WIDTH}
                bg="gray.950"
                borderRight="1px solid"
                borderColor="gray.800"
                flexDir="column"
                position="fixed"
                top={0}
                left={0}
                h="100vh"
                overflowY="auto"
                zIndex={10}
            >
                <MotionBox
                    flex="1"
                    display="flex"
                    flexDir="column"
                    initial={{x: -40, opacity: 0}}
                    animate={{x: 0, opacity: 1}}
                    transition={{duration: 0.4}}
                >
                    <SidebarContent {...sidebarProps} />
                </MotionBox>
            </Flex>

            {/* Mobile sidebar panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <MotionBox
                        display={{base: "flex", md: "none"}}
                        position="fixed"
                        top={0}
                        left={0}
                        w="280px"
                        h="100vh"
                        bg="gray.950"
                        borderRight="1px solid"
                        borderColor="gray.800"
                        flexDir="column"
                        zIndex={20}
                        overflowY="auto"
                        initial={{x: -280}}
                        animate={{x: 0}}
                        exit={{x: -280}}
                        transition={{type: "spring", damping: 28, stiffness: 300}}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent {...sidebarProps} />
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Main content */}
            <Box
                flex="1"
                p={{base: 4, md: 8}}
                overflowX="auto"
                ml={{md: SIDEBAR_WIDTH}}
                bg="gray.900"
                minH={{base: "calc(100vh - 56px)", md: "100vh"}}
            >
                {children}
            </Box>
        </Flex>
    );
};
