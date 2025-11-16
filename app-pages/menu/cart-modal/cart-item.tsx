import {Box, Button, Flex, Image, Text} from "@chakra-ui/react";
import {motion} from "framer-motion";
import {ImCross} from 'react-icons/im';

const MotionBox = motion(Box);

type CartItemProps = {
    name: string;
    image?: string;
    size: string;
    price: number;
    handleRemove: () => void;
    indexDelay?: number;
}

export const CartItem = ({name, image, size, price, handleRemove, indexDelay = 0}: CartItemProps) => {
    const formattedPrice = price ? `${price.toFixed(2).replace(".", ",")} руб.` : "—"

    return (
        <MotionBox
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bg="rgba(255,255,255,0.03)"
            borderRadius="lg"
            border="1px solid transparent"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.25, delay: indexDelay * 0.04}}
            whileHover={{
                borderColor: "rgba(56,178,172,0.3)",
                boxShadow: "0 0 8px rgba(56,178,172,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
            }}
        >
            <Flex align="center" gap={3}>
                {image && (
                    <Image
                        src={image}
                        alt={name}
                        width={50}
                        height={50}
                        borderRadius="md"
                        objectFit="cover"
                        border="1px solid rgba(56,178,172,0.25)"
                    />
                )}
                <Box>
                    <Text color="whiteAlpha.900" fontWeight="medium" fontSize="sm">
                        {name}
                    </Text>
                    <Text color="gray.500" fontSize="xs">Размер: {size}</Text>
                </Box>
            </Flex>

            <Flex align="center" gap={3}>
                <Text color="teal.300" fontWeight="semibold" fontSize="sm">
                    {formattedPrice}
                </Text>
                <Button
                    size="xs"
                    variant="ghost"
                    color="gray.500"
                    _hover={{color: "red.400", bg: "rgba(255,0,0,0.06)"}}
                    onClick={handleRemove}
                >
                    <ImCross/>
                </Button>
            </Flex>
        </MotionBox>
    );
}