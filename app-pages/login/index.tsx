"use client";

import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Flex,
    Heading,
    VStack,
} from "@chakra-ui/react";
import {FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle} from "react-icons/fi";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {loginSchema, type LoginFormData} from "./validation";
import {InputField} from "@/components/input-field";

export const LoginPage = () => {
    const {status} = useSession();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState<{
        message: string;
        status: "success" | "error";
    } | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    const showAlert = (message: string, status: "success" | "error" = "error") => {
        setAlert({message, status});
    };

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting, isValid},
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                return showAlert(result.error, "error");
            }

            if (result?.ok) {
                showAlert("Успешный вход", "success");
                router.replace("/dashboard");
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Ошибка при входе";
            showAlert(message, "error");
        }
    }

    if (status === "loading") {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.950">
                <Box color="teal.400">Загрузка...</Box>
            </Flex>
        );
    }

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="gray.950"
            p={4}
            data-testid="login-page"
        >
            <Box
                w="full"
                maxW="md"
                bg="gray.900"
                p={{base: 6, md: 8}}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.800"
                boxShadow="0 0 40px rgba(0,0,0,0.8)"
            >
                <Heading
                    mb={6}
                    textAlign="center"
                    fontSize={{base: "xl", md: "2xl"}}
                    color="teal.400"
                >
                    Вход
                </Heading>

                {alert && (
                    <Alert.Root
                        mb={4}
                        borderRadius="md"
                        p={3}
                        bg={alert.status === "success" ? "green.500" : "red.500"}
                        color="white"
                        role="alert"
                        aria-live="polite"
                    >
                        <Alert.Indicator>
                            <FiAlertCircle/>
                        </Alert.Indicator>
                        <Alert.Content>
                            <Alert.Title>
                                {alert.status === "success" ? "Успех" : "Ошибка"}
                            </Alert.Title>
                            <Alert.Description>{alert.message}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <VStack gap={4}>
                        <InputField
                            icon={<FiUser/>}
                            placeholder="Логин"
                            register={register("username")}
                            error={errors.username}
                        />
                        <InputField
                            icon={<FiLock/>}
                            placeholder="Пароль"
                            type={showPassword ? "text" : "password"}
                            register={register("password")}
                            error={errors.password}
                            rightElement={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="gray.300"
                                    _hover={{bg: "transparent", color: "teal.300"}}
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                    type="button"
                                >
                                    {showPassword ? <FiEyeOff/> : <FiEye/>}
                                </Button>
                            }
                        />

                        <Button
                            type="submit"
                            w="full"
                            mt={2}
                            bg="teal.600"
                            color="white"
                            _hover={{bg: "teal.500"}}
                            _active={{bg: "teal.700"}}
                            _disabled={{
                                bg: "gray.600",
                                cursor: "not-allowed",
                            }}
                            loading={isSubmitting}
                            disabled={!isValid && isSubmitting}
                            loadingText="Вход..."
                            aria-label="Войти в систему"
                        >
                            Войти
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}