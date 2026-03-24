'use client';

import {Box, SimpleGrid, Heading, Text, Spinner, Center} from "@chakra-ui/react";
import {useAuth} from "@/lib/auth/auth-context";
import {StatsGrid} from "./stats-grid";
import {DASHBOARD_TEXTS} from "./config";
import {getDashboardStats, type DashboardData} from "@/lib/api/dashboard";
import {useEffect, useState} from "react";

const {
    welcome,
    about,
    sections: {products, categories, stats},
} = DASHBOARD_TEXTS;

export const Dashboard = () => {
    const {user, status} = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') return;

        const fetchData = async () => {
            try {
                const result = await getDashboardStats();
                if (result.success && result.data) {
                    setDashboardData(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [status]);

    if (status === 'loading' || loading) {
        return (
            <Center minH="200px">
                <Spinner size="xl" color="teal.300"/>
            </Center>
        );
    }

    const fullName = dashboardData?.fullName || '';
    const dashboardStats = dashboardData?.stats || {
        products: 0,
        hiddenProducts: 0,
        categories: 0,
        users: 0,
    };

    return (
        <Box>
            {fullName && (
                <Heading mb={6} fontSize={{base: "2xl", md: "3xl"}} color="teal.300" lineClamp={2} wordBreak="break-word">
                    {welcome.greeting}, {fullName}!
                </Heading>
            )}

            <StatsGrid stats={dashboardStats}/>

            <Box
                mt={10}
                p={{base: 4, md: 6}}
                bg="gray.800"
                borderRadius="2xl"
                boxShadow="0 8px 24px rgba(0,0,0,0.3)"
            >
                <Heading mb={4} fontSize={{base: "xl", md: "2xl"}} color="teal.300" lineClamp={2} wordBreak="break-word">
                    {about.title}
                </Heading>

                {about.description.map((text, index) => (
                    <Text
                        key={index}
                        mb={index < about.description.length - 1 ? 2 : 0}
                        color="gray.300"
                    >
                        {text}
                    </Text>
                ))}
            </Box>

            <SimpleGrid columns={{base: 1, md: 3}} gap={{base: 4, md: 6}} mt={8}>
                {[products, categories, stats].map(({title, description}) => (
                    <Box
                        key={title}
                        p={4}
                        bg="gray.700"
                        borderRadius="xl"
                        boxShadow="0 6px 18px rgba(0,0,0,0.25)"
                    >
                        <Heading fontSize="lg" color="teal.300" mb={2} lineClamp={2} wordBreak="break-word">
                            {title}
                        </Heading>
                        <Text color="gray.300">{description}</Text>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
};
