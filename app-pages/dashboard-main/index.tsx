import {Box, SimpleGrid, Heading, Text} from "@chakra-ui/react";
import {connectToDatabase} from "@/lib/mongoose";
import {auth} from "@/lib/auth";
import {StatsGrid} from "./stats-grid";
import {DASHBOARD_TEXTS, getDashboardData} from "./config";

const {
    welcome,
    about,
    sections: {products, categories, stats},
} = DASHBOARD_TEXTS;

export const Dashboard = async () => {
    await connectToDatabase();

    const session = await auth();
    const userId = session?.user?.id;

    const {stats: dashboardStats, fullName} = await getDashboardData(userId);

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
