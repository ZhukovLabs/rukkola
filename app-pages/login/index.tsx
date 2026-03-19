"use client";

import React, {useEffect, useState, useCallback} from "react";
import {Box, Button, Flex, Heading, VStack, Text, Icon} from "@chakra-ui/react";
import {FiUser, FiLock} from "react-icons/fi";
import {MdDashboard} from "react-icons/md";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {loginSchema, type LoginFormData} from "./validation";
import {InputField} from "@/components/input-field";
import {LOGIN_TEXTS} from "./config";
import {LoginAlert} from "./alert";
import {PasswordField} from "@/app-pages/login/password-field";

const {
    pageTitle,
    usernamePlaceholder,
    loginButton,
    loginButtonLoading,
    loading,
    alert: {successMessage, successTitle, errorTitle, defaultErrorMessage},
    showPassword: showPasswordText,
    hidePassword: hidePasswordText,
    passwordPlaceholder,
} = LOGIN_TEXTS;

export const LoginPage = () => {
    const {status} = useSession();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState<{ message: string; status: "success" | "error" } | null>(null);

    const toggleShowPassword = useCallback(() => setShowPassword((v) => !v), []);

    useEffect(() => {
        if (status === "authenticated") router.replace("/dashboard");
    }, [status, router]);

    const showAlert = useCallback((message: string, status: "success" | "error" = "error") => {
        setAlert({message, status});
    }, []);

    const {register, handleSubmit, formState: {errors, isSubmitting, isValid}} = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
        defaultValues: {username: "", password: ""},
    });

    const onSubmit = useCallback(async (data: LoginFormData) => {
        try {
            const result = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (result?.error) return showAlert(result.error, "error");
            if (result?.ok) {
                showAlert(successMessage, "success");
                router.replace("/dashboard");
            }
        } catch (error) {
            showAlert(error instanceof Error ? error.message : defaultErrorMessage, "error");
        }
    }, [router, showAlert, successMessage, defaultErrorMessage]);

    if (status === "loading") {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="gray.950">
                <Box color="teal.400">{loading}</Box>
            </Flex>
        );
    }

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.950" p={4} data-testid="login-page">
            <Box
                w="full"
                maxW="md"
                bg="gray.900"
                p={{base: 6, md: 10}}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.800"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.8)"
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="4px"
                    bgGradient="linear(to-r, teal.400, cyan.400)"
                />

                <VStack gap={6} mb={8}>
                    <Box
                        p={4}
                        bg="teal.900"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="teal.700"
                    >
                        <Icon as={MdDashboard} color="teal.300" boxSize={10}/>
                    </Box>
                    <VStack gap={1}>
                        <Heading mb={2} textAlign="center" fontSize={{base: "2xl", md: "3xl"}} color="white">
                            {pageTitle}
                        </Heading>
                        <Text color="gray.500" fontSize="sm">
                            Войдите для доступа к панели управления
                        </Text>
                    </VStack>
                </VStack>

                {alert && <LoginAlert {...alert} successTitle={successTitle} errorTitle={errorTitle}/>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <VStack gap={5}>
                        <InputField
                            icon={<FiUser/>}
                            placeholder={usernamePlaceholder}
                            register={register("username")}
                            error={errors.username}
                        />
                        <PasswordField
                            register={register("password")}
                            error={errors.password}
                            showPassword={showPassword}
                            toggleShowPassword={toggleShowPassword}
                            placeholder={passwordPlaceholder}
                            showPasswordText={showPasswordText}
                            hidePasswordText={hidePasswordText}
                        />
                        <Button
                            type="submit"
                            w="full"
                            size="lg"
                            mt={2}
                            bgGradient="linear(to-r, teal.500, teal.600)"
                            color="white"
                            _hover={{
                                bgGradient: "linear(to-r, teal.600, teal.700)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 25px rgba(56,178,172,0.3)",
                            }}
                            _active={{
                                bgGradient: "linear(to-r, teal.700, teal.800)",
                                transform: "translateY(0)",
                            }}
                            _disabled={{bg: "gray.600", cursor: "not-allowed"}}
                            loading={isSubmitting}
                            disabled={!isValid && isSubmitting}
                            loadingText={loginButtonLoading}
                            aria-label={loginButton}
                            boxShadow="0 4px 15px rgba(56,178,172,0.2)"
                        >
                            <Flex align="center" gap={2}>
                                <Icon as={FiLock} boxSize={4}/>
                                <Text>{loginButton}</Text>
                            </Flex>
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
};
