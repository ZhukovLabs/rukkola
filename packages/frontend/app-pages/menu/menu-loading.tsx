import { Box } from "@chakra-ui/react";
import Image from "next/image";
import { MenuLoader } from "@/app-pages/menu/menu-loader";

export default function Loading() {
    return (
        <Box display="flex" flexDirection="column" maxW="1440px" w="100%" mx="auto" p="20px">
            <Box mx="auto" w={{ base: "80%", sm: "60%", md: "400px" }} maxW="90vw" mb={{ base: 4, md: 6 }}>
                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={400}
                    height={200}
                    style={{ width: "100%", height: "auto", objectFit: "contain" }}
                    priority
                />
            </Box>

            <MenuLoader />
        </Box>
    );
}