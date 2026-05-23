"use client";

import {Box, Flex, Text, Icon, Stack, Link} from "@chakra-ui/react";
import {Phone, Clock, MapPin, ArrowUpRight} from "lucide-react";
import {ElementType} from "react";
import {useQuery} from "@tanstack/react-query";
import NextLink from "next/link";
import {getSiteSettings, SiteSettingsData} from "@/lib/api/site-settings";

const DEFAULT_SETTINGS: SiteSettingsData = {
    address: "ул. Советская, 60",
    addressLink: "https://yandex.by/maps/org/rukkola/22014226743/?ll=31.003680%2C52.438805&z=20.4",
    addressNote: "(новый универмаг)",
    phone: "+375 (44) 770-30-03",
    phoneLink: "+375447703003",
    workHours: "12:00 — 23:00",
    workHoursNote: "без выходных",
};

type FooterItemProps = {
    icon: ElementType;
    title: string;
    children: React.ReactNode;
};

const FooterItem = ({icon, title, children}: FooterItemProps) => (
    <Stack direction="row" align="flex-start">
        <Icon as={icon} color="gray.300" mt={1} boxSize={5}/>
        <Box>
            <Text color="gray.200">{title}</Text>
            {children}
        </Box>
    </Stack>
);

export const Footer = () => {
    const year = new Date().getFullYear();

    const {data: response} = useQuery({
        queryKey: ["site-settings"],
        queryFn: () => getSiteSettings(),
        staleTime: 5 * 60 * 1000,
    });

    const settings: SiteSettingsData = response?.data ?? DEFAULT_SETTINGS;

    return (
        <Box
            as="footer"
            mt={20}
            py={10}
            px={{base: 6, md: 10}}
            bgGradient="linear(to-r, rgba(26,32,44,0.85), rgba(26,32,44,0.75))"
            backdropFilter="blur(12px)"
            borderTop="1px solid rgba(255,255,255,0.08)"
            boxShadow="0 -6px 24px rgba(0,0,0,0.35)"
            color="gray.200"
            position="relative"
        >
            <Flex
                direction={{base: "column", md: "row"}}
                justify="space-between"
                align={{base: "flex-start", md: "center"}}
                gap={8}
                maxW="6xl"
                mx="auto"
            >
                <FooterItem icon={MapPin} title="Адрес:">
                    <Link
                        href={settings.addressLink}
                        fontWeight="medium"
                        color="gray.100"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{color: "gray.300"}}
                    >
                        {settings.address} <Icon as={ArrowUpRight} boxSize={3} opacity={0.7}/>
                    </Link>
                    {settings.addressNote && (
                        <Text color="gray.400" fontSize="sm">{settings.addressNote}</Text>
                    )}
                </FooterItem>

                <FooterItem icon={Phone} title="Телефон:">
                    <Link
                        href={`tel:${settings.phoneLink}`}
                        fontWeight="medium"
                        color="gray.100"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{color: "gray.300"}}
                    >
                        {settings.phone} <Icon as={ArrowUpRight} boxSize={3} opacity={0.7}/>
                    </Link>
                </FooterItem>

                <FooterItem icon={Clock} title="Время работы:">
                    <Text color="gray.200">{settings.workHours}</Text>
                    {settings.workHoursNote && (
                        <Text color="gray.400" fontSize="sm">{settings.workHoursNote}</Text>
                    )}
                </FooterItem>
            </Flex>

            <Flex justify="center" gap={4} mt={8}>
                <Link
                    href="https://www.instagram.com/rukkola.gomel"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="gray.400"
                    _hover={{color: "gray.200"}}
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"
                         style={{display: "inline-block", verticalAlign: "middle"}}>
                        <path
                            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                </Link>

            </Flex>

            <Box textAlign="center" mt={6} fontSize="sm" color="gray.500" borderTop="1px solid rgba(255,255,255,0.08)"
                 pt={6}>
                <Flex justify="center" gap={6} mb={4}>
                    <Link as={NextLink} href="/faq" _hover={{color: "gray.300"}}>FAQ</Link>
                    <Link as={NextLink} href="/privacy" _hover={{color: "gray.300"}}>Приватность</Link>
                </Flex>
                © {year} Все права защищены
            </Box>
        </Box>
    );
};
