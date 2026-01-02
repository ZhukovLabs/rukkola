"use client";

import React, {useEffect, useState, useCallback} from "react";
import {Box, Button, Flex, Heading, VStack} from "@chakra-ui/react";
import {FiUser} from "react-icons/fi";
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
                p={{base: 6, md: 8}}
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.800"
                boxShadow="0 0 40px rgba(0,0,0,0.8)"
            >
                <Heading mb={6} textAlign="center" fontSize={{base: "xl", md: "2xl"}} color="teal.400">
                    {pageTitle}
                </Heading>

                {alert && <LoginAlert {...alert} successTitle={successTitle} errorTitle={errorTitle}/>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <VStack gap={4}>
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
                            mt={2}
                            bg="teal.600"
                            color="white"
                            _hover={{bg: "teal.500"}}
                            _active={{bg: "teal.700"}}
                            _disabled={{bg: "gray.600", cursor: "not-allowed"}}
                            loading={isSubmitting}
                            disabled={!isValid && isSubmitting}
                            loadingText={loginButtonLoading}
                            aria-label={loginButton}
                        >
                            {loginButton}
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
};
