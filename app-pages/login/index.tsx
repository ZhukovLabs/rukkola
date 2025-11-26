"use client";

import { Flex, Box, Heading, Input, Button, Text } from "@chakra-ui/react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {useColorModeValue} from "@chakra-ui/color-mode";

const loginSchema = z.object({
    username: z.string().min(3, "Логин: минимум 3 символа"),
    password: z.string().min(5, "Пароль: минимум 5 символов"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { status } = useSession();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const bg = useColorModeValue("gray.900", "gray.900");
    const cardBg = "rgba(20,20,30,0.85)";
    const inputBg = "rgba(30,30,40,0.7)";

    useEffect(() => {
        if (status === "authenticated") router.push("/dashboard");
    }, [status, router]);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const notify = (message: string, type: "success" | "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        const result = await signIn("credentials", { username: data.username, password: data.password, redirect: false });
        if (result?.error) notify("Неверный логин или пароль", "error");
        else {
            notify("Успешный вход!", "success");
            setTimeout(() => router.push("/dashboard"), 1200);
        }
        setIsLoading(false);
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg={bg}>
            <Box
                w="full"
                maxW="md"
                bg={cardBg}
                p={8}
                borderRadius="2xl"
                boxShadow="0 0 40px rgba(0,0,0,0.7)"
                border="1px solid rgba(255,255,255,0.05)"
            >
                <Heading mb={6} textAlign="center" fontSize="2xl" color="teal.400">
                    Вход
                </Heading>

                {notification && (
                    <Box mb={4} p={3} borderRadius="md" textAlign="center" bg={notification.type === "success" ? "green.500" : "red.500"} color="white">
                        {notification.message}
                    </Box>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <InputField
                        icon={<FiUser />}
                        placeholder="Логин"
                        register={register("username")}
                        error={errors.username}
                        bg={inputBg}
                    />

                    <InputField
                        icon={<FiLock />}
                        placeholder="Пароль"
                        type={showPassword ? "text" : "password"}
                        register={register("password")}
                        error={errors.password}
                        rightElement={
                            <Button size="sm"  onClick={() => setShowPassword(!showPassword)} color="gray.300">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </Button>
                        }
                        bg={inputBg}
                    />

                    <Button
                        type="submit"
                        w="full"
                        mt={4}
                        bgColor="teal.600"
                        color="white"
                        _hover={{ bgGradient: "linear(to-r, teal.300, cyan.300)" }}
                        loading={isLoading}
                        borderRadius="lg"
                        py={3}
                    >
                        Войти
                    </Button>
                </form>
            </Box>
        </Flex>
    );
};

type InputFieldProps = {
    icon: React.ReactNode;
    placeholder: string;
    type?: string;
    register: any;
    error?: any;
    rightElement?: React.ReactNode;
    bg?: string;
};

const InputField = ({ icon, placeholder, type = "text", register, error, rightElement, bg }: InputFieldProps) => (
    <Box mb={4}>
        <Box position="relative">
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" zIndex={1}>
                {icon}
            </Box>

            <Input
                {...register}
                type={type}
                placeholder={placeholder}
                pl={10}
                pr={rightElement ? 12 : 4}
                py={3}
                borderRadius="lg"
                bg={bg}
                borderColor={error ? "red.400" : "gray.600"}
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
            />

            {rightElement && (
                <Box position="absolute" right={3} top="50%" transform="translateY(-50%)" zIndex={1}>
                    {rightElement}
                </Box>
            )}
        </Box>

        {error && (
            <Flex align="center" gap={1} mt={1}>
                <FiAlertCircle color="red.400" size={14} />
                <Text fontSize="xs" color="red.400">{error.message}</Text>
            </Flex>
        )}
    </Box>
);

