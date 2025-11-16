"use client";

import {Flex, Box, Heading, Input, Button, Text} from "@chakra-ui/react";
import {FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle} from "react-icons/fi";
import {motion, AnimatePresence} from "framer-motion";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {signIn, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useColorModeValue} from "@chakra-ui/color-mode";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const loginSchema = z.object({
    username: z.string().min(3, "Логин: минимум 3 символа"),
    password: z.string().min(5, "Пароль: минимум 5 символов"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const {status} = useSession();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const bgGradient = useColorModeValue("gray.50", "gray.900");
    const cardBg = "rgba(30, 30, 40, 0.7)";
    const inputBg = "rgba(40, 40, 50, 0.6)";

    useEffect(() => {
        if (status === "authenticated") router.push("/dashboard");
    }, [status, router]);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const showNotification = (message: string, type: "success" | "error") => {
        setNotification({message, type});
        setTimeout(() => setNotification(null), 4000);
    };

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                showNotification("Неверный логин или пароль", "error");
            } else {
                showNotification("Успешный вход!", "success");
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        } catch {
            showNotification("Ошибка сервера", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg={bgGradient} position="relative" overflow="hidden">
            {/* Анимированный фон */}
            <BackgroundBlobs/>

            {/* Уведомление */}
            <Notification notification={notification}/>

            {/* Карточка входа */}
            <MotionBox
                initial={{opacity: 0, scale: 0.9, y: 40}}
                animate={{opacity: 1, scale: 1, y: 0}}
                transition={{duration: 0.7, ease: "easeOut"}}
                w="full"
                maxW="md"
                mx={4}
                p={{base: 8, md: 10}}
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
                position="relative"
                _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    bgGradient: "linear(to-r, teal.400, cyan.400)",
                    filter: "blur(1px)",
                }}
            >
                <Flex direction="column" gap={8} align="center">
                    <Heading
                        fontSize={{base: "3xl", md: "4xl"}}
                        fontWeight="extrabold"
                        letterSpacing="tight"
                        bgGradient="linear(to-r, teal.300, cyan.300)"
                        bgClip="text"
                        position="relative"
                        _after={{
                            content: '""',
                            position: "absolute",
                            bottom: "-8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            w: "60px",
                            h: "3px",
                            bgGradient: "linear(to-r, teal.400, cyan.400)",
                            borderRadius: "full",
                        }}
                    >
                        Вход
                    </Heading>

                    <Flex as="form" direction="column" gap={6} w="full" onSubmit={handleSubmit(onSubmit)}>
                        <InputField
                            icon={<FiUser/>}
                            type="text"
                            placeholder="Логин"
                            register={register("username")}
                            error={errors.username}
                            delay={0.3}
                        />

                        <InputField
                            icon={<FiLock/>}
                            type={showPassword ? "text" : "password"}
                            placeholder="Пароль"
                            register={register("password")}
                            error={errors.password}
                            delay={0.4}
                            rightElement={
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowPassword(!showPassword)}
                                    color="gray.400"
                                    _hover={{color: "teal.300"}}
                                >
                                    {showPassword ? <FiEyeOff/> : <FiEye/>}
                                </Button>
                            }
                        />

                        <MotionButton
                            type="submit"
                            w="full"
                            py={7}
                            bgGradient="linear(to-r, teal.500, cyan.500)"
                            color="white"
                            fontWeight="bold"
                            fontSize="lg"
                            borderRadius="full"
                            boxShadow="0 10px 30px rgba(56, 178, 172, 0.4)"
                            _hover={{
                                bgGradient: "linear(to-r, teal.400, cyan.400)",
                                boxShadow: "0 15px 35px rgba(56, 178, 172, 0.5)",
                                transform: "translateY(-2px)",
                            }}
                            whileTap={{scale: 0.95}}
                            disabled={isLoading}
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.span key="loading" initial={{opacity: 0}} animate={{opacity: 1}}
                                                 exit={{opacity: 0}}>
                                        Входим...
                                    </motion.span>
                                ) : (
                                    <motion.span key="login" initial={{opacity: 0}} animate={{opacity: 1}}
                                                 exit={{opacity: 0}}>
                                        Войти
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </MotionButton>
                    </Flex>
                </Flex>
            </MotionBox>
        </Flex>
    );
}

// === Подкомпоненты ===

const BackgroundBlobs = () => (
    <>
        {[...Array(6)].map((_, i) => (
            <MotionBox
                key={i}
                position="absolute"
                w="300px"
                h="300px"
                borderRadius="full"
                filter="blur(80px)"
                opacity={0.15}
                bg={`hsl(${i * 60}, 70%, 60%)`}
                initial={{x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500}}
                animate={{
                    x: [null, Math.random() * 400 - 200],
                    y: [null, Math.random() * 400 - 200],
                }}
                transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
            />
        ))}
    </>
);

const Notification = ({notification}: { notification: { message: string; type: "success" | "error" } | null }) => (
    <AnimatePresence>
        {notification && (
            <MotionBox
                initial={{opacity: 0, y: -50, scale: 0.8}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, scale: 0.8}}
                position="fixed"
                top={6}
                left="50%"
                transform="translateX(-50%)"
                zIndex={9999}
                px={8}
                py={4}
                bg={notification.type === "success" ? "teal.500" : "red.500"}
                color="white"
                borderRadius="full"
                boxShadow="0 20px 40px rgba(0,0,0,0.4)"
                fontWeight="semibold"
                minW="320px"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255,255,255,0.1)"
            >
                {notification.message}
            </MotionBox>
        )}
    </AnimatePresence>
);

type InputFieldProps = {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    register: any;
    error?: any;
    delay: number;
    rightElement?: React.ReactNode;
};

const InputField = ({icon, type, placeholder, register, error, delay, rightElement}: InputFieldProps) => (
    <MotionBox initial={{opacity: 0, x: -50}} animate={{opacity: 1, x: 0}} transition={{delay}}>
        <Box position="relative">
            <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="gray.400" zIndex={1}>
                {icon}
            </Box>
            <Input
                {...register}
                type={type}
                placeholder={placeholder}
                pl={16}
                pr={rightElement ? 14 : 4}
                py={7}
                bg="rgba(40, 40, 50, 0.6)"
                border="1px solid"
                borderColor={error ? "red.400" : "rgba(255, 255, 255, 0.1)"}
                color="white"
                _placeholder={{color: "gray.500"}}
                _focus={{
                    bg: "rgba(50, 50, 60, 0.8)",
                    borderColor: error ? "red.400" : "teal.400",
                    boxShadow: error
                        ? "0 0 0 1px red.400, 0 0 20px rgba(248, 113, 113, 0.4)"
                        : "0 0 0 1px teal.400, 0 0 20px rgba(56, 178, 172, 0.4)",
                    transform: "translateY(-2px)",
                }}
                borderRadius="xl"
                transition="all 0.3s ease"
            />
            {rightElement && (
                <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                    {rightElement}
                </Box>
            )}
        </Box>

        <AnimatePresence>
            {error && (
                <MotionBox
                    initial={{height: 0, opacity: 0, y: -10}}
                    animate={{height: "auto", opacity: 1, y: 0}}
                    exit={{height: 0, opacity: 0, y: -10}}
                    overflow="hidden"
                    pl={4}
                    mt={1}
                >
                    <Flex align="center" gap={1.5}>
                        <FiAlertCircle color="red.400" size={14}/>
                        <Text fontSize="xs" color="red.400" fontWeight="medium">
                            {error.message}
                        </Text>
                    </Flex>
                </MotionBox>
            )}
        </AnimatePresence>
    </MotionBox>
);