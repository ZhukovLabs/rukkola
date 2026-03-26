"use client";

import { Box, Flex, Text, Icon, Stack, Link } from "@chakra-ui/react";
import { Phone, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import {ElementType, useMemo} from "react";

const MotionLink = motion(Link);

type FooterItemProps = {
    icon: ElementType;
    title: string;
    children: React.ReactNode;
};

const FooterItem = ({ icon, title, children }: FooterItemProps) => (
    <Stack direction="row" align="flex-start">
        <Icon as={icon} color="teal.300" mt={1} boxSize={5} />
        <Box>
            <Text color="teal.200">{title}</Text>
            {children}
        </Box>
    </Stack>
);

export const Footer = () => {
    const year = useMemo(() => new Date().getFullYear(), []);

    const motionProps = { whileHover: { x: 2 }, transition: { duration: 0.2 } };

    return (
        <Box
            as="footer"
            mt={20}
            py={10}
            px={{ base: 6, md: 10 }}
            bgGradient="linear(to-r, rgba(26,32,44,0.85), rgba(26,32,44,0.75))"
            backdropFilter="blur(12px)"
            borderTop="1px solid rgba(255,255,255,0.08)"
            boxShadow="0 -6px 24px rgba(0,0,0,0.35)"
            color="gray.200"
            position="relative"
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                gap={8}
                maxW="6xl"
                mx="auto"
            >
                <FooterItem icon={MapPin} title="Адрес:">
                    <MotionLink
                        href="https://yandex.by/maps/org/rukkola/22014226743/?ll=31.003680%2C52.438805&z=20.4"
                        fontWeight="medium"
                        color="gray.100"
                        cursor="pointer"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{ color: "teal.300" }}
                        {...motionProps}
                    >
                        ул. Советская, 60 <Icon as={ArrowUpRight} boxSize={3} opacity={0.7} />
                    </MotionLink>
                    <Text color="gray.400" fontSize="sm">(новый универмаг)</Text>
                </FooterItem>

                <FooterItem icon={Phone} title="Телефон:">
                    <MotionLink
                        href="tel:+375447703003"
                        fontWeight="medium"
                        color="gray.100"
                        cursor="pointer"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{ color: "teal.300" }}
                        {...motionProps}
                    >
                        +375 (44) 770-30-03 <Icon as={ArrowUpRight} boxSize={3} opacity={0.7} />
                    </MotionLink>
                </FooterItem>

                <FooterItem icon={Clock} title="Время работы:">
                    <Text color="gray.200">12:00 — 23:00</Text>
                    <Text color="gray.400" fontSize="sm">без выходных</Text>
                </FooterItem>
            </Flex>

            <Box textAlign="center" mt={10} fontSize="sm" color="gray.500" borderTop="1px solid rgba(255,255,255,0.08)" pt={6}>
                © {year} Все права защищены
            </Box>
        </Box>
    );
};
